import { readFileSync } from "node:fs";
import mammoth from "mammoth";
import { createRequire } from "node:module";
import path from "node:path";
import { ACCEPTED_UPLOAD_TEXT } from "@/lib/document-constants";

const MAX_DOCUMENT_CHARS = 18_000;
const require = createRequire(import.meta.url);
let cachedPdfWorkerDataUrl: string | null = null;

function ensurePdfRuntimePolyfills() {
  if (globalThis.DOMMatrix && globalThis.DOMPoint && globalThis.DOMRect) {
    return;
  }

  const geometryModule = require("../node_modules/@napi-rs/canvas/geometry.js");
  globalThis.DOMMatrix ??= geometryModule.DOMMatrix;
  globalThis.DOMPoint ??= geometryModule.DOMPoint;
  globalThis.DOMRect ??= geometryModule.DOMRect;
}

function getPdfWorkerDataUrl() {
  if (cachedPdfWorkerDataUrl) {
    return cachedPdfWorkerDataUrl;
  }

  const workerSource = readFileSync(
    path.join(
      process.cwd(),
      "node_modules",
      "pdfjs-dist",
      "legacy",
      "build",
      "pdf.worker.min.mjs",
    ),
    "utf8",
  );
  cachedPdfWorkerDataUrl = `data:text/javascript;base64,${Buffer.from(workerSource).toString("base64")}`;
  return cachedPdfWorkerDataUrl;
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
    const pdfParseModule = require("../node_modules/pdf-parse/dist/pdf-parse/cjs/index.cjs") as {
      PDFParse: {
        setWorker: (workerUrl: string) => string;
        new (options: { data: Buffer }): {
          getText: () => Promise<{ text: string }>;
          destroy: () => Promise<void>;
        };
      };
    };
    const { PDFParse } = pdfParseModule;
    PDFParse.setWorker(getPdfWorkerDataUrl());
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
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
