import { readFile } from "node:fs/promises";
import path from "node:path";
import { isPlatformAdminEmail } from "@/lib/platform-admin";
import { prisma } from "@/lib/prisma";
import type {
  BillingStatus,
  KnowledgeAsset,
  OrganizationTeam,
  PublicLead,
  ProposalSection,
  TeamInvite,
  TeamMember,
  TeamRole,
  UserBillingSummary,
  Workspace,
  WorkspaceActivityEntry,
} from "@/lib/types";

const legacyDataFile = path.join(process.cwd(), "data", "workspaces.json");

type WorkspaceRecord = {
  id: string;
  ownerId: string | null;
  organizationId: string | null;
  visibility: string | null;
  workspaceName: string;
  clientName: string;
  companyKnowledge: string;
  instructions: string | null;
  payload: Workspace["documents"];
  knowledgeAssets: Workspace["knowledgeAssets"];
  analysis: Workspace["analysis"];
  reviewState: Workspace["reviewState"];
  proposalState: Workspace["proposalState"];
  activityLog: Workspace["activityLog"];
  createdAt: Date;
  updatedAt: Date;
  organization?: { name: string } | null;
  accesses?: Array<{
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
};

function asWorkspaceRecord(value: unknown) {
  return value as WorkspaceRecord;
}

function buildDefaultReviewState(workspace: Pick<Workspace, "analysis">) {
  return {
    requirements: workspace.analysis.requirements.map((requirement) => ({
      requirementId: requirement.id,
      decision: "pending" as const,
      note: "",
      draftAnswer: "",
      updatedAt: null,
    })),
    executiveSummary: workspace.analysis.draft.executiveSummary,
    responseStrategy: workspace.analysis.draft.responseStrategy,
  };
}

function buildDefaultProposalState(
  workspace: Pick<Workspace, "analysis" | "reviewState">,
): Workspace["proposalState"] {
  const acceptedRequirements = workspace.analysis.requirements
    .map((requirement) => {
      const review = workspace.reviewState.requirements.find(
        (item) => item.requirementId === requirement.id,
      );

      if (!review || review.decision !== "accepted" || !review.draftAnswer.trim()) {
        return null;
      }

      return {
        id: `section-${requirement.id.toLowerCase()}`,
        title: requirement.title,
        content: review.draftAnswer.trim(),
        sourceRequirementIds: [requirement.id],
        sourceRefs: requirement.sourceRefs,
        status: "draft" as const,
        reviewerName: "",
        signedOffAt: null,
        comments: [],
        assigneeName: "",
        followUpRequired: false,
        followUpNote: "",
        followUpDueDate: null,
      };
    })
    .filter(Boolean) as ProposalSection[];

  return {
    sections: [
      {
        id: "section-executive-summary",
        title: "Executive Summary",
        content: workspace.reviewState.executiveSummary,
        sourceRequirementIds: [],
        sourceRefs: workspace.analysis.draft.sourceRefs ?? [],
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
        content: workspace.reviewState.responseStrategy,
        sourceRequirementIds: [],
        sourceRefs: workspace.analysis.draft.sourceRefs ?? [],
        status: "draft",
        reviewerName: "",
        signedOffAt: null,
        comments: [],
        assigneeName: "",
        followUpRequired: false,
        followUpNote: "",
        followUpDueDate: null,
      },
      ...acceptedRequirements,
    ],
    snapshots: [],
  };
}

function mergeProposalStateWithReview(
  currentProposalState: Workspace["proposalState"] | undefined,
  workspace: Pick<Workspace, "analysis" | "reviewState">,
) {
  const seeded = buildDefaultProposalState(workspace);
  if (!currentProposalState) return seeded;

  const currentById = new Map(
    currentProposalState.sections.map((section) => [section.id, section]),
  );

  const mergedSeededSections = seeded.sections.map((section) => {
    const existing = currentById.get(section.id);
    if (!existing) return section;

    if (section.id === "section-executive-summary") {
      return {
        ...existing,
        title: section.title,
        sourceRequirementIds: section.sourceRequirementIds,
        sourceRefs: section.sourceRefs,
        status: existing.status ?? "draft",
        reviewerName: existing.reviewerName ?? "",
        signedOffAt: existing.signedOffAt ?? null,
        comments: existing.comments ?? [],
        assigneeName: existing.assigneeName ?? "",
        followUpRequired: existing.followUpRequired ?? false,
        followUpNote: existing.followUpNote ?? "",
        followUpDueDate: existing.followUpDueDate ?? null,
      };
    }

    if (section.id === "section-response-strategy") {
      return {
        ...existing,
        title: section.title,
        sourceRequirementIds: section.sourceRequirementIds,
        sourceRefs: section.sourceRefs,
        status: existing.status ?? "draft",
        reviewerName: existing.reviewerName ?? "",
        signedOffAt: existing.signedOffAt ?? null,
        comments: existing.comments ?? [],
        assigneeName: existing.assigneeName ?? "",
        followUpRequired: existing.followUpRequired ?? false,
        followUpNote: existing.followUpNote ?? "",
        followUpDueDate: existing.followUpDueDate ?? null,
      };
    }

    return existing;
  });

  const seededIds = new Set(mergedSeededSections.map((section) => section.id));
  const customSections = currentProposalState.sections.filter(
    (section) => !seededIds.has(section.id),
  );

  return {
    sections: [...mergedSeededSections, ...customSections],
    snapshots: currentProposalState.snapshots ?? [],
  };
}

type KnowledgeAssetRecord = {
  id: string;
  ownerId: string | null;
  organizationId: string | null;
  title: string;
  category: string;
  content: string;
  excerpt: string;
  approvalStatus: string | null;
  lastReviewedAt: Date | null;
  intendedUseCase: string | null;
  proofNote: string | null;
  fileSize: number | null;
  sourceFilename: string | null;
  sourceMimeType: string | null;
  sourceKind: string | null;
  storageProvider: string | null;
  storagePath: string | null;
  storageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  organization?: { name: string } | null;
  owner?: { name: string } | null;
};

type OrganizationMembershipRecord = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  organization: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type OrganizationInviteRecord = {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  invitedByUserId: string;
  createdAt: Date;
  updatedAt: Date;
};

type BetaOpsTimelineEntry = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
};

type PublicLeadRecord = {
  id: string;
  type: string;
  status: string;
  name: string;
  email: string;
  company: string;
  teamSize: string | null;
  plan: string | null;
  source: string | null;
  message: string | null;
  internalNotes: string | null;
  assignedUserId: string | null;
  assignedUserName: string | null;
  nextFollowUpAt: Date | null;
  activityLog:
    | Array<{
        id: string;
        type: string;
        title: string;
        detail: string;
        createdAt: string;
        actorName: string;
      }>
    | null;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeWorkspace(workspace: Workspace): Workspace {
  const reviewState = workspace.reviewState ?? buildDefaultReviewState(workspace);
  const proposalState = mergeProposalStateWithReview(workspace.proposalState, {
    analysis: workspace.analysis,
    reviewState,
  });

  return {
    ...workspace,
    organizationId: workspace.organizationId ?? null,
    organizationName: workspace.organizationName ?? null,
    visibility:
      workspace.visibility === "organization" || workspace.visibility === "selected"
        ? workspace.visibility
        : "private",
    sharedWithUsers: (workspace.sharedWithUsers ?? []).map((item) => ({
      userId: item.userId,
      name: item.name,
      email: item.email,
    })),
    knowledgeAssets: (workspace.knowledgeAssets ?? []).map((asset) => ({
      ...asset,
      organizationId: asset.organizationId ?? null,
      organizationName:
        asset.organizationName ?? workspace.organizationName ?? null,
      excerpt: asset.excerpt ?? asset.content.slice(0, 220).trim(),
      fileSize: asset.fileSize ?? null,
      sourceFilename: asset.sourceFilename ?? null,
      sourceMimeType: asset.sourceMimeType ?? null,
      sourceKind: asset.sourceKind ?? "manual",
      storageProvider: asset.storageProvider ?? null,
      storagePath: asset.storagePath ?? null,
      storageUrl: asset.storageUrl ?? null,
    })),
    analysis: {
      ...workspace.analysis,
      risks: workspace.analysis.risks.map((risk) => ({
        ...risk,
        sourceRefs: risk.sourceRefs ?? [],
      })),
      draft: {
        ...workspace.analysis.draft,
        sourceRefs: workspace.analysis.draft.sourceRefs ?? [],
      },
      sources: workspace.analysis.sources.map((source) => ({
        ...source,
        content: source.content,
        sourceType: source.sourceType,
        documentId: source.documentId,
        documentLabel: source.documentLabel,
        assetId: source.assetId,
        assetTitle: source.assetTitle,
      })),
    },
    reviewState: {
      executiveSummary:
        reviewState.executiveSummary ?? workspace.analysis.draft.executiveSummary,
      responseStrategy:
        reviewState.responseStrategy ?? workspace.analysis.draft.responseStrategy,
      requirements: workspace.analysis.requirements.map((requirement) => {
        const existing = reviewState.requirements.find(
          (item) => item.requirementId === requirement.id,
        );

        return {
          requirementId: requirement.id,
          decision: existing?.decision ?? "pending",
          note: existing?.note ?? "",
          draftAnswer: existing?.draftAnswer ?? "",
          updatedAt: existing?.updatedAt ?? null,
        };
      }),
    },
    proposalState: {
      sections:
        proposalState.sections.length > 0
          ? proposalState.sections.map((section, index) => ({
              id: section.id ?? `section-${index + 1}`,
              title: section.title,
              content: section.content ?? "",
              sourceRequirementIds: section.sourceRequirementIds ?? [],
              sourceRefs: section.sourceRefs ?? [],
              status:
                section.status === "approved" || section.status === "in_review"
                  ? section.status
                  : "draft",
              reviewerName: section.reviewerName ?? "",
              signedOffAt: section.signedOffAt ?? null,
              comments: (section.comments ?? []).map((comment, commentIndex) => ({
                id: comment.id ?? `comment-${index + 1}-${commentIndex + 1}`,
                author: comment.author ?? "",
                body: comment.body ?? "",
                createdAt: comment.createdAt ?? new Date().toISOString(),
              })),
              assigneeName: section.assigneeName ?? "",
              followUpRequired: section.followUpRequired ?? false,
              followUpNote: section.followUpNote ?? "",
              followUpDueDate: section.followUpDueDate ?? null,
            }))
          : mergeProposalStateWithReview(undefined, {
              analysis: workspace.analysis,
              reviewState,
            }).sections,
      snapshots: (proposalState.snapshots ?? []).map((snapshot, index) => ({
        id: snapshot.id ?? `snapshot-${index + 1}`,
        name: snapshot.name ?? `Snapshot ${index + 1}`,
        createdAt: snapshot.createdAt ?? new Date().toISOString(),
        sections: (snapshot.sections ?? []).map((section, sectionIndex) => ({
          id: section.id ?? `snapshot-section-${sectionIndex + 1}`,
          title: section.title,
          content: section.content ?? "",
          sourceRequirementIds: section.sourceRequirementIds ?? [],
          sourceRefs: section.sourceRefs ?? [],
          status:
            section.status === "approved" || section.status === "in_review"
              ? section.status
              : "draft",
          reviewerName: section.reviewerName ?? "",
          signedOffAt: section.signedOffAt ?? null,
          comments: (section.comments ?? []).map((comment, commentIndex) => ({
            id: comment.id ?? `snapshot-comment-${index + 1}-${sectionIndex + 1}-${commentIndex + 1}`,
            author: comment.author ?? "",
            body: comment.body ?? "",
            createdAt: comment.createdAt ?? new Date().toISOString(),
          })),
          assigneeName: section.assigneeName ?? "",
          followUpRequired: section.followUpRequired ?? false,
          followUpNote: section.followUpNote ?? "",
          followUpDueDate: section.followUpDueDate ?? null,
        })),
      })),
    },
    activityLog: (workspace.activityLog ?? []).map((entry, index) => ({
      id: entry.id ?? `activity-${index + 1}`,
      type: entry.type,
      title: entry.title,
      detail: entry.detail ?? "",
      createdAt: entry.createdAt ?? new Date().toISOString(),
    })),
    documents: workspace.documents.map((document, index) => {
      const content = document.content ?? "";

      return {
        id: document.id ?? `${workspace.id}-doc-${index + 1}`,
        filename: document.filename,
        mimeType: document.mimeType ?? "text/plain",
        kind: document.kind ?? "upload",
        content,
        excerpt: document.excerpt ?? content.slice(0, 220).trim(),
        characterCount: document.characterCount ?? content.length,
        fileSize: document.fileSize ?? null,
        storageProvider: document.storageProvider ?? null,
        storagePath: document.storagePath ?? null,
        storageUrl: document.storageUrl ?? null,
      };
    }),
  };
}

function fromRecord(record: WorkspaceRecord): Workspace {
  return normalizeWorkspace({
    id: record.id,
    ownerId: record.ownerId,
    organizationId: record.organizationId,
    organizationName: record.organization?.name ?? null,
    visibility:
      record.visibility === "organization" || record.visibility === "selected"
        ? record.visibility
        : "private",
    sharedWithUsers: (record.accesses ?? []).map((access) => ({
      userId: access.user.id,
      name: access.user.name,
      email: access.user.email,
    })),
    workspaceName: record.workspaceName,
    clientName: record.clientName,
    companyKnowledge: record.companyKnowledge,
    instructions: record.instructions ?? "",
    knowledgeAssets: record.knowledgeAssets ?? [],
    documents: record.payload,
    analysis: record.analysis,
    reviewState: record.reviewState ?? buildDefaultReviewState({ analysis: record.analysis }),
    proposalState:
      record.proposalState ??
      buildDefaultProposalState({
        analysis: record.analysis,
        reviewState:
          record.reviewState ?? buildDefaultReviewState({ analysis: record.analysis }),
      }),
    activityLog: record.activityLog ?? [],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  });
}

function createActivityEntry(
  type: WorkspaceActivityEntry["type"],
  title: string,
  detail: string,
): WorkspaceActivityEntry {
  return {
    id: crypto.randomUUID(),
    type,
    title,
    detail,
    createdAt: new Date().toISOString(),
  };
}

function fromKnowledgeAssetRecord(record: KnowledgeAssetRecord): KnowledgeAsset {
  const approvalStatus =
    record.approvalStatus === "needs_review" || record.approvalStatus === "draft"
      ? record.approvalStatus
      : "approved";

  return {
    id: record.id,
    organizationId: record.organizationId,
    organizationName: record.organization?.name ?? null,
    ownerName: record.owner?.name ?? null,
    title: record.title,
    category: record.category,
    content: record.content,
    excerpt: record.excerpt,
    approvalStatus,
    lastReviewedAt: record.lastReviewedAt?.toISOString() ?? null,
    intendedUseCase: record.intendedUseCase,
    proofNote: record.proofNote,
    fileSize: record.fileSize,
    sourceFilename: record.sourceFilename,
    sourceMimeType: record.sourceMimeType,
    sourceKind: (record.sourceKind as KnowledgeAsset["sourceKind"]) ?? "manual",
    storageProvider: (record.storageProvider as KnowledgeAsset["storageProvider"]) ?? null,
    storagePath: record.storagePath,
    storageUrl: record.storageUrl,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function fromPublicLeadRecord(record: PublicLeadRecord): PublicLead {
  return {
    id: record.id,
    type: record.type === "contact_sales" ? "contact_sales" : "waitlist",
    status:
      record.status === "contacted" ||
      record.status === "qualified" ||
      record.status === "closed"
        ? record.status
        : "new",
    name: record.name,
    email: record.email,
    company: record.company,
    teamSize: record.teamSize,
    plan: record.plan,
    source: record.source,
    message: record.message,
    internalNotes: record.internalNotes,
    assignedUserId: record.assignedUserId,
    assignedUserName: record.assignedUserName,
    nextFollowUpAt: record.nextFollowUpAt?.toISOString() ?? null,
    activityLog: (record.activityLog ?? []).map((entry, index) => ({
      id: entry.id ?? `lead-activity-${index + 1}`,
      type:
        entry.type === "lead_status_updated" ||
        entry.type === "lead_owner_updated" ||
        entry.type === "lead_follow_up_updated"
          ? entry.type
          : "lead_created",
      title: entry.title ?? "Lead activity",
      detail: entry.detail ?? "",
      createdAt: entry.createdAt ?? record.updatedAt.toISOString(),
      actorName: entry.actorName ?? "ProposalDock",
    })),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function importLegacyJsonIfNeeded() {
  const existingCount = await prisma.workspace.count();
  if (existingCount > 0) return;

  try {
    const raw = await readFile(legacyDataFile, "utf8");
    const legacyWorkspaces = JSON.parse(raw) as Workspace[];

    if (!legacyWorkspaces.length) return;

    await prisma.workspace.createMany({
      data: legacyWorkspaces.map((workspace) => {
        const normalized = normalizeWorkspace(workspace);

        return {
          id: normalized.id,
          ownerId: null,
          organizationId: null,
          visibility: normalized.visibility ?? "private",
          workspaceName: normalized.workspaceName,
          clientName: normalized.clientName,
          companyKnowledge: normalized.companyKnowledge,
          instructions: normalized.instructions || null,
          payload: normalized.documents,
          knowledgeAssets: normalized.knowledgeAssets ?? [],
          analysis: normalized.analysis,
          reviewState: normalized.reviewState,
          proposalState: normalized.proposalState,
          activityLog: normalized.activityLog,
          createdAt: new Date(normalized.createdAt),
          updatedAt: new Date(normalized.updatedAt),
        };
      }),
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
}

async function ensureStore() {
  await importLegacyJsonIfNeeded();
}

async function requirePlatformAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!isPlatformAdminEmail(user?.email)) {
    throw new Error("You do not have permission to access ProposalDock internal ops.");
  }
}

function normalizeTeamRole(value: string | null | undefined): TeamRole {
  if (value === "owner" || value === "admin") return value;
  return "member";
}

async function ensurePrimaryOrganizationForUser(userId: string, fallbackName?: string) {
  const existing = await prisma.organizationMembership.findFirst({
    where: {
      userId,
      status: "active",
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (existing) {
    return existing;
  }

  const now = new Date();
  const organizationId = crypto.randomUUID();
  const organizationName = fallbackName?.trim()
    ? `${fallbackName.trim()} Team`
    : "ProposalDock Team";

  await prisma.organization.create({
    data: {
      id: organizationId,
      name: organizationName,
      createdAt: now,
      updatedAt: now,
    },
  });

  const membership = await prisma.organizationMembership.create({
    data: {
      id: crypto.randomUUID(),
      organizationId,
      userId,
      role: "owner",
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      activeOrganizationId: organizationId,
      updatedAt: now,
    },
  });

  await prisma.workspace.updateMany({
    where: {
      ownerId: userId,
      organizationId: null,
    },
    data: {
      organizationId,
    },
  });

  await prisma.knowledgeAsset.updateMany({
    where: {
      ownerId: userId,
      organizationId: null,
    },
    data: {
      organizationId,
    },
  });

  return membership;
}

async function getAccessibleOrganizationIds(userId: string) {
  const memberships = await prisma.organizationMembership.findMany({
    where: {
      userId,
      status: "active",
    },
    select: {
      organizationId: true,
    },
  });

  return memberships.map((membership) => membership.organizationId);
}

async function getActiveOrganizationIdForUser(userId: string) {
  const primaryMembership = await ensurePrimaryOrganizationForUser(userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { activeOrganizationId: true },
  });

  const accessibleOrganizationIds = await getAccessibleOrganizationIds(userId);
  const activeOrganizationId =
    user?.activeOrganizationId && accessibleOrganizationIds.includes(user.activeOrganizationId)
      ? user.activeOrganizationId
      : primaryMembership.organizationId;

  if (user?.activeOrganizationId !== activeOrganizationId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        activeOrganizationId,
        updatedAt: new Date(),
      },
    });
  }

  return activeOrganizationId;
}

async function getOrganizationRole(userId: string, organizationId: string | null | undefined) {
  if (!organizationId) return null;

  const membership = await prisma.organizationMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!membership || membership.status !== "active") return null;
  return normalizeTeamRole(membership.role);
}

async function getExplicitWorkspaceAccessUserIds(userId: string) {
  const accesses = await prisma.workspaceAccess.findMany({
    where: { userId },
    select: { workspaceId: true },
  });

  return accesses.map((access) => access.workspaceId);
}

export async function listWorkspaces(): Promise<Workspace[]> {
  return listWorkspacesForUser(null);
}

export async function listWorkspacesForUser(userId: string | null): Promise<Workspace[]> {
  await ensureStore();
  const activeOrganizationId = userId ? await getActiveOrganizationIdForUser(userId) : null;
  const explicitWorkspaceIds = userId ? await getExplicitWorkspaceAccessUserIds(userId) : [];
  const workspaces = await prisma.workspace.findMany({
    where: userId
      ? {
          OR: [
            { ownerId: userId },
            ...(activeOrganizationId
              ? [{ organizationId: activeOrganizationId, visibility: "organization" }]
              : []),
            ...(explicitWorkspaceIds.length
              ? [{ id: { in: explicitWorkspaceIds } }]
              : []),
          ],
        }
      : undefined,
    include: {
      owner: {
        select: {
          name: true,
        },
      },
      organization: {
        select: {
          name: true,
        },
      },
      accesses: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return workspaces.map((workspace) => fromRecord(asWorkspaceRecord(workspace)));
}

export async function getWorkspace(id: string, userId?: string | null) {
  await ensureStore();
  const workspace = await prisma.workspace.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          name: true,
        },
      },
      organization: {
        select: {
          name: true,
        },
      },
      accesses: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!workspace) return null;
  if (userId && asWorkspaceRecord(workspace).ownerId !== userId) {
    const record = asWorkspaceRecord(workspace);
    const organizationIds = await getAccessibleOrganizationIds(userId);
    const hasOrgVisibility =
      record.visibility === "organization" &&
      record.organizationId &&
      organizationIds.includes(record.organizationId);
    const hasExplicitAccess = (record.accesses ?? []).some(
      (access) => access.user.id === userId,
    );

    if (!hasOrgVisibility && !hasExplicitAccess) {
      return null;
    }
  }

  return fromRecord(asWorkspaceRecord(workspace));
}

export async function saveWorkspace(workspace: Workspace, ownerId?: string | null) {
  await ensureStore();
  const normalized = normalizeWorkspace(workspace);
  const existing = await prisma.workspace.findUnique({
    where: { id: normalized.id },
  });
  const primaryOrganization =
    ownerId ? await ensurePrimaryOrganizationForUser(ownerId) : null;
  const activeOrganizationId = ownerId
    ? await getActiveOrganizationIdForUser(ownerId)
    : null;
  const resolvedOwnerId = existing?.ownerId ?? ownerId ?? null;
  const resolvedOrganizationId =
    existing?.organizationId ??
    normalized.organizationId ??
    activeOrganizationId ??
    primaryOrganization?.organizationId ??
    null;

  const saved = await prisma.workspace.upsert({
    where: { id: normalized.id },
    create: {
      id: normalized.id,
      ownerId: resolvedOwnerId,
      organizationId: resolvedOrganizationId,
      visibility: normalized.visibility ?? "private",
      workspaceName: normalized.workspaceName,
      clientName: normalized.clientName,
      companyKnowledge: normalized.companyKnowledge,
      instructions: normalized.instructions || null,
      payload: normalized.documents,
      knowledgeAssets: normalized.knowledgeAssets ?? [],
      analysis: normalized.analysis,
      reviewState: normalized.reviewState,
      proposalState: normalized.proposalState,
      activityLog: normalized.activityLog,
      createdAt: new Date(normalized.createdAt),
      updatedAt: new Date(normalized.updatedAt),
    },
    update: {
      organizationId: resolvedOrganizationId,
      visibility: normalized.visibility ?? "private",
      workspaceName: normalized.workspaceName,
      clientName: normalized.clientName,
      companyKnowledge: normalized.companyKnowledge,
      instructions: normalized.instructions || null,
      payload: normalized.documents,
      knowledgeAssets: normalized.knowledgeAssets ?? [],
      analysis: normalized.analysis,
      reviewState: normalized.reviewState,
      proposalState: normalized.proposalState,
      activityLog: normalized.activityLog,
      updatedAt: new Date(normalized.updatedAt),
    },
  });

  await prisma.workspaceAccess.deleteMany({
    where: { workspaceId: normalized.id },
  });

  if ((normalized.visibility ?? "private") === "selected" && normalized.sharedWithUsers?.length) {
    await prisma.workspaceAccess.createMany({
      data: normalized.sharedWithUsers.map((item) => ({
        id: crypto.randomUUID(),
        workspaceId: normalized.id,
        userId: item.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });
  }

  const hydrated = await prisma.workspace.findUnique({
    where: { id: normalized.id },
    include: {
      organization: { select: { name: true } },
      accesses: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return fromRecord(asWorkspaceRecord(hydrated ?? saved));
}

export async function renameWorkspace(id: string, workspaceName: string) {
  return renameWorkspaceForUser(id, workspaceName, null);
}

export async function renameWorkspaceForUser(
  id: string,
  workspaceName: string,
  userId: string | null,
) {
  await ensureStore();
  const existing = await prisma.workspace.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Workspace not found.");
  }
  if (userId && asWorkspaceRecord(existing).ownerId !== userId) {
    const role = await getOrganizationRole(userId, asWorkspaceRecord(existing).organizationId);
    if (role !== "owner" && role !== "admin") {
      throw new Error("You do not have permission to manage this workspace.");
    }
  }

  const saved = await prisma.workspace.update({
    where: { id },
    data: {
      workspaceName,
      updatedAt: new Date(),
    },
  });

  return fromRecord(asWorkspaceRecord(saved));
}

export async function updateWorkspaceMetadataForUser(
  id: string,
  input: {
    workspaceName?: string;
    clientName?: string;
    companyKnowledge?: string;
    instructions?: string;
    visibility?: "private" | "organization" | "selected";
    sharedUserIds?: string[];
  },
  userId: string | null,
) {
  await ensureStore();
  const existing = await prisma.workspace.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Workspace not found.");
  }
  if (userId && asWorkspaceRecord(existing).ownerId !== userId) {
    const role = await getOrganizationRole(userId, asWorkspaceRecord(existing).organizationId);
    if (role !== "owner" && role !== "admin") {
      throw new Error("You do not have permission to manage this workspace.");
    }
  }

  const organizationId = asWorkspaceRecord(existing).organizationId;
  const cleanedSharedUserIds = [...new Set((input.sharedUserIds ?? []).filter(Boolean))];

  if (input.visibility === "selected" && !organizationId) {
    throw new Error("This workspace is not attached to an organization yet.");
  }

  if (cleanedSharedUserIds.length) {
    if (!organizationId) {
      throw new Error("Selected teammate sharing is only available inside an organization.");
    }

    const memberships = await prisma.organizationMembership.findMany({
      where: {
        organizationId,
        status: "active",
        userId: {
          in: cleanedSharedUserIds,
        },
      },
      select: {
        userId: true,
      },
    });

    const allowedUserIds = new Set(memberships.map((membership) => membership.userId));
    const invalidUserIds = cleanedSharedUserIds.filter((sharedUserId) => !allowedUserIds.has(sharedUserId));

    if (invalidUserIds.length) {
      throw new Error("One or more selected teammates are not members of this organization.");
    }
  }

  const saved = await prisma.workspace.update({
    where: { id },
    data: {
      ...(input.workspaceName ? { workspaceName: input.workspaceName } : {}),
      ...(input.clientName ? { clientName: input.clientName } : {}),
      ...(input.companyKnowledge ? { companyKnowledge: input.companyKnowledge } : {}),
      ...(input.instructions !== undefined
        ? { instructions: input.instructions || null }
        : {}),
      ...(input.visibility ? { visibility: input.visibility } : {}),
      updatedAt: new Date(),
    },
    include: {
      organization: {
        select: {
          name: true,
        },
      },
      owner: {
        select: {
          name: true,
        },
      },
    },
  });

  if (input.sharedUserIds) {
    await prisma.workspaceAccess.deleteMany({
      where: { workspaceId: id },
    });

    if (cleanedSharedUserIds.length) {
      await prisma.workspaceAccess.createMany({
        data: cleanedSharedUserIds.map((sharedUserId) => ({
          id: crypto.randomUUID(),
          workspaceId: id,
          userId: sharedUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      });
    }
  }

  const hydrated = await prisma.workspace.findUnique({
    where: { id },
    include: {
      organization: {
        select: {
          name: true,
        },
      },
      accesses: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return fromRecord(asWorkspaceRecord(hydrated ?? saved));
}

export async function updateWorkspaceReviewState(
  id: string,
  reviewState: Workspace["reviewState"],
  userId?: string | null,
) {
  await ensureStore();
  const existing = await getWorkspace(id, userId);
  const proposalState = existing
    ? mergeProposalStateWithReview(existing.proposalState, {
        analysis: existing.analysis,
        reviewState,
      })
    : undefined;
  const saved = await prisma.workspace.update({
    where: { id },
    data: {
      reviewState,
      ...(proposalState ? { proposalState } : {}),
      activityLog: existing
        ? [
            createActivityEntry(
              "review_saved",
              "Review updates saved",
              "Requirement decisions or draft edits were saved.",
            ),
            ...existing.activityLog,
          ]
        : undefined,
      updatedAt: new Date(),
    },
  });

  return fromRecord(asWorkspaceRecord(saved));
}

export async function updateWorkspaceProposalState(
  id: string,
  proposalState: Workspace["proposalState"],
  activityEntries: WorkspaceActivityEntry[] = [],
  userId?: string | null,
) {
  await ensureStore();
  const existing = await getWorkspace(id, userId);
  if (!existing) {
    throw new Error("Workspace not found.");
  }
  const saved = await prisma.workspace.update({
    where: { id },
    data: {
      proposalState,
      activityLog: existing ? [...activityEntries, ...existing.activityLog] : activityEntries,
      updatedAt: new Date(),
    },
  });

  return fromRecord(asWorkspaceRecord(saved));
}

export async function deleteWorkspace(id: string) {
  return deleteWorkspaceForUser(id, null);
}

export async function deleteWorkspaceForUser(id: string, userId: string | null) {
  await ensureStore();
  const existing = await prisma.workspace.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Workspace not found.");
  }
  if (userId && asWorkspaceRecord(existing).ownerId !== userId) {
    const role = await getOrganizationRole(userId, asWorkspaceRecord(existing).organizationId);
    if (role !== "owner" && role !== "admin") {
      throw new Error("You do not have permission to manage this workspace.");
    }
  }
  await prisma.workspace.delete({
    where: { id },
  });
}

export async function appendWorkspaceActivity(
  id: string,
  activityEntries: WorkspaceActivityEntry[],
  userId?: string | null,
) {
  await ensureStore();
  const existing = await getWorkspace(id, userId);
  if (!existing || !activityEntries.length) return existing;

  const saved = await prisma.workspace.update({
    where: { id },
    data: {
      activityLog: [...activityEntries, ...existing.activityLog],
      updatedAt: new Date(),
    },
  });

  return fromRecord(asWorkspaceRecord(saved));
}

export { createActivityEntry };

export async function listKnowledgeAssets(): Promise<KnowledgeAsset[]> {
  return listKnowledgeAssetsForUser(null);
}

export async function listKnowledgeAssetsForUser(userId: string | null): Promise<KnowledgeAsset[]> {
  await ensureStore();
  const activeOrganizationId = userId ? await getActiveOrganizationIdForUser(userId) : null;
  const assets = await prisma.knowledgeAsset.findMany({
    where: userId
      ? {
          OR: [
            { ownerId: userId },
            ...(activeOrganizationId ? [{ organizationId: activeOrganizationId }] : []),
          ],
        }
      : undefined,
    include: {
      organization: {
        select: {
          name: true,
        },
      },
      owner: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
  });

  return assets.map((asset) => fromKnowledgeAssetRecord(asset as KnowledgeAssetRecord));
}

export async function getKnowledgeAssetsByIds(ids: string[], userId?: string | null) {
  await ensureStore();
  if (!ids.length) return [];
  const organizationIds = userId ? await getAccessibleOrganizationIds(userId) : [];

  const assets = await prisma.knowledgeAsset.findMany({
    where: {
      id: { in: ids },
      ...(userId
        ? {
            OR: [
              { ownerId: userId },
              ...(organizationIds.length
                ? [{ organizationId: { in: organizationIds } }]
                : []),
            ],
          }
        : {}),
    },
    include: {
      organization: {
        select: {
          name: true,
        },
      },
    },
  });

  const mapped = assets.map((asset) => fromKnowledgeAssetRecord(asset as KnowledgeAssetRecord));
  const byId = new Map(mapped.map((asset) => [asset.id, asset]));
  return ids.map((id) => byId.get(id)).filter((asset): asset is KnowledgeAsset => Boolean(asset));
}

export async function createKnowledgeAsset(input: {
  title: string;
  category: string;
  content: string;
  approvalStatus?: KnowledgeAsset["approvalStatus"];
  lastReviewedAt?: string | null;
  intendedUseCase?: string | null;
  proofNote?: string | null;
  fileSize?: number | null;
  sourceFilename?: string | null;
  sourceMimeType?: string | null;
  sourceKind?: KnowledgeAsset["sourceKind"];
  storageProvider?: KnowledgeAsset["storageProvider"];
  storagePath?: string | null;
  storageUrl?: string | null;
}, userId?: string | null) {
  await ensureStore();
  const now = new Date();
  const primaryOrganization =
    userId ? await ensurePrimaryOrganizationForUser(userId) : null;
  const activeOrganizationId = userId ? await getActiveOrganizationIdForUser(userId) : null;
  const saved = await prisma.knowledgeAsset.create({
    data: {
      id: crypto.randomUUID(),
      ownerId: userId ?? null,
      organizationId: activeOrganizationId ?? primaryOrganization?.organizationId ?? null,
      title: input.title,
      category: input.category,
      content: input.content,
      excerpt: input.content.slice(0, 220).trim(),
      approvalStatus: input.approvalStatus ?? "approved",
      lastReviewedAt: input.lastReviewedAt ? new Date(input.lastReviewedAt) : null,
      intendedUseCase: input.intendedUseCase ?? null,
      proofNote: input.proofNote ?? null,
      fileSize: input.fileSize ?? null,
      sourceFilename: input.sourceFilename ?? null,
      sourceMimeType: input.sourceMimeType ?? null,
      sourceKind: input.sourceKind ?? "manual",
      storageProvider: input.storageProvider ?? null,
      storagePath: input.storagePath ?? null,
      storageUrl: input.storageUrl ?? null,
      createdAt: now,
      updatedAt: now,
    },
  });

  return fromKnowledgeAssetRecord(saved as KnowledgeAssetRecord);
}

export async function updateKnowledgeAsset(
  id: string,
  input: {
    title: string;
    category: string;
    content: string;
    approvalStatus?: KnowledgeAsset["approvalStatus"];
    lastReviewedAt?: string | null;
    intendedUseCase?: string | null;
    proofNote?: string | null;
    fileSize?: number | null;
    sourceFilename?: string | null;
    sourceMimeType?: string | null;
    sourceKind?: KnowledgeAsset["sourceKind"];
    storageProvider?: KnowledgeAsset["storageProvider"];
    storagePath?: string | null;
    storageUrl?: string | null;
  },
  userId?: string | null,
) {
  await ensureStore();
  if (userId) {
    const existing = await prisma.knowledgeAsset.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Asset not found.");
    }
    if ((existing as KnowledgeAssetRecord).ownerId !== userId) {
      const role = await getOrganizationRole(userId, (existing as KnowledgeAssetRecord).organizationId);
      if (role !== "owner" && role !== "admin") {
        throw new Error("Asset not found.");
      }
    }
  }
  const saved = await prisma.knowledgeAsset.update({
    where: { id },
    data: {
      title: input.title,
      category: input.category,
      content: input.content,
      excerpt: input.content.slice(0, 220).trim(),
      approvalStatus: input.approvalStatus ?? "approved",
      lastReviewedAt: input.lastReviewedAt ? new Date(input.lastReviewedAt) : null,
      intendedUseCase: input.intendedUseCase ?? null,
      proofNote: input.proofNote ?? null,
      fileSize: input.fileSize ?? null,
      sourceFilename: input.sourceFilename ?? null,
      sourceMimeType: input.sourceMimeType ?? null,
      sourceKind: input.sourceKind ?? "manual",
      storageProvider: input.storageProvider ?? null,
      storagePath: input.storagePath ?? null,
      storageUrl: input.storageUrl ?? null,
      updatedAt: new Date(),
    },
  });

  return fromKnowledgeAssetRecord(saved as KnowledgeAssetRecord);
}

export async function deleteKnowledgeAsset(id: string, userId?: string | null) {
  await ensureStore();
  if (userId) {
    const existing = await prisma.knowledgeAsset.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Asset not found.");
    }
    if ((existing as KnowledgeAssetRecord).ownerId !== userId) {
      const role = await getOrganizationRole(userId, (existing as KnowledgeAssetRecord).organizationId);
      if (role !== "owner" && role !== "admin") {
        throw new Error("Asset not found.");
      }
    }
  }
  await prisma.knowledgeAsset.delete({
    where: { id },
  });
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  await ensureStore();
  const now = new Date();
  return prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      activeOrganizationId: null,
      createdAt: now,
      updatedAt: now,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });
}

export async function acceptPendingOrganizationInvitesForEmail(input: {
  userId: string;
  email: string;
}) {
  await ensureStore();
  const normalizedEmail = input.email.trim().toLowerCase();
  const invites = (await prisma.organizationInvite.findMany({
    where: {
      email: normalizedEmail,
      status: "pending",
    },
    orderBy: {
      createdAt: "asc",
    },
  })) as OrganizationInviteRecord[];

  if (!invites.length) {
    return [];
  }

  const now = new Date();
  for (const invite of invites) {
    await prisma.organizationMembership.upsert({
      where: {
        organizationId_userId: {
          organizationId: invite.organizationId,
          userId: input.userId,
        },
      },
      create: {
        id: crypto.randomUUID(),
        organizationId: invite.organizationId,
        userId: input.userId,
        role: invite.role,
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
      update: {
        role: invite.role,
        status: "active",
        updatedAt: now,
      },
    });
  }

  await prisma.organizationInvite.deleteMany({
    where: {
      email: normalizedEmail,
      status: "pending",
    },
  });

  return invites.map((invite) => invite.organizationId);
}

export async function ensureUserOrganization(userId: string, fallbackName?: string) {
  const membership = await ensurePrimaryOrganizationForUser(userId, fallbackName);
  return {
    organizationId: membership.organizationId,
    organizationName: membership.organization.name,
    role: normalizeTeamRole(membership.role),
  };
}

export async function listOrganizationsForUser(userId: string) {
  await ensureStore();
  const activeOrganizationId = await getActiveOrganizationIdForUser(userId);
  const memberships = (await prisma.organizationMembership.findMany({
    where: {
      userId,
      status: "active",
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })) as Array<{
    organizationId: string;
    role: string;
    organization: { id: string; name: string };
  }>;

  return {
    activeOrganizationId,
    organizations: memberships.map((membership) => ({
      organizationId: membership.organization.id,
      organizationName: membership.organization.name,
      role: normalizeTeamRole(membership.role),
    })),
  };
}

export async function setActiveOrganizationForUser(userId: string, organizationId: string) {
  await ensureStore();
  const accessibleOrganizationIds = await getAccessibleOrganizationIds(userId);
  if (!accessibleOrganizationIds.includes(organizationId)) {
    throw new Error("Organization not found.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      activeOrganizationId: organizationId,
      updatedAt: new Date(),
    },
  });

  return listOrganizationsForUser(userId);
}

function priceIdToPlan(priceId: string | null | undefined): UserBillingSummary["plan"] {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_TEAM) return "team";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  return "free";
}

function normalizeBillingStatus(status: string | null | undefined): BillingStatus {
  switch (status) {
    case "trialing":
    case "active":
    case "past_due":
    case "canceled":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return status;
    default:
      return "inactive";
  }
}

export async function getUserByEmail(email: string) {
  await ensureStore();
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function countUsers() {
  await ensureStore();
  return prisma.user.count();
}

export async function getUserAccountById(userId: string) {
  await ensureStore();
  const organization = await ensurePrimaryOrganizationForUser(userId);
  const organizationContext = await listOrganizationsForUser(userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripePriceId: true,
      stripeSubscriptionStatus: true,
      stripeCurrentPeriodEnd: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) return null;

  return {
    ...user,
    billing: {
      plan: priceIdToPlan(user.stripePriceId),
      status: normalizeBillingStatus(user.stripeSubscriptionStatus),
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripePriceId: user.stripePriceId,
      currentPeriodEnd: user.stripeCurrentPeriodEnd?.toISOString() ?? null,
    } satisfies UserBillingSummary,
    organization: {
      organizationId: organizationContext.activeOrganizationId,
      organizationName:
        organizationContext.organizations.find(
          (item) => item.organizationId === organizationContext.activeOrganizationId,
        )?.organizationName ?? organization.organization.name,
      role:
        organizationContext.organizations.find(
          (item) => item.organizationId === organizationContext.activeOrganizationId,
        )?.role ?? normalizeTeamRole(organization.role),
    },
    organizations: organizationContext.organizations,
  };
}

export async function listOrganizationTeamForUser(userId: string): Promise<OrganizationTeam> {
  await ensureStore();
  await ensurePrimaryOrganizationForUser(userId);
  const activeOrganizationId = await getActiveOrganizationIdForUser(userId);
  const activeMembership = await prisma.organizationMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: activeOrganizationId,
        userId,
      },
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          betaOpsNotes: true,
          betaOpsTimeline: true,
        },
      },
    },
  });

  if (!activeMembership) {
    throw new Error("Active organization not found.");
  }

  const memberships = (await prisma.organizationMembership.findMany({
    where: {
      organizationId: activeOrganizationId,
      status: "active",
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  })) as OrganizationMembershipRecord[];

  const pendingInvites = (await prisma.organizationInvite.findMany({
    where: {
      organizationId: activeOrganizationId,
      status: "pending",
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as OrganizationInviteRecord[];

  const inviterById = new Map(
    memberships.map((membership) => [membership.user.id, membership.user.name]),
  );

  return {
    organizationId: activeOrganizationId,
    organizationName: activeMembership.organization.name,
    currentUserRole: normalizeTeamRole(activeMembership.role),
    betaOpsNotes: activeMembership.organization.betaOpsNotes ?? null,
    betaOpsTimeline: (
      (activeMembership.organization.betaOpsTimeline as BetaOpsTimelineEntry[] | null) ?? []
    ).map((entry, index) => ({
      id: entry.id ?? `beta-ops-entry-${index + 1}`,
      body: entry.body ?? "",
      createdAt: entry.createdAt ?? new Date().toISOString(),
      authorName: entry.authorName ?? "ProposalDock",
    })),
    members: memberships.map((membership): TeamMember => ({
      membershipId: membership.id,
      userId: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
      role: normalizeTeamRole(membership.role),
      status: "active",
      joinedAt: membership.createdAt.toISOString(),
    })),
    pendingInvites: pendingInvites.map((invite): TeamInvite => ({
      inviteId: invite.id,
      email: invite.email,
      role: normalizeTeamRole(invite.role),
      status: "pending",
      invitedByName: inviterById.get(invite.invitedByUserId) ?? "ProposalDock",
      invitedAt: invite.createdAt.toISOString(),
    })),
  };
}

export async function updateActiveOrganizationBetaOpsNotes(input: {
  userId: string;
  notes: string;
}) {
  await ensureStore();
  await requirePlatformAdmin(input.userId);
  const team = await listOrganizationTeamForUser(input.userId);

  if (team.currentUserRole !== "owner" && team.currentUserRole !== "admin") {
    throw new Error("You do not have permission to update beta ops notes.");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: team.organizationId },
    select: {
      betaOpsNotes: true,
      betaOpsTimeline: true,
    },
  });
  if (!organization) {
    throw new Error("Active organization not found.");
  }

  const actorName =
    team.members.find((member) => member.userId === input.userId)?.name ?? "Team member";
  const trimmedNotes = input.notes.trim();
  const currentNotes = organization.betaOpsNotes?.trim() ?? "";
  const existingTimeline =
    (organization.betaOpsTimeline as BetaOpsTimelineEntry[] | null) ?? [];
  const nextTimeline =
    trimmedNotes && trimmedNotes !== currentNotes
      ? [
          {
            id: crypto.randomUUID(),
            body: trimmedNotes,
            createdAt: new Date().toISOString(),
            authorName: actorName,
          },
          ...existingTimeline,
        ]
      : existingTimeline;

  await prisma.organization.update({
    where: { id: team.organizationId },
    data: {
      betaOpsNotes: trimmedNotes || null,
      betaOpsTimeline: nextTimeline,
      updatedAt: new Date(),
    },
  });

  return {
    organizationId: team.organizationId,
    betaOpsNotes: trimmedNotes || null,
    betaOpsTimeline: nextTimeline,
  };
}

export async function listPublicLeadsForUser(userId: string): Promise<PublicLead[]> {
  await ensureStore();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!isPlatformAdminEmail(user?.email)) {
    return [];
  }

  const leads = await prisma.publicLead.findMany({
    orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
  });

  return leads.map((lead) => fromPublicLeadRecord(lead as PublicLeadRecord));
}

export async function updatePublicLeadForUser(input: {
  userId: string;
  leadId: string;
  status: PublicLead["status"];
  internalNotes: string;
  assignedUserId: string | null;
  nextFollowUpAt: string | null;
}) {
  await ensureStore();
  await requirePlatformAdmin(input.userId);
  const team = await listOrganizationTeamForUser(input.userId);

  const assignedMember = input.assignedUserId
    ? team.members.find((member) => member.userId === input.assignedUserId)
    : null;

  if (input.assignedUserId && !assignedMember) {
    throw new Error("Assigned owner must be an active team member.");
  }

  const existing = await prisma.publicLead.findUnique({
    where: { id: input.leadId },
  });

  if (!existing) {
    throw new Error("Lead not found.");
  }

  const existingLead = fromPublicLeadRecord(existing as PublicLeadRecord);
  const actorName =
    team.members.find((member) => member.userId === input.userId)?.name ?? "Team member";
  const nextOwnerName = assignedMember?.name ?? null;
  const nextFollowUpAt = input.nextFollowUpAt || null;
  const activityEntries = [...existingLead.activityLog];

  if (existingLead.status !== input.status) {
    activityEntries.unshift({
      id: crypto.randomUUID(),
      type: "lead_status_updated",
      title: "Lead status updated",
      detail: `Status changed from ${existingLead.status} to ${input.status}.`,
      createdAt: new Date().toISOString(),
      actorName,
    });
  }

  if ((existingLead.assignedUserName ?? null) !== nextOwnerName) {
    activityEntries.unshift({
      id: crypto.randomUUID(),
      type: "lead_owner_updated",
      title: "Lead owner updated",
      detail: `Owner changed from ${existingLead.assignedUserName ?? "Unassigned"} to ${nextOwnerName ?? "Unassigned"}.`,
      createdAt: new Date().toISOString(),
      actorName,
    });
  }

  if ((existingLead.nextFollowUpAt?.slice(0, 10) ?? null) !== nextFollowUpAt) {
    activityEntries.unshift({
      id: crypto.randomUUID(),
      type: "lead_follow_up_updated",
      title: "Follow-up date updated",
      detail: `Next follow-up changed from ${existingLead.nextFollowUpAt?.slice(0, 10) ?? "none"} to ${nextFollowUpAt ?? "none"}.`,
      createdAt: new Date().toISOString(),
      actorName,
    });
  }

  const saved = await prisma.publicLead.update({
    where: { id: input.leadId },
    data: {
      status: input.status,
      internalNotes: input.internalNotes.trim() || null,
      assignedUserId: assignedMember?.userId ?? null,
      assignedUserName: assignedMember?.name ?? null,
      nextFollowUpAt: input.nextFollowUpAt ? new Date(input.nextFollowUpAt) : null,
      activityLog: activityEntries,
      updatedAt: new Date(),
    },
  });

  return fromPublicLeadRecord(saved as PublicLeadRecord);
}

export async function addOrganizationMemberByEmail(input: {
  currentUserId: string;
  email: string;
  role: TeamRole;
}) {
  await ensureStore();
  await ensurePrimaryOrganizationForUser(input.currentUserId);
  const activeOrganizationId = await getActiveOrganizationIdForUser(input.currentUserId);
  const managerMembership = await prisma.organizationMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: activeOrganizationId,
        userId: input.currentUserId,
      },
    },
  });
  if (!managerMembership) {
    throw new Error("Active organization not found.");
  }
  const managerRole = normalizeTeamRole(managerMembership.role);
  if (managerRole !== "owner" && managerRole !== "admin") {
    throw new Error("You do not have permission to manage this team.");
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const user = await getUserByEmail(normalizedEmail);

  if (!user) {
    throw new Error(
      "That person needs a ProposalDock account before you can add them to the team.",
    );
  }

  if (user?.id === input.currentUserId) {
    throw new Error("You are already part of this team.");
  }

  const now = new Date();
  await prisma.organizationMembership.upsert({
    where: {
      organizationId_userId: {
        organizationId: managerMembership.organizationId,
        userId: user.id,
      },
    },
    create: {
      id: crypto.randomUUID(),
      organizationId: managerMembership.organizationId,
      userId: user.id,
      role: input.role,
      status: "active",
      createdAt: now,
      updatedAt: now,
    },
    update: {
      role: input.role,
      status: "active",
      updatedAt: now,
    },
  });

  await prisma.organizationInvite.deleteMany({
    where: {
      organizationId: managerMembership.organizationId,
      email: normalizedEmail,
    },
  });

  return listOrganizationTeamForUser(input.currentUserId);
}

export async function removeOrganizationInvite(input: {
  currentUserId: string;
  inviteId: string;
}) {
  await ensureStore();
  await ensurePrimaryOrganizationForUser(input.currentUserId);
  const activeOrganizationId = await getActiveOrganizationIdForUser(input.currentUserId);
  const managerMembership = await prisma.organizationMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: activeOrganizationId,
        userId: input.currentUserId,
      },
    },
  });
  if (!managerMembership) {
    throw new Error("Active organization not found.");
  }
  const managerRole = normalizeTeamRole(managerMembership.role);
  if (managerRole !== "owner" && managerRole !== "admin") {
    throw new Error("You do not have permission to manage this team.");
  }

  const invite = await prisma.organizationInvite.findUnique({
    where: { id: input.inviteId },
  });
  if (!invite || invite.organizationId !== managerMembership.organizationId) {
    throw new Error("Invite not found.");
  }

  await prisma.organizationInvite.delete({
    where: { id: input.inviteId },
  });

  return listOrganizationTeamForUser(input.currentUserId);
}

export async function updateOrganizationMemberRole(input: {
  currentUserId: string;
  membershipId: string;
  role: TeamRole;
}) {
  await ensureStore();
  await ensurePrimaryOrganizationForUser(input.currentUserId);
  const activeOrganizationId = await getActiveOrganizationIdForUser(input.currentUserId);
  const managerMembership = await prisma.organizationMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: activeOrganizationId,
        userId: input.currentUserId,
      },
    },
  });
  if (!managerMembership) {
    throw new Error("Active organization not found.");
  }
  const managerRole = normalizeTeamRole(managerMembership.role);
  if (managerRole !== "owner" && managerRole !== "admin") {
    throw new Error("You do not have permission to manage this team.");
  }

  const membership = await prisma.organizationMembership.findUnique({
    where: { id: input.membershipId },
  });
  if (!membership || membership.organizationId !== managerMembership.organizationId) {
    throw new Error("Team member not found.");
  }

  await prisma.organizationMembership.update({
    where: { id: input.membershipId },
    data: {
      role: input.role,
      updatedAt: new Date(),
    },
  });

  return listOrganizationTeamForUser(input.currentUserId);
}

export async function removeOrganizationMember(input: {
  currentUserId: string;
  membershipId: string;
}) {
  await ensureStore();
  await ensurePrimaryOrganizationForUser(input.currentUserId);
  const activeOrganizationId = await getActiveOrganizationIdForUser(input.currentUserId);
  const managerMembership = await prisma.organizationMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: activeOrganizationId,
        userId: input.currentUserId,
      },
    },
  });
  if (!managerMembership) {
    throw new Error("Active organization not found.");
  }
  const managerRole = normalizeTeamRole(managerMembership.role);
  if (managerRole !== "owner" && managerRole !== "admin") {
    throw new Error("You do not have permission to manage this team.");
  }

  const membership = await prisma.organizationMembership.findUnique({
    where: { id: input.membershipId },
  });
  if (!membership || membership.organizationId !== managerMembership.organizationId) {
    throw new Error("Team member not found.");
  }

  if (membership.userId === input.currentUserId) {
    throw new Error("You cannot remove yourself from the team here.");
  }

  await prisma.organizationMembership.delete({
    where: { id: input.membershipId },
  });

  return listOrganizationTeamForUser(input.currentUserId);
}

export async function updateUserStripeCustomerId(userId: string, stripeCustomerId: string) {
  await ensureStore();
  return prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId,
      updatedAt: new Date(),
    },
  });
}

export async function updateUserBillingFromStripe(input: {
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeSubscriptionStatus: string | null;
  stripeCurrentPeriodEnd: Date | null;
}) {
  await ensureStore();
  return prisma.user.updateMany({
    where: { stripeCustomerId: input.stripeCustomerId },
    data: {
      stripeSubscriptionId: input.stripeSubscriptionId,
      stripePriceId: input.stripePriceId,
      stripeSubscriptionStatus: input.stripeSubscriptionStatus,
      stripeCurrentPeriodEnd: input.stripeCurrentPeriodEnd,
      updatedAt: new Date(),
    },
  });
}

export async function adoptOrphanedResources(userId: string) {
  await ensureStore();
  await prisma.workspace.updateMany({
    where: { ownerId: null },
    data: { ownerId: userId },
  });

  await prisma.knowledgeAsset.updateMany({
    where: { ownerId: null },
    data: { ownerId: userId },
  });
}
