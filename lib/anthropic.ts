import Anthropic from "@anthropic-ai/sdk";
import type {
  Message,
  MessageCreateParamsNonStreaming,
} from "@anthropic-ai/sdk/resources";
import { proposalAnalysisSchema } from "@/lib/analysis-schema";
import { buildSourceChunks } from "@/lib/source-chunks";
import type {
  ProposalAnalysis,
  ProposalGenerateMode,
  ProposalRewriteMode,
  ProposalSection,
  Workspace,
  WorkspaceInput,
} from "@/lib/types";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const MAX_MATERIAL_CHARS = 55_000;
const MAX_ANTHROPIC_RETRIES = 3;
const ANTHROPIC_RETRY_BASE_MS = 1200;

export class AIServiceError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "AIServiceError";
    this.status = status;
  }
}

function compactMaterial(input: WorkspaceInput) {
  const sourceChunks = buildSourceChunks(input);
  const knowledgeAssets = (input.knowledgeAssets ?? [])
    .map(
      (asset) =>
        `<asset id="${asset.id}" category="${asset.category}" title="${asset.title}">\n${asset.content.trim()}\n</asset>`,
    )
    .join("\n\n");
  const documents = sourceChunks
    .map(
      (source) =>
        `<source id="${source.id}" label="${source.label}" type="${source.sourceType}" document="${source.documentLabel ?? ""}" asset="${source.assetTitle ?? ""}">\n${source.content.trim()}\n</source>`,
    )
    .join("\n\n");

  const combined = [
    `<workspace>${input.workspaceName}</workspace>`,
    `<client>${input.clientName}</client>`,
    `<company_knowledge_manual>\n${input.companyKnowledge.trim()}\n</company_knowledge_manual>`,
    knowledgeAssets
      ? `<knowledge_base_assets>\n${knowledgeAssets}\n</knowledge_base_assets>`
      : "",
    input.instructions
      ? `<special_instructions>\n${input.instructions.trim()}\n</special_instructions>`
      : "",
    `<rfp_material>\n${documents || "No uploaded document text was provided."}\n</rfp_material>`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    material: combined.slice(0, MAX_MATERIAL_CHARS),
    sourceChunks,
  };
}

function extractJson(text: string) {
  const trimmed = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Claude did not return JSON.");
  }

  return match[0];
}

function normalizeJsonForRetry(rawJson: string) {
  return rawJson
    .replace(/\uFEFF/g, "")
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

function parseModelJson(text: string) {
  const extracted = extractJson(text);

  try {
    return JSON.parse(extracted);
  } catch {
    return JSON.parse(normalizeJsonForRetry(extracted));
  }
}

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY. Add it to .env.local and retry.");
  }

  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

function getAnthropicModel() {
  return process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAnthropicOverloaded(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const status = "status" in error ? error.status : undefined;
  const body = "body" in error ? error.body : undefined;
  const message = error instanceof Error ? error.message : "";
  const bodyType =
    body && typeof body === "object" && "error" in body && body.error && typeof body.error === "object"
      ? "type" in body.error
        ? body.error.type
        : undefined
      : undefined;

  return status === 529 || bodyType === "overloaded_error" || message.includes("overloaded_error");
}

function isAnthropicRetryable(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const status = "status" in error ? error.status : undefined;
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504 || isAnthropicOverloaded(error);
}

function toAIServiceError(error: unknown, fallbackMessage: string) {
  if (error instanceof AIServiceError) {
    return error;
  }

  if (isAnthropicOverloaded(error)) {
    return new AIServiceError(
    "Claude is temporarily overloaded. ProposalDock retried automatically, but the service is still busy. Please wait a few seconds and try again.",
      503,
    );
  }

  if (error && typeof error === "object" && "status" in error && error.status === 429) {
    return new AIServiceError(
      "Claude rate-limited the request. Please wait a moment and retry.",
      429,
    );
  }

  return new AIServiceError(
    error instanceof Error ? error.message : fallbackMessage,
    500,
  );
}

async function createMessageWithRetry(
  anthropic: Anthropic,
  params: MessageCreateParamsNonStreaming,
  fallbackMessage: string,
): Promise<Message> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_ANTHROPIC_RETRIES; attempt += 1) {
    try {
      return await anthropic.messages.create({
        ...params,
        stream: false,
      });
    } catch (error) {
      lastError = error;

      if (attempt === MAX_ANTHROPIC_RETRIES || !isAnthropicRetryable(error)) {
        break;
      }

      const delay = ANTHROPIC_RETRY_BASE_MS * 2 ** attempt;
      await sleep(delay);
    }
  }

  throw toAIServiceError(lastError, fallbackMessage);
}

function deriveFallbackSectionSourceRefs(input: {
  workspace: Workspace;
  section: ProposalSection;
}) {
  const refs = new Set<string>();
  const allowedSourceIds = new Set(input.workspace.analysis.sources.map((source) => source.id));

  for (const sourceRef of input.section.sourceRefs) {
    if (allowedSourceIds.has(sourceRef)) refs.add(sourceRef);
  }

  for (const requirementId of input.section.sourceRequirementIds) {
    const requirement = input.workspace.analysis.requirements.find(
      (item) => item.id === requirementId,
    );

    for (const sourceRef of requirement?.sourceRefs ?? []) {
      if (allowedSourceIds.has(sourceRef)) refs.add(sourceRef);
    }
  }

  for (const sourceRef of input.workspace.analysis.draft.sourceRefs ?? []) {
    if (allowedSourceIds.has(sourceRef)) refs.add(sourceRef);
  }

  if (refs.size === 0) {
    for (const source of input.workspace.analysis.sources.slice(0, 4)) {
      refs.add(source.id);
    }
  }

  return [...refs];
}

export async function analyzeProposal(input: WorkspaceInput): Promise<ProposalAnalysis> {
  const anthropic = getAnthropicClient();
  const model = getAnthropicModel();
  const { material, sourceChunks } = compactMaterial(input);
  const sourceCatalog = sourceChunks
    .map(
      (source) =>
        `${source.id} | ${source.label} | ${source.excerpt.replace(/\s+/g, " ").trim()}`,
    )
    .join("\n");

  const message = await createMessageWithRetry(anthropic, {
    model,
    max_tokens: 4200,
    temperature: 0.2,
    system: [
      "You are an expert proposal analyst for B2B service firms.",
      "Analyze RFPs, briefs, and client requests as a workflow product, not as a chatbot.",
      "Extract requirements conservatively and separate facts from assumptions.",
      "Mark uncertain items clearly. Prefer grounded output tied to source material.",
      "Do not invent capabilities the company has not provided.",
      "Keep the output concise, professional, and structured.",
      "Return strict JSON only. Do not wrap it in markdown.",
    ].join(" "),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Return JSON matching exactly this TypeScript shape:
{
  "overview": {
    "documentType": "string",
    "submissionDeadline": "string | null",
    "estimatedComplexity": "low | medium | high",
    "summary": "string"
  },
  "requirements": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "priority": "high | medium | low",
      "status": "covered | partially_covered | missing",
      "needsSME": true,
      "sourceRefs": ["string"]
    }
  ],
  "risks": [
    {
      "title": "string",
      "severity": "high | medium | low",
      "description": "string",
      "recommendation": "string",
      "sourceRefs": ["string"]
    }
  ],
  "draft": {
    "executiveSummary": "string",
    "responseStrategy": "string",
    "keyDifferentiators": ["string"],
    "openQuestions": ["string"],
    "sourceRefs": ["string"]
  },
  "sources": [
    {
      "id": "string",
      "label": "string",
      "excerpt": "string",
      "content": "string",
      "sourceType": "document | knowledge_asset",
      "documentId": "string",
      "documentLabel": "string",
      "assetId": "string",
      "assetTitle": "string"
    }
  ]
}

Rules:
- Use requirement IDs like REQ-001.
- sourceRefs must point only to source ids from the provided source catalog.
- If a date is not explicit, use null.
- Status should compare RFP needs with provided company knowledge.
- Treat manual company knowledge and selected knowledge base assets as the only approved capability sources.
- Missing or uncertain capabilities must be marked missing or partially_covered, never covered.
- Keep 5-10 requirements unless the source material clearly needs fewer.
- Risks must include sourceRefs.
- Draft must include sourceRefs for the evidence behind the executive summary and strategy.
- Return only cited sources in the sources array.
- Preserve cited source ids, labels, excerpts, content, sourceType, documentId, documentLabel, assetId, and assetTitle exactly from the source catalog.

Source catalog:
${sourceCatalog}

Material:
${material}`,
          },
        ],
      },
    ],
  }, "Analysis failed. Please retry.");

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const json = parseModelJson(text);
  const parsed = proposalAnalysisSchema.parse(json);
  const sourceMap = new Map(
    sourceChunks.map((source) => [
      source.id,
      {
        id: source.id,
        label: source.label,
        excerpt: source.excerpt,
        content: source.content,
        sourceType: source.sourceType,
        documentId: source.documentId,
        documentLabel: source.documentLabel,
        assetId: source.assetId,
        assetTitle: source.assetTitle,
      },
    ]),
  );

  const referencedIds = new Set<string>();
  for (const requirement of parsed.requirements) {
    for (const ref of requirement.sourceRefs) referencedIds.add(ref);
  }
  for (const risk of parsed.risks) {
    for (const ref of risk.sourceRefs) referencedIds.add(ref);
  }
  for (const ref of parsed.draft.sourceRefs) {
    referencedIds.add(ref);
  }

  const normalizedSources = [...referencedIds]
    .map((id) => sourceMap.get(id))
    .filter((source): source is NonNullable<typeof source> => Boolean(source));

  return {
    ...parsed,
    sources: normalizedSources,
  };
}

function rewriteInstruction(mode: ProposalRewriteMode) {
  if (mode === "tighten") {
    return "Tighten the section for clarity and concision. Remove filler, repetition, and vague phrasing while preserving meaning.";
  }

  if (mode === "executive") {
    return "Rewrite the section for an executive audience. Make it sharper, more outcome-oriented, and easier to scan while keeping it credible.";
  }

  return "Rewrite the section to be more compliance-safe and precise. Avoid unsupported claims, make assumptions explicit, and keep the tone professional and grounded.";
}

export async function rewriteProposalSection(input: {
  workspace: Workspace;
  section: ProposalSection;
  mode: ProposalRewriteMode;
}) {
  const anthropic = getAnthropicClient();
  const model = getAnthropicModel();
  const sourceCatalog = input.workspace.analysis.sources
    .map(
      (source) =>
        `${source.id} | ${source.label} | ${source.excerpt.replace(/\s+/g, " ").trim()}`,
    )
    .join("\n");
  const relevantRequirements = input.workspace.analysis.requirements.filter((requirement) =>
    input.section.sourceRequirementIds.includes(requirement.id),
  );
  const relevantReviews = input.workspace.reviewState.requirements.filter((review) =>
    input.section.sourceRequirementIds.includes(review.requirementId),
  );

  const message = await createMessageWithRetry(anthropic, {
    model,
    max_tokens: 1200,
    temperature: 0.2,
    system: [
      "You are an expert proposal writer for B2B service firms.",
      "You are revising one proposal section inside a structured workflow product, not chatting with the user.",
      "Preserve grounded claims only. Do not invent capabilities, delivery promises, certifications, case studies, or scope coverage that are not supported by the provided material.",
      "Keep the output concise, professional, and ready to paste back into the proposal draft.",
      "Return JSON only in the shape {\"content\":\"string\",\"sourceRefs\":[\"string\"]}.",
    ].join(" "),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Rewrite mode:
${input.mode}

Instruction:
${rewriteInstruction(input.mode)}

Workspace:
${input.workspace.workspaceName}

Client:
${input.workspace.clientName}

Section title:
${input.section.title}

Current section content:
${input.section.content}

Approved company knowledge:
${input.workspace.companyKnowledge}

Special instructions:
${input.workspace.instructions || "None provided"}

Relevant reviewed requirements:
${JSON.stringify(relevantRequirements, null, 2)}

Relevant review notes and draft answers:
${JSON.stringify(relevantReviews, null, 2)}

Available cited source catalog:
${sourceCatalog || "No source catalog available."}

Return strict JSON only:
{"content":"string","sourceRefs":["string"]}`,
          },
        ],
      },
    ],
  }, "Failed to rewrite proposal section.");

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const json = parseModelJson(text) as {
    content?: string;
    sourceRefs?: string[];
  };
  const content = json.content?.trim();

  if (!content) {
    throw new Error("Claude did not return rewritten section content.");
  }

  const allowedSourceIds = new Set(input.workspace.analysis.sources.map((source) => source.id));
  const modelSourceRefs = (json.sourceRefs ?? []).filter((ref) => allowedSourceIds.has(ref));
  const sourceRefs =
    modelSourceRefs.length > 0
      ? modelSourceRefs
      : deriveFallbackSectionSourceRefs(input);

  return { content, sourceRefs };
}

export async function generateProposalSection(input: {
  workspace: Workspace;
  section: ProposalSection;
  mode: ProposalGenerateMode;
}) {
  const anthropic = getAnthropicClient();
  const model = getAnthropicModel();
  const acceptedRequirements = input.workspace.analysis.requirements.filter((requirement) => {
    const review = input.workspace.reviewState.requirements.find(
      (item) => item.requirementId === requirement.id,
    );

    return review?.decision === "accepted";
  });
  const acceptedReviews = input.workspace.reviewState.requirements.filter(
    (review) => review.decision === "accepted",
  );
  const relevantRequirements = input.section.sourceRequirementIds.length
    ? acceptedRequirements.filter((requirement) =>
        input.section.sourceRequirementIds.includes(requirement.id),
      )
    : acceptedRequirements;
  const relevantReviews = input.section.sourceRequirementIds.length
    ? acceptedReviews.filter((review) =>
        input.section.sourceRequirementIds.includes(review.requirementId),
      )
    : acceptedReviews;
  const sourceCatalog = input.workspace.analysis.sources
    .map(
      (source) =>
        `${source.id} | ${source.label} | ${source.excerpt.replace(/\s+/g, " ").trim()}`,
    )
    .join("\n");

  const message = await createMessageWithRetry(anthropic, {
    model,
    max_tokens: 1400,
    temperature: 0.25,
    system: [
      "You are an expert proposal writer for B2B service firms.",
      "You are creating one proposal section inside a workflow product, not chatting with the user.",
      "Use only grounded information from approved company knowledge, accepted reviewed answers, and cited source context.",
      "Do not invent capabilities, staffing models, certifications, dates, metrics, or commitments.",
      "When information is uncertain, phrase it carefully and make assumptions explicit.",
      "Keep the result concise, professional, and ready to edit inside a proposal draft.",
      'Return JSON only in the shape {"content":"string","sourceRefs":["string"]}.',
    ].join(" "),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Generation mode:
${input.mode}

Workspace:
${input.workspace.workspaceName}

Client:
${input.workspace.clientName}

Section title:
${input.section.title}

Current section content:
${input.section.content || "No content yet."}

Approved company knowledge:
${input.workspace.companyKnowledge}

Selected knowledge base assets:
${JSON.stringify(
  (input.workspace.knowledgeAssets ?? []).map((asset) => ({
    title: asset.title,
    category: asset.category,
    excerpt: asset.excerpt,
  })),
  null,
  2,
)}

Special instructions:
${input.workspace.instructions || "None provided"}

Proposal overview:
${JSON.stringify(input.workspace.analysis.overview, null, 2)}

Relevant accepted requirements:
${JSON.stringify(relevantRequirements, null, 2)}

Accepted review notes and draft answers:
${JSON.stringify(relevantReviews, null, 2)}

Available cited source catalog:
${sourceCatalog || "No source catalog available."}

Write a strong first draft for this section title using the best grounded material available.
Prefer short paragraphs over bullets unless bullets are clearly better for the content.

Return strict JSON only:
{"content":"string","sourceRefs":["string"]}`,
          },
        ],
      },
    ],
  }, "Failed to generate proposal section.");

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const json = parseModelJson(text) as {
    content?: string;
    sourceRefs?: string[];
  };
  const content = json.content?.trim();

  if (!content) {
    throw new Error("Claude did not return generated section content.");
  }

  const allowedSourceIds = new Set(input.workspace.analysis.sources.map((source) => source.id));
  const modelSourceRefs = (json.sourceRefs ?? []).filter((ref) => allowedSourceIds.has(ref));
  const sourceRefs =
    modelSourceRefs.length > 0
      ? modelSourceRefs
      : deriveFallbackSectionSourceRefs(input);

  return { content, sourceRefs };
}
