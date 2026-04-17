import type { WorkspaceInput } from "@/lib/types";

export type SourceChunk = {
  id: string;
  label: string;
  excerpt: string;
  content: string;
  sourceType: "document" | "knowledge_asset" | "company_knowledge";
  documentId?: string;
  documentLabel?: string;
  assetId?: string;
  assetTitle?: string;
};

type ChunkableItem = {
  id: string;
  label: string;
  content: string;
  sourceType: "document" | "knowledge_asset" | "company_knowledge";
  documentId?: string;
  documentLabel?: string;
  assetId?: string;
  assetTitle?: string;
};

const MAX_CHUNK_CHARS = 950;
const MIN_CHUNK_CHARS = 280;

function normalizeParagraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function sliceLongParagraph(paragraph: string) {
  if (paragraph.length <= MAX_CHUNK_CHARS) return [paragraph];

  const slices: string[] = [];
  let start = 0;

  while (start < paragraph.length) {
    const end = Math.min(start + MAX_CHUNK_CHARS, paragraph.length);
    slices.push(paragraph.slice(start, end).trim());
    start = end;
  }

  return slices.filter(Boolean);
}

function buildChunkableItems(input: WorkspaceInput): ChunkableItem[] {
  const manualKnowledgeItems: ChunkableItem[] = input.companyKnowledge.trim()
    ? [
        {
          id: "manual-company-knowledge",
          label: "Background material",
          content: input.companyKnowledge,
          sourceType: "company_knowledge",
        },
      ]
    : [];

  const documentItems: ChunkableItem[] = input.documents.map((document) => ({
    id: document.id,
    label: document.filename,
    content: document.content,
    sourceType: "document",
    documentId: document.id,
    documentLabel: document.filename,
  }));

  const knowledgeItems: ChunkableItem[] = (input.knowledgeAssets ?? []).map((asset) => ({
    id: asset.id,
    label: asset.title,
    content: asset.content,
    sourceType: "knowledge_asset",
    assetId: asset.id,
    assetTitle: asset.title,
  }));

  return [...manualKnowledgeItems, ...documentItems, ...knowledgeItems];
}

export function buildSourceChunks(input: WorkspaceInput) {
  const chunks: SourceChunk[] = [];
  let sourceIndex = 1;

  for (const item of buildChunkableItems(input)) {
    const paragraphs = normalizeParagraphs(item.content).flatMap(sliceLongParagraph);
    let current = "";
    let chunkIndex = 1;

    for (const paragraph of paragraphs) {
      const next = current ? `${current}\n\n${paragraph}` : paragraph;

      if (next.length <= MAX_CHUNK_CHARS) {
        current = next;
        continue;
      }

      if (current) {
        chunks.push({
          id: `SRC-${String(sourceIndex).padStart(3, "0")}`,
          label: `${item.label} - Chunk ${chunkIndex}`,
          excerpt: current.slice(0, 240).trim(),
          content: current,
          sourceType: item.sourceType,
          documentId: item.documentId,
          documentLabel: item.documentLabel,
          assetId: item.assetId,
          assetTitle: item.assetTitle,
        });
        sourceIndex += 1;
        chunkIndex += 1;
      }

      current = paragraph;
    }

    if (current) {
      const previous = chunks.at(-1);
      const shouldMerge =
        current.length < MIN_CHUNK_CHARS &&
        previous?.sourceType === item.sourceType &&
        previous.documentId === item.documentId &&
        previous.assetId === item.assetId;

      if (shouldMerge && previous) {
        previous.content = `${previous.content}\n\n${current}`;
        previous.excerpt = previous.content.slice(0, 240).trim();
      } else {
        chunks.push({
          id: `SRC-${String(sourceIndex).padStart(3, "0")}`,
          label: `${item.label} - Chunk ${chunkIndex}`,
          excerpt: current.slice(0, 240).trim(),
          content: current,
          sourceType: item.sourceType,
          documentId: item.documentId,
          documentLabel: item.documentLabel,
          assetId: item.assetId,
          assetTitle: item.assetTitle,
        });
        sourceIndex += 1;
      }
    }
  }

  return chunks;
}
