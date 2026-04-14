import mammoth from "mammoth";
import { createRequire } from "node:module";
import { ACCEPTED_UPLOAD_TEXT } from "@/lib/document-constants";

const MAX_DOCUMENT_CHARS = 18_000;
const require = createRequire(import.meta.url);

function ensurePdfRuntimePolyfills() {
  if (globalThis.DOMMatrix && globalThis.DOMPoint && globalThis.DOMRect) {
    return;
  }

  const geometryModule = require("../node_modules/@napi-rs/canvas/geometry.js");
  globalThis.DOMMatrix ??= geometryModule.DOMMatrix;
  globalThis.DOMPoint ??= geometryModule.DOMPoint;
  globalThis.DOMRect ??= geometryModule.DOMRect;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\u0000/g, "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function summarizeExcerpt(value: string) {
  return value.slice(0, 220).trim();
}

export function getAcceptedUploadText() {
  return ACCEPTED_UPLOAD_TEXT;
}

async function parsePdfBuffer(buffer: Buffer, filename: string) {
  try {
    ensurePdfRuntimePolyfills();
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const pdfjsWorker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
    const runtimeGlobal = globalThis as typeof globalThis & {
      pdfjsWorker?: typeof pdfjsWorker;
    };

    runtimeGlobal.pdfjsWorker ??= pdfjsWorker;

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      disableFontFace: true,
      stopAtErrors: false,
    });
    const pdfDocument = await loadingTask.promise;
    const pageTexts: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .trim();

      if (pageText) {
        pageTexts.push(pageText);
      }

      page.cleanup();
    }

    await loadingTask.destroy();
    return pageTexts.join("\n\n");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown PDF parsing failure.";

    throw new Error(
      `${filename}: PDF parsing is not available in the current server runtime. Paste the brief text directly or upload DOCX/TXT instead. (${message})`,
    );
  }
}

export async function parseUploadedDocument(file: File) {
  const mimeType = file.type || "application/octet-stream";
  const lowerName = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  let extracted = "";

  if (lowerName.endsWith(".pdf") || mimeType === "application/pdf") {
    extracted = await parsePdfBuffer(buffer, file.name);
  } else if (
    lowerName.endsWith(".docx") ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    extracted = result.value;
  } else if (
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md") ||
    lowerName.endsWith(".rtf") ||
    mimeType.startsWith("text/")
  ) {
    extracted = buffer.toString("utf8");
  } else {
    throw new Error(
      `${file.name}: unsupported file type. Upload PDF, DOCX, TXT, MD, or RTF.`,
    );
  }

  const content = normalizeWhitespace(extracted).slice(0, MAX_DOCUMENT_CHARS);

  if (!content) {
    throw new Error(`${file.name}: no readable text was found in the uploaded file.`);
  }

  return {
    id: crypto.randomUUID(),
    filename: file.name,
    mimeType,
    kind: "upload" as const,
    content,
    excerpt: summarizeExcerpt(content),
    characterCount: content.length,
  };
}

export function createPastedDocument(content: string) {
  const normalized = normalizeWhitespace(content).slice(0, MAX_DOCUMENT_CHARS);

  return {
    id: crypto.randomUUID(),
    filename: "Pasted brief",
    mimeType: "text/plain",
    kind: "pasted" as const,
    content: normalized,
    excerpt: summarizeExcerpt(normalized),
    characterCount: normalized.length,
  };
}
