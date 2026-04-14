import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ACCEPTED_UPLOAD_TEXT } from "@/lib/document-constants";

const MAX_DOCUMENT_CHARS = 18_000;

function normalizeWhitespace(value: string) {
  return value.replace(/\u0000/g, "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function summarizeExcerpt(value: string) {
  return value.slice(0, 220).trim();
}

export function getAcceptedUploadText() {
  return ACCEPTED_UPLOAD_TEXT;
}

export async function parseUploadedDocument(file: File) {
  const mimeType = file.type || "application/octet-stream";
  const lowerName = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  let extracted = "";

  if (lowerName.endsWith(".pdf") || mimeType === "application/pdf") {
    PDFParse.setWorker(
      pathToFileURL(
        path.join(
          process.cwd(),
          "node_modules",
          "pdf-parse",
          "dist",
          "pdf-parse",
          "esm",
          "pdf.worker.mjs",
        ),
      ).href,
    );
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    extracted = result.text;
    await parser.destroy();
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
