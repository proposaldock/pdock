import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  TextRun,
} from "docx";
import type { ProposalAnalysis, Workspace, WorkspaceReviewState } from "@/lib/types";

type ExportType = "summary" | "matrix" | "answers" | "pack";

const BRAND = "ProposalDock";
const BRAND_COLOR = "10B981";
const TEXT_COLOR = "111827";
const MUTED_COLOR = "6B7280";

function formatExportDate() {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function pageFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: `${BRAND}  |  `,
            color: MUTED_COLOR,
            size: 18,
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            color: MUTED_COLOR,
            size: 18,
          }),
        ],
      }),
    ],
  });
}

function coverTitle(text: string) {
  return new Paragraph({
    heading: HeadingLevel.TITLE,
    spacing: { before: 5200, after: 200 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: TEXT_COLOR,
        size: 40,
      }),
    ],
  });
}

function coverBrand() {
  return new Paragraph({
    spacing: { after: 180 },
    children: [
      new TextRun({
        text: BRAND,
        bold: true,
        color: BRAND_COLOR,
        size: 24,
      }),
    ],
  });
}

function coverMeta(label: string, value: string) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({
        text: `${label}: `,
        bold: true,
        color: MUTED_COLOR,
      }),
      new TextRun({
        text: value,
        color: TEXT_COLOR,
      }),
    ],
  });
}

function sectionTitle(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 120 },
    thematicBreak: true,
  });
}

function subsectionTitle(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 100 },
  });
}

function body(text: string) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text,
        color: TEXT_COLOR,
      }),
    ],
  });
}

function metaLine(label: string, value: string) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: `${label}: `,
        bold: true,
        color: MUTED_COLOR,
      }),
      new TextRun({
        text: value,
        color: TEXT_COLOR,
      }),
    ],
  });
}

function bullet(text: string) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 80 },
  });
}

function dividerSpacer() {
  return new Paragraph({
    border: {
      bottom: {
        color: "D1D5DB",
        style: BorderStyle.SINGLE,
        size: 4,
      },
    },
    spacing: { before: 140, after: 140 },
  });
}

function reviewedAnswers(analysis: ProposalAnalysis, reviewState: WorkspaceReviewState) {
  return analysis.requirements
    .map((requirement) => {
      const review = reviewState.requirements.find(
        (item) => item.requirementId === requirement.id,
      );
      if (!review?.draftAnswer.trim()) return null;

      return {
        requirement,
        review,
      };
    })
    .filter(Boolean) as Array<{
    requirement: ProposalAnalysis["requirements"][number];
    review: WorkspaceReviewState["requirements"][number];
  }>;
}

function coverSection(workspace: Workspace, exportLabel: string) {
  return {
    footers: { default: pageFooter() },
    children: [
      coverBrand(),
      coverTitle(exportLabel),
      coverMeta("Workspace", workspace.workspaceName),
      coverMeta("Client", workspace.clientName),
      coverMeta("Prepared", formatExportDate()),
      coverMeta("Document type", workspace.analysis.overview.documentType),
    ],
  };
}

async function executiveSummaryDoc(workspace: Workspace) {
  const doc = new Document({
    sections: [
      coverSection(workspace, "Executive Summary"),
      {
        footers: { default: pageFooter() },
        children: [
          sectionTitle("Executive Summary"),
          body(workspace.reviewState.executiveSummary),
          sectionTitle("Response Strategy"),
          body(workspace.reviewState.responseStrategy),
          sectionTitle("Proposal Context"),
          metaLine("Complexity", workspace.analysis.overview.estimatedComplexity),
          metaLine(
            "Submission deadline",
            workspace.analysis.overview.submissionDeadline || "Not specified",
          ),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

async function requirementMatrixDoc(workspace: Workspace) {
  const children: Paragraph[] = [
    titleSection(workspace, "Requirement Matrix"),
    body(
      "This matrix combines extracted requirements with the latest internal review decisions and draft answer guidance.",
    ),
  ];

  for (const requirement of workspace.analysis.requirements) {
    const review = workspace.reviewState.requirements.find(
      (item) => item.requirementId === requirement.id,
    );

    children.push(sectionTitle(`${requirement.id} - ${requirement.title}`));
    children.push(metaLine("Priority", requirement.priority));
    children.push(metaLine("Coverage", requirement.status));
    children.push(metaLine("Decision", review?.decision ?? "pending"));
    children.push(metaLine("Needs SME", requirement.needsSME ? "Yes" : "No"));
    children.push(body(`Requirement: ${requirement.description}`));
    children.push(body(`Review note: ${review?.note || "-"}`));
    children.push(body(`Draft answer: ${review?.draftAnswer || "-"}`));
  }

  const doc = new Document({
    sections: [
      coverSection(workspace, "Requirement Matrix"),
      {
        footers: { default: pageFooter() },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

async function reviewedAnswersDoc(workspace: Workspace) {
  const acceptedAnswers = reviewedAnswers(workspace.analysis, workspace.reviewState);

  const children: Paragraph[] = [
    titleSection(workspace, "Reviewed Answers"),
    body(
      "This export collects the current reviewed answer text drafted inside ProposalDock for direct handoff into a response document.",
    ),
  ];

  if (!acceptedAnswers.length) {
    children.push(body("No reviewed draft answers are available yet."));
  } else {
    for (const item of acceptedAnswers) {
      children.push(sectionTitle(`${item.requirement.id} - ${item.requirement.title}`));
      children.push(metaLine("Decision", item.review.decision));
      children.push(body(item.review.draftAnswer.trim()));
      if (item.review.note.trim()) {
        children.push(subsectionTitle("Internal Note"));
        children.push(body(item.review.note.trim()));
      }
      children.push(dividerSpacer());
    }
  }

  children.push(sectionTitle("Key Differentiators"));
  for (const item of workspace.analysis.draft.keyDifferentiators) {
    children.push(bullet(item));
  }

  const doc = new Document({
    sections: [
      coverSection(workspace, "Reviewed Answers"),
      {
        footers: { default: pageFooter() },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

async function responsePackDoc(workspace: Workspace) {
  const acceptedAnswers = reviewedAnswers(workspace.analysis, workspace.reviewState);

  const children: Paragraph[] = [
    titleSection(workspace, "Proposal Response Pack"),
    body(
      "This pack combines the current executive summary, response strategy, reviewed answers, risk highlights, and cited sources into one handoff document.",
    ),
    sectionTitle("Executive Summary"),
    body(workspace.reviewState.executiveSummary),
    sectionTitle("Response Strategy"),
    body(workspace.reviewState.responseStrategy),
    sectionTitle("Reviewed Answers"),
  ];

  if (!acceptedAnswers.length) {
    children.push(body("No reviewed draft answers are available yet."));
  } else {
    for (const item of acceptedAnswers) {
      children.push(subsectionTitle(`${item.requirement.id} - ${item.requirement.title}`));
      children.push(metaLine("Decision", item.review.decision));
      children.push(body(item.review.draftAnswer.trim()));
      if (item.review.note.trim()) {
        children.push(body(`Internal note: ${item.review.note.trim()}`));
      }
    }
  }

  children.push(sectionTitle("Risk Highlights"));
  for (const risk of workspace.analysis.risks) {
    children.push(subsectionTitle(risk.title));
    children.push(metaLine("Severity", risk.severity));
    children.push(body(risk.description));
    children.push(body(`Recommendation: ${risk.recommendation}`));
  }

  children.push(sectionTitle("Evidence Sources"));
  for (const source of workspace.analysis.sources) {
    children.push(subsectionTitle(`${source.id} - ${source.label}`));
    children.push(
      metaLine(
        "Origin",
        source.sourceType === "knowledge_asset"
          ? `Knowledge asset${source.assetTitle ? `: ${source.assetTitle}` : ""}`
          : `Document${source.documentLabel ? `: ${source.documentLabel}` : ""}`,
      ),
    );
    children.push(body(source.content || source.excerpt));
  }

  const doc = new Document({
    sections: [
      coverSection(workspace, "Proposal Response Pack"),
      {
        footers: { default: pageFooter() },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

function titleSection(workspace: Workspace, sectionName: string) {
  return new Paragraph({
    spacing: { after: 180 },
    children: [
      new TextRun({
        text: `${sectionName}  |  ${workspace.clientName}`,
        bold: true,
        color: BRAND_COLOR,
        size: 28,
      }),
    ],
  });
}

export async function buildWorkspaceExportDocx(workspace: Workspace, type: ExportType) {
  if (type === "summary") return executiveSummaryDoc(workspace);
  if (type === "matrix") return requirementMatrixDoc(workspace);
  if (type === "answers") return reviewedAnswersDoc(workspace);
  return responsePackDoc(workspace);
}

export function getExportFilename(workspace: Workspace, type: ExportType) {
  const base = workspace.workspaceName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");

  if (type === "summary") return `${base || "proposaldock"}-executive-summary.docx`;
  if (type === "matrix") return `${base || "proposaldock"}-requirement-matrix.docx`;
  if (type === "answers") return `${base || "proposaldock"}-reviewed-answers.docx`;
  return `${base || "proposaldock"}-response-pack.docx`;
}
