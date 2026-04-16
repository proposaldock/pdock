import { NextResponse } from "next/server";
import { AIServiceError, analyzeProposal } from "@/lib/anthropic";
import { requireApiUser } from "@/lib/authz";
import {
  createPastedDocument,
  parseUploadedDocument,
} from "@/lib/document-parser";
import { storeUploadedFile } from "@/lib/file-storage";
import { getPlanEntitlements, getPlanGuardMessage } from "@/lib/entitlements";
import { createMarketingEvent } from "@/lib/marketing-analytics";
import {
  createActivityEntry,
  getKnowledgeAssetsByIds,
  getUserAccountById,
  listWorkspacesForUser,
  saveWorkspace,
} from "@/lib/store";
import type { Workspace, WorkspaceInput } from "@/lib/types";

export const runtime = "nodejs";

function cleanText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function readDocuments(
  formData: FormData,
): Promise<WorkspaceInput["documents"]> {
  const files = formData.getAll("documents").filter((value) => value instanceof File);

  return Promise.all(
    files
      .filter((file) => file.size > 0)
      .map(async (file) => {
        const [parsed, stored] = await Promise.all([
          parseUploadedDocument(file),
          storeUploadedFile(file, { folder: "workspace-documents" }),
        ]);

        return {
          ...parsed,
          fileSize: stored.fileSize,
          storageProvider: stored.storageProvider,
          storagePath: stored.storagePath,
          storageUrl: stored.storageUrl,
        };
      }),
  );
}

export async function GET() {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const workspaces = await listWorkspacesForUser(user.id);
  return NextResponse.json({ workspaces });
}

export async function POST(request: Request) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const account = await getUserAccountById(user.id);
    if (!account) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const entitlements = getPlanEntitlements(account.billing);
    const existingWorkspaces = await listWorkspacesForUser(user.id);
    const ownedWorkspaceCount = existingWorkspaces.filter(
      (workspace) => workspace.ownerId === user.id,
    ).length;

    if (ownedWorkspaceCount >= entitlements.workspaceLimit) {
      return NextResponse.json(
        { error: getPlanGuardMessage("workspace_limit") },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const workspaceName = cleanText(formData.get("workspaceName"));
    const clientName = cleanText(formData.get("clientName"));
    const companyKnowledge = cleanText(formData.get("companyKnowledge"));
    const instructions = cleanText(formData.get("instructions"));
    const pastedBrief = cleanText(formData.get("pastedBrief"));
    const selectedKnowledgeAssetIds = formData
      .getAll("knowledgeAssetIds")
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);
    const documents = await readDocuments(formData);
    const knowledgeAssets = await getKnowledgeAssetsByIds(
      selectedKnowledgeAssetIds,
      user.id,
    );

    if (pastedBrief) {
      documents.unshift(createPastedDocument(pastedBrief));
    }

    if (!workspaceName || !clientName) {
      return NextResponse.json(
        { error: "Workspace name and client name are required." },
        { status: 400 },
      );
    }

    if (!companyKnowledge) {
      return NextResponse.json(
        { error: "Approved company knowledge is required." },
        { status: 400 },
      );
    }

    if (documents.length === 0) {
      return NextResponse.json(
        { error: "Upload at least one document or paste RFP text." },
        { status: 400 },
      );
    }

    const input: WorkspaceInput = {
      visibility: "private",
      workspaceName,
      clientName,
      documents,
      companyKnowledge,
      instructions,
      knowledgeAssets,
    };

    const now = new Date().toISOString();
    const analysis = await analyzeProposal(input);
    const workspace: Workspace = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...input,
      analysis,
      reviewState: {
        requirements: analysis.requirements.map((requirement) => ({
          requirementId: requirement.id,
          decision: "pending",
          note: "",
          draftAnswer: "",
          updatedAt: null,
        })),
        executiveSummary: analysis.draft.executiveSummary,
        responseStrategy: analysis.draft.responseStrategy,
      },
      proposalState: {
        sections: [
          {
            id: "section-executive-summary",
            title: "Executive Summary",
            content: analysis.draft.executiveSummary,
            sourceRequirementIds: [],
            sourceRefs: analysis.draft.sourceRefs ?? [],
            status: "draft",
            reviewerName: "",
            signedOffAt: null,
            comments: [],
            assigneeName: "",
            followUpRequired: false,
            followUpNote: "",
            followUpDueDate: null,
          },
          {
            id: "section-response-strategy",
            title: "Response Strategy",
            content: analysis.draft.responseStrategy,
            sourceRequirementIds: [],
            sourceRefs: analysis.draft.sourceRefs ?? [],
            status: "draft",
            reviewerName: "",
            signedOffAt: null,
            comments: [],
            assigneeName: "",
            followUpRequired: false,
            followUpNote: "",
            followUpDueDate: null,
          },
        ],
        snapshots: [],
      },
      activityLog: [
        createActivityEntry(
          "analysis_completed",
          "Initial analysis completed",
          "ProposalDock generated the first workspace analysis.",
        ),
        createActivityEntry(
          "workspace_created",
          "Workspace created",
          `Workspace created for ${clientName}.`,
        ),
      ],
    };

    await saveWorkspace(workspace, user.id);
    if (ownedWorkspaceCount === 0) {
      await createMarketingEvent({
        eventType: "first_analysis_completed",
        page: "activation",
        email: account.email,
      });
    }
    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Analysis failed. Check your input and retry.",
      },
      { status: error instanceof AIServiceError ? error.status : 500 },
    );
  }
}
