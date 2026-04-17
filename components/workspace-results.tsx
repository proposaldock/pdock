"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  Download,
  FileText,
  History,
  LibraryBig,
  Plus,
  RefreshCw,
  Save,
  ArrowDown,
  ArrowUp,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import type {
  OrganizationTeam,
  ProposalAnalysis,
  ProposalGenerateMode,
  ProposalRewriteMode,
  Workspace,
  WorkspaceProposalState,
  WorkspaceReviewState,
} from "@/lib/types";
import { cn, isOverdue } from "@/lib/utils";

const proposalSectionTemplates = [
  {
    id: "implementation-approach",
    title: "Implementation Approach",
    content:
      "Describe the proposed delivery phases, governance model, assumptions, dependencies, and how the team will move from kickoff to launch.",
  },
  {
    id: "project-team",
    title: "Project Team",
    content:
      "Outline the proposed core team, specialist roles, leadership coverage, and how subject matter experts will be involved during delivery.",
  },
  {
    id: "timeline-and-milestones",
    title: "Timeline and Milestones",
    content:
      "Summarize the implementation timeline, critical milestones, decision gates, and any assumptions needed to support the plan.",
  },
  {
    id: "support-and-service-model",
    title: "Support and Service Model",
    content:
      "Explain post-launch support, escalation paths, operating coverage, and optional extensions to the support model.",
  },
] as const;

const tabs = [
  "Overview",
  "Requirements",
  "Risks",
  "Draft",
  "Proposal",
  "Activity",
  "Sources",
  "Export",
] as const;
type Tab = (typeof tabs)[number];

const tabDescriptions: Record<
  Tab,
  { title: string; body: string }
> = {
  Overview: {
    title: "See the shape of the brief",
    body: "This view gives you the fastest read on the workspace: summary, complexity, deadline, and the current review posture before you dive into the details.",
  },
  Requirements: {
    title: "Review what the client is asking for",
    body: "Use this section to inspect extracted requirements, accept or reject them, add internal notes, and draft answer fragments your team can build on.",
  },
  Risks: {
    title: "Spot proposal risk before it spreads",
    body: "This section highlights unclear asks, missing evidence, and risky assumptions so the team can decide what needs escalation, clarification, or careful wording.",
  },
  Draft: {
    title: "Shape the first response direction",
    body: "This is where you refine the executive summary and response strategy that will guide the proposal before the full section drafting begins.",
  },
  Proposal: {
    title: "Assemble the response pack",
    body: "Use Proposal to generate, rewrite, approve, assign, and comment on the sections that will turn into your final client-facing response.",
  },
  Activity: {
    title: "Track what changed and who touched it",
    body: "Activity gives you the running timeline for analysis runs, saves, approvals, comments, exports, and follow-up updates across the workspace.",
  },
  Sources: {
    title: "Check the grounding behind the output",
    body: "This section lets you inspect the cited chunks and source material behind the analysis so the team can verify what the AI is leaning on.",
  },
  Export: {
    title: "Get the response out cleanly",
    body: "Export shows readiness, final checks, and the output actions for generating a print view or response pack once the proposal is ready to ship.",
  },
};

function priorityTone(value: string) {
  if (value === "high") return "red";
  if (value === "medium") return "yellow";
  return "green";
}

function statusTone(value: string) {
  if (value === "covered") return "green";
  if (value === "partially_covered") return "yellow";
  return "red";
}

function decisionTone(value: string) {
  if (value === "accepted") return "green";
  if (value === "rejected") return "red";
  return "yellow";
}

function proposalStatusTone(value: "draft" | "in_review" | "approved") {
  if (value === "approved") return "green";
  if (value === "in_review") return "yellow";
  return "zinc";
}

function StatusIcon({ status }: { status: string }) {
  if (status === "covered") return <CheckCircle2 className="size-4 text-emerald-600" />;
  if (status === "partially_covered") {
    return <CircleHelp className="size-4 text-yellow-600" />;
  }
  return <AlertTriangle className="size-4 text-rose-600" />;
}

export function WorkspaceResults({
  workspace,
  team,
}: {
  workspace: Workspace;
  team: OrganizationTeam;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [analysis, setAnalysis] = useState<ProposalAnalysis>(workspace.analysis);
  const [workspaceMeta, setWorkspaceMeta] = useState({
    workspaceName: workspace.workspaceName,
    clientName: workspace.clientName,
    companyKnowledge: workspace.companyKnowledge,
    instructions: workspace.instructions ?? "",
    visibility:
      workspace.visibility === "organization" || workspace.visibility === "selected"
        ? workspace.visibility
        : "private",
    organizationName: workspace.organizationName ?? null,
    sharedUserIds: workspace.sharedWithUsers?.map((item) => item.userId) ?? [],
    sharedWithUsers: workspace.sharedWithUsers ?? [],
  });
  const [savedWorkspaceSetup, setSavedWorkspaceSetup] = useState({
    workspaceName: workspace.workspaceName,
    clientName: workspace.clientName,
    companyKnowledge: workspace.companyKnowledge,
    instructions: workspace.instructions ?? "",
  });
  const [reviewState, setReviewState] = useState<WorkspaceReviewState>(workspace.reviewState);
  const [proposalState, setProposalState] = useState<WorkspaceProposalState>(
    workspace.proposalState,
  );
  const [activityLog, setActivityLog] = useState<Workspace["activityLog"]>(workspace.activityLog);
  const [isEditingSetup, setIsEditingSetup] = useState(false);
  const [isRerunning, setIsRerunning] = useState(false);
  const [isSavingSetup, setIsSavingSetup] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isSavingProposal, setIsSavingProposal] = useState(false);
  const [error, setError] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(
    workspace.analysis.sources[0]?.id ?? null,
  );
  const shareableMembers = useMemo(
    () => team.members.filter((member) => member.userId !== workspace.ownerId),
    [team.members, workspace.ownerId],
  );

  const reviewSummary = useMemo(() => {
    const accepted = reviewState.requirements.filter((item) => item.decision === "accepted").length;
    const rejected = reviewState.requirements.filter((item) => item.decision === "rejected").length;
    const pending = reviewState.requirements.length - accepted - rejected;

    return { accepted, rejected, pending };
  }, [reviewState.requirements]);
  const activeTabDescription = tabDescriptions[activeTab];

  async function rerun() {
    setError("");
    setIsRerunning(true);

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}/reanalyze`, {
        method: "POST",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Re-analysis failed.");
      }

      setAnalysis(payload.workspace.analysis);
      setReviewState(payload.workspace.reviewState);
      setProposalState(payload.workspace.proposalState);
      setActivityLog(payload.workspace.activityLog);
      setSelectedSourceId(payload.workspace.analysis.sources[0]?.id ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Re-analysis failed.");
    } finally {
      setIsRerunning(false);
    }
  }

  async function updateVisibility(
    visibility: "private" | "organization" | "selected",
    sharedUserIds = workspaceMeta.sharedUserIds,
  ) {
    setError("");

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility, sharedUserIds }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to update workspace visibility.");
      }

      const nextWorkspaceMeta = {
        workspaceName: payload.workspace.workspaceName,
        clientName: payload.workspace.clientName,
        companyKnowledge: payload.workspace.companyKnowledge,
        instructions: payload.workspace.instructions ?? "",
        visibility:
          payload.workspace.visibility === "organization" ||
          payload.workspace.visibility === "selected"
            ? payload.workspace.visibility
            : "private",
        organizationName: payload.workspace.organizationName ?? null,
        sharedUserIds: payload.workspace.sharedWithUsers?.map((item: { userId: string }) => item.userId) ?? [],
        sharedWithUsers: payload.workspace.sharedWithUsers ?? [],
      };
      setWorkspaceMeta(nextWorkspaceMeta);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Failed to update workspace visibility.",
      );
    }
  }

  async function saveWorkspaceSetup() {
    setError("");
    setIsSavingSetup(true);

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceName: workspaceMeta.workspaceName,
          clientName: workspaceMeta.clientName,
          companyKnowledge: workspaceMeta.companyKnowledge,
          instructions: workspaceMeta.instructions,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to save workspace setup.");
      }

      const nextWorkspaceMeta = {
        workspaceName: payload.workspace.workspaceName,
        clientName: payload.workspace.clientName,
        companyKnowledge: payload.workspace.companyKnowledge,
        instructions: payload.workspace.instructions ?? "",
        visibility:
          payload.workspace.visibility === "organization" ||
          payload.workspace.visibility === "selected"
            ? payload.workspace.visibility
            : "private",
        organizationName: payload.workspace.organizationName ?? null,
        sharedUserIds:
          payload.workspace.sharedWithUsers?.map((item: { userId: string }) => item.userId) ?? [],
        sharedWithUsers: payload.workspace.sharedWithUsers ?? [],
      };
      setWorkspaceMeta(nextWorkspaceMeta);
      setSavedWorkspaceSetup({
        workspaceName: nextWorkspaceMeta.workspaceName,
        clientName: nextWorkspaceMeta.clientName,
        companyKnowledge: nextWorkspaceMeta.companyKnowledge,
        instructions: nextWorkspaceMeta.instructions,
      });
      setIsEditingSetup(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to save workspace setup.");
    } finally {
      setIsSavingSetup(false);
    }
  }

  async function toggleSharedUser(userId: string) {
    const nextSharedUserIds = workspaceMeta.sharedUserIds.includes(userId)
      ? workspaceMeta.sharedUserIds.filter((item) => item !== userId)
      : [...workspaceMeta.sharedUserIds, userId];

    await updateVisibility("selected", nextSharedUserIds);
  }

  async function persistReview(nextReviewState: WorkspaceReviewState) {
    setError("");
    setIsSavingReview(true);

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewState: nextReviewState }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to save review state.");
      }

      setReviewState(payload.workspace.reviewState);
      setActivityLog(payload.workspace.activityLog);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to save review state.");
    } finally {
      setIsSavingReview(false);
    }
  }

  function updateRequirementReview(
    requirementId: string,
    updates: Partial<WorkspaceReviewState["requirements"][number]>,
  ) {
    const nextReviewState = {
      ...reviewState,
      requirements: reviewState.requirements.map((item) =>
        item.requirementId === requirementId
          ? {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    };

    setReviewState(nextReviewState);
    void persistReview(nextReviewState);
  }

  function updateDraftReview(updates: Partial<WorkspaceReviewState>) {
    const nextReviewState = {
      ...reviewState,
      ...updates,
    };

    setReviewState(nextReviewState);
  }

  async function saveDraftReview() {
    await persistReview(reviewState);
  }

  async function persistProposal(nextProposalState: WorkspaceProposalState) {
    setError("");
    setIsSavingProposal(true);

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}/proposal`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalState: nextProposalState }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to save proposal draft.");
      }

      setProposalState(payload.workspace.proposalState);
      setActivityLog(payload.workspace.activityLog);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to save proposal draft.");
    } finally {
      setIsSavingProposal(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">{workspaceMeta.clientName}</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">{workspaceMeta.workspaceName}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {workspaceMeta.organizationName ? (
              <Badge tone="teal">{workspaceMeta.organizationName}</Badge>
            ) : null}
            <Badge
              tone={
                workspaceMeta.visibility === "organization"
                  ? "green"
                  : workspaceMeta.visibility === "selected"
                    ? "teal"
                    : "zinc"
              }
            >
              {workspaceMeta.visibility === "organization"
                ? "team shared"
                : workspaceMeta.visibility === "selected"
                  ? "selected teammates"
                  : "private"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex flex-wrap rounded-lg border border-zinc-200 bg-white p-1">
            <button
              type="button"
              onClick={() => void updateVisibility("private")}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold",
                workspaceMeta.visibility === "private"
                  ? "bg-zinc-950 text-white"
                  : "text-zinc-600",
              )}
            >
              Private
            </button>
            <button
              type="button"
              onClick={() => void updateVisibility("organization")}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold",
                workspaceMeta.visibility === "organization"
                  ? "bg-emerald-500 text-zinc-950"
                  : "text-zinc-600",
              )}
            >
              Team shared
            </button>
            <button
              type="button"
              onClick={() => void updateVisibility("selected")}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold",
                workspaceMeta.visibility === "selected"
                  ? "bg-teal-500 text-zinc-950"
                  : "text-zinc-600",
              )}
            >
              Selected teammates
            </button>
          </div>
          <Button
            variant="secondary"
            onClick={rerun}
            disabled={isRerunning}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={cn("size-4", isRerunning && "animate-spin")} />
            {isRerunning ? "Running..." : "Re-run analysis"}
          </Button>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-950">Workspace setup</p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              Review or edit the original client name, company knowledge, and AI instructions used
              when this workspace was created.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsEditingSetup((current) => !current)}
          >
            {isEditingSetup ? "Close setup" : "Edit setup"}
          </Button>
        </div>

        {isEditingSetup ? (
          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Workspace name
                <input
                  value={workspaceMeta.workspaceName}
                  onChange={(event) =>
                    setWorkspaceMeta({ ...workspaceMeta, workspaceName: event.target.value })
                  }
                  className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Client/company name
                <input
                  value={workspaceMeta.clientName}
                  onChange={(event) =>
                    setWorkspaceMeta({ ...workspaceMeta, clientName: event.target.value })
                  }
                  className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold">
              Background material
              <textarea
                rows={6}
                value={workspaceMeta.companyKnowledge}
                onChange={(event) =>
                  setWorkspaceMeta({ ...workspaceMeta, companyKnowledge: event.target.value })
                }
                className="rounded-lg border border-zinc-300 p-3 text-sm leading-6 outline-none focus:border-emerald-500"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Special instructions / tone
              <textarea
                rows={4}
                value={workspaceMeta.instructions}
                onChange={(event) =>
                  setWorkspaceMeta({ ...workspaceMeta, instructions: event.target.value })
                }
                className="rounded-lg border border-zinc-300 p-3 text-sm leading-6 outline-none focus:border-emerald-500"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={saveWorkspaceSetup} disabled={isSavingSetup}>
                <Save className="size-4" />
                {isSavingSetup ? "Saving..." : "Save setup"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setWorkspaceMeta({
                    ...workspaceMeta,
                    ...savedWorkspaceSetup,
                  });
                  setIsEditingSetup(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
          {error}
        </div>
      ) : null}

      {workspaceMeta.visibility === "selected" ? (
        <div className="mt-5 rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-zinc-900">Shared with</p>
            <Badge tone="teal">{workspaceMeta.sharedUserIds.length} selected</Badge>
          </div>
          {shareableMembers.length ? (
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {shareableMembers.map((member) => {
                const selected = workspaceMeta.sharedUserIds.includes(member.userId);

                return (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => void toggleSharedUser(member.userId)}
                    className={cn(
                      "rounded-lg border px-4 py-3 text-left transition",
                      selected
                        ? "border-teal-400 bg-teal-50"
                        : "border-zinc-200 bg-zinc-50 hover:border-zinc-300",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{member.name}</p>
                        <p className="mt-1 text-xs text-zinc-500">{member.email}</p>
                      </div>
                      <Badge tone={selected ? "green" : "zinc"}>
                        {selected ? "has access" : "not shared"}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600">
              Invite teammates in Settings to share this workspace with selected people.
            </div>
          )}
        </div>
      ) : null}

      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-zinc-200 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "border-b-2 px-3 py-3 text-sm font-semibold transition",
              activeTab === tab
                ? "border-emerald-500 text-zinc-950"
                : "border-transparent text-zinc-500 hover:text-zinc-900",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-sm font-semibold text-zinc-950">{activeTabDescription.title}</p>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{activeTabDescription.body}</p>
      </div>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Workspace snapshot
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="teal">{workspace.documents.length} source files</Badge>
          <Badge tone="teal">{workspace.knowledgeAssets?.length ?? 0} knowledge assets</Badge>
          <Badge tone="zinc">
            {workspace.documents.reduce((sum, document) => sum + document.characterCount, 0)} chars
            parsed
          </Badge>
          <Badge tone="yellow">{analysis.sources.length} cited chunks</Badge>
          <Badge tone="green">{reviewSummary.accepted} accepted</Badge>
          <Badge tone="red">{reviewSummary.rejected} rejected</Badge>
          <Badge tone="yellow">{reviewSummary.pending} pending</Badge>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "Overview" ? (
          <Overview analysis={analysis} reviewSummary={reviewSummary} />
        ) : null}
        {activeTab === "Requirements" ? (
          <Requirements
            analysis={analysis}
            reviewState={reviewState}
            onUpdateRequirement={updateRequirementReview}
            onSelectSource={setSelectedSourceId}
            selectedSourceId={selectedSourceId}
            isSavingReview={isSavingReview}
          />
        ) : null}
        {activeTab === "Risks" ? (
          <Risks
            analysis={analysis}
            onSelectSource={setSelectedSourceId}
            selectedSourceId={selectedSourceId}
          />
        ) : null}
        {activeTab === "Draft" ? (
          <Draft
            analysis={analysis}
            reviewState={reviewState}
            onChangeDraft={updateDraftReview}
            onSaveDraft={saveDraftReview}
            onSelectSource={setSelectedSourceId}
            selectedSourceId={selectedSourceId}
            isSavingReview={isSavingReview}
          />
        ) : null}
        {activeTab === "Proposal" ? (
          <ProposalAssembly
            analysis={analysis}
            workspaceId={workspace.id}
            proposalState={proposalState}
            onChange={setProposalState}
            onActivityLogChange={setActivityLog}
            onSave={() => persistProposal(proposalState)}
            isSavingProposal={isSavingProposal}
          />
        ) : null}
        {activeTab === "Activity" ? (
          <ActivityLogView activityLog={activityLog} sections={proposalState.sections} />
        ) : null}
        {activeTab === "Sources" ? (
          <Sources
            analysis={analysis}
            onSelectSource={setSelectedSourceId}
            selectedSourceId={selectedSourceId}
          />
        ) : null}
        {activeTab === "Export" ? (
          <ExportView
            workspaceId={workspace.id}
            analysis={analysis}
            reviewState={reviewState}
            proposalState={proposalState}
          />
        ) : null}
      </div>
    </div>
  );
}

function formatRequirementMatrixExport(
  analysis: ProposalAnalysis,
  reviewState: WorkspaceReviewState,
) {
  return analysis.requirements
    .map((requirement) => {
      const review = reviewState.requirements.find(
        (item) => item.requirementId === requirement.id,
      );

      return [
        `${requirement.id} | ${requirement.title}`,
        `Priority: ${requirement.priority}`,
        `Coverage: ${requirement.status}`,
        `Decision: ${review?.decision ?? "pending"}`,
        `Needs SME: ${requirement.needsSME ? "yes" : "no"}`,
        `Requirement: ${requirement.description}`,
        `Review note: ${review?.note || "-"}`,
        `Draft answer: ${review?.draftAnswer || "-"}`,
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

function formatReviewedAnswersExport(
  analysis: ProposalAnalysis,
  reviewState: WorkspaceReviewState,
) {
  return analysis.requirements
    .map((requirement) => {
      const review = reviewState.requirements.find(
        (item) => item.requirementId === requirement.id,
      );

      if (!review?.draftAnswer.trim()) return null;

      return [
        `${requirement.id}: ${requirement.title}`,
        `Decision: ${review.decision}`,
        `Answer: ${review.draftAnswer.trim()}`,
        review.note.trim() ? `Internal note: ${review.note.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .filter(Boolean)
    .join("\n\n");
}

function SourceRefs({
  refs,
  analysis,
  onSelectSource,
  selectedSourceId,
}: {
  refs?: string[];
  analysis: ProposalAnalysis;
  onSelectSource: (id: string) => void;
  selectedSourceId: string | null;
}) {
  const items = (refs ?? [])
    .map((ref) => analysis.sources.find((source) => source.id === ref))
    .filter((source): source is ProposalAnalysis["sources"][number] => Boolean(source));

  if (!items.length) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((source) => (
        <button
          key={source.id}
          type="button"
          onClick={() => onSelectSource(source.id)}
          className="rounded-md"
        >
          <Badge tone={selectedSourceId === source.id ? "teal" : "zinc"} title={source.label}>
            {source.id}
          </Badge>
        </button>
      ))}
    </div>
  );
}

function Overview({
  analysis,
  reviewSummary,
}: {
  analysis: ProposalAnalysis;
  reviewSummary: { accepted: number; rejected: number; pending: number };
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
      <Card>
        <CardHeader>
          <CardTitle>Executive view</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-7 text-zinc-700">{analysis.overview.summary}</p>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        <Metric label="Document type" value={analysis.overview.documentType} />
        <Metric
          label="Deadline"
          value={analysis.overview.submissionDeadline || "Not specified"}
        />
        <Metric
          label="Complexity"
          value={analysis.overview.estimatedComplexity}
          tone={priorityTone(analysis.overview.estimatedComplexity)}
        />
        <Metric label="Accepted requirements" value={String(reviewSummary.accepted)} tone="green" />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "zinc",
}: {
  label: string;
  value: string;
  tone?: "green" | "yellow" | "red" | "zinc" | "teal";
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-zinc-500">{label}</p>
        <div className="mt-2">
          <Badge tone={tone}>{value}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function Requirements({
  analysis,
  reviewState,
  onUpdateRequirement,
  onSelectSource,
  selectedSourceId,
  isSavingReview,
}: {
  analysis: ProposalAnalysis;
  reviewState: WorkspaceReviewState;
  onUpdateRequirement: (
    requirementId: string,
    updates: Partial<WorkspaceReviewState["requirements"][number]>,
  ) => void;
  onSelectSource: (id: string) => void;
  selectedSourceId: string | null;
  isSavingReview: boolean;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <div className="grid gap-4">
        {analysis.requirements.map((requirement) => {
          const review =
            reviewState.requirements.find((item) => item.requirementId === requirement.id) ??
            null;

          return (
            <Card key={requirement.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusIcon status={requirement.status} />
                      <p className="font-bold">
                        {requirement.id}: {requirement.title}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      {requirement.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Badge tone={priorityTone(requirement.priority)}>{requirement.priority}</Badge>
                    <Badge tone={statusTone(requirement.status)}>
                      {requirement.status.replace("_", " ")}
                    </Badge>
                    {requirement.needsSME ? <Badge tone="teal">SME needed</Badge> : null}
                    <Badge tone={decisionTone(review?.decision ?? "pending")}>
                      {(review?.decision ?? "pending").replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={review?.decision === "accepted" ? "default" : "secondary"}
                    onClick={() =>
                      onUpdateRequirement(requirement.id, {
                        decision: "accepted",
                      })
                    }
                  >
                    <CheckCircle2 className="size-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant={review?.decision === "rejected" ? "default" : "secondary"}
                    onClick={() =>
                      onUpdateRequirement(requirement.id, {
                        decision: "rejected",
                      })
                    }
                  >
                    <XCircle className="size-4" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant={review?.decision === "pending" ? "default" : "secondary"}
                    onClick={() =>
                      onUpdateRequirement(requirement.id, {
                        decision: "pending",
                      })
                    }
                  >
                    <CircleHelp className="size-4" />
                    Pending
                  </Button>
                  {isSavingReview ? <Badge tone="zinc">Saving...</Badge> : null}
                </div>

                <div className="mt-4 grid gap-4">
                  <label className="grid gap-2 text-sm font-semibold">
                    Review note
                    <textarea
                      rows={3}
                      value={review?.note ?? ""}
                      onChange={(event) =>
                        onUpdateRequirement(requirement.id, {
                          note: event.target.value,
                        })
                      }
                      className="rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-500"
                      placeholder="Capture SME follow-up, legal caveats, or bid-team guidance..."
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    Draft answer
                    <textarea
                      rows={4}
                      value={review?.draftAnswer ?? ""}
                      onChange={(event) =>
                        onUpdateRequirement(requirement.id, {
                          draftAnswer: event.target.value,
                        })
                      }
                      className="rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-500"
                      placeholder="Start the answer your team actually wants to submit..."
                    />
                  </label>
                </div>

                <SourceRefs
                  refs={requirement.sourceRefs}
                  analysis={analysis}
                  onSelectSource={onSelectSource}
                  selectedSourceId={selectedSourceId}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
      <SourcePreview analysis={analysis} selectedSourceId={selectedSourceId} />
    </div>
  );
}

function Risks({
  analysis,
  onSelectSource,
  selectedSourceId,
}: {
  analysis: ProposalAnalysis;
  onSelectSource: (id: string) => void;
  selectedSourceId: string | null;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <div className="grid gap-4">
        {analysis.risks.map((risk) => (
          <Card key={risk.title}>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold">{risk.title}</h3>
                <Badge tone={priorityTone(risk.severity)}>{risk.severity}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{risk.description}</p>
              <div className="mt-4 rounded-lg bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
                <span className="font-semibold text-zinc-950">Recommendation: </span>
                {risk.recommendation}
              </div>
              <SourceRefs
                refs={risk.sourceRefs}
                analysis={analysis}
                onSelectSource={onSelectSource}
                selectedSourceId={selectedSourceId}
              />
            </CardContent>
          </Card>
        ))}
      </div>
      <SourcePreview analysis={analysis} selectedSourceId={selectedSourceId} />
    </div>
  );
}

function Draft({
  analysis,
  reviewState,
  onChangeDraft,
  onSaveDraft,
  onSelectSource,
  selectedSourceId,
  isSavingReview,
}: {
  analysis: ProposalAnalysis;
  reviewState: WorkspaceReviewState;
  onChangeDraft: (updates: Partial<WorkspaceReviewState>) => void;
  onSaveDraft: () => Promise<void>;
  onSelectSource: (id: string) => void;
  selectedSourceId: string | null;
  isSavingReview: boolean;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <div className="grid gap-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Executive summary</CardTitle>
            <div className="flex gap-2">
              <CopyButton text={reviewState.executiveSummary} />
              <Button size="sm" onClick={onSaveDraft} disabled={isSavingReview}>
                <Save className="size-4" />
                {isSavingReview ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              rows={8}
              value={reviewState.executiveSummary}
              onChange={(event) =>
                onChangeDraft({ executiveSummary: event.target.value })
              }
              className="w-full rounded-lg border border-zinc-300 p-3 text-sm leading-7 outline-none focus:border-emerald-500"
            />
            <SourceRefs
              refs={analysis.draft.sourceRefs}
              analysis={analysis}
              onSelectSource={onSelectSource}
              selectedSourceId={selectedSourceId}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Response strategy</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <textarea
              rows={8}
              value={reviewState.responseStrategy}
              onChange={(event) =>
                onChangeDraft({ responseStrategy: event.target.value })
              }
              className="w-full rounded-lg border border-zinc-300 p-3 text-sm leading-7 outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={onSaveDraft} disabled={isSavingReview}>
                <Save className="size-4" />
                {isSavingReview ? "Saving..." : "Save draft edits"}
              </Button>
            </div>
            <SourceRefs
              refs={analysis.draft.sourceRefs}
              analysis={analysis}
              onSelectSource={onSelectSource}
              selectedSourceId={selectedSourceId}
            />
          </CardContent>
        </Card>
        <div className="grid gap-5 lg:grid-cols-2">
          <ListCard title="Key differentiators" items={analysis.draft.keyDifferentiators} />
          <ListCard title="Open questions" items={analysis.draft.openQuestions} />
        </div>
      </div>
      <SourcePreview analysis={analysis} selectedSourceId={selectedSourceId} />
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item} className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function Sources({
  analysis,
  onSelectSource,
  selectedSourceId,
}: {
  analysis: ProposalAnalysis;
  onSelectSource: (id: string) => void;
  selectedSourceId: string | null;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-4">
        {analysis.sources.map((source) => (
          <button
            key={source.id}
            type="button"
            onClick={() => onSelectSource(source.id)}
            className="text-left"
          >
            <Card
              className={cn(
                "transition hover:border-emerald-300",
                selectedSourceId === source.id && "border-emerald-400 ring-1 ring-emerald-300",
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{source.label}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      {source.sourceType === "knowledge_asset" ? (
                        <>
                          <LibraryBig className="size-3.5" />
                          <span>{source.assetTitle}</span>
                        </>
                      ) : (
                        <>
                          <FileText className="size-3.5" />
                          <span>{source.documentLabel}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge tone="zinc">{source.id}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{source.excerpt}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
      <SourcePreview analysis={analysis} selectedSourceId={selectedSourceId} />
    </div>
  );
}

function ProposalAssembly({
  analysis,
  workspaceId,
  proposalState,
  onChange,
  onActivityLogChange,
  onSave,
  isSavingProposal,
}: {
  analysis: ProposalAnalysis;
  workspaceId: string;
  proposalState: WorkspaceProposalState;
  onChange: (state: WorkspaceProposalState) => void;
  onActivityLogChange: (activityLog: Workspace["activityLog"]) => void;
  onSave: () => Promise<void>;
  isSavingProposal: boolean;
}) {
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [rewritingSectionId, setRewritingSectionId] = useState<string | null>(null);
  const [generatingSectionId, setGeneratingSectionId] = useState<string | null>(null);
  const [compareSnapshotId, setCompareSnapshotId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, { author: string; body: string }>>({});
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    proposalState.sections[0]?.id ?? null,
  );

  const selectedSection =
    proposalState.sections.find((section) => section.id === selectedSectionId) ??
    proposalState.sections[0] ??
    null;
  const selectedSectionSources = selectedSection
    ? selectedSection.sourceRefs
        .map((ref) => analysis.sources.find((source) => source.id === ref))
        .filter((source): source is ProposalAnalysis["sources"][number] => Boolean(source))
    : [];
  const compareSnapshot =
    proposalState.snapshots.find((snapshot) => snapshot.id === compareSnapshotId) ?? null;
  const readiness = useMemo(() => {
    const approved = proposalState.sections.filter((section) => section.status === "approved");
    const missingContent = proposalState.sections.filter((section) => !section.content.trim());
    const missingEvidence = proposalState.sections.filter((section) => section.sourceRefs.length === 0);
    const missingSignoff = proposalState.sections.filter(
      (section) => section.status === "approved" && !section.reviewerName.trim(),
    );

    return {
      approvedCount: approved.length,
      totalCount: proposalState.sections.length,
      ready:
        proposalState.sections.length > 0 &&
        missingContent.length === 0 &&
        missingEvidence.length === 0 &&
        missingSignoff.length === 0 &&
        approved.length === proposalState.sections.length,
      missingContent,
      missingEvidence,
      missingSignoff,
    };
  }, [proposalState.sections]);

  function updateSection(
    sectionId: string,
    updates: Partial<WorkspaceProposalState["sections"][number]>,
  ) {
    onChange({
      ...proposalState,
      sections: proposalState.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section,
      ),
    });
  }

  function moveSection(sectionId: string, direction: "up" | "down") {
    const index = proposalState.sections.findIndex((section) => section.id === sectionId);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= proposalState.sections.length) return;

    const next = [...proposalState.sections];
    const [section] = next.splice(index, 1);
    next.splice(targetIndex, 0, section);
    onChange({ ...proposalState, sections: next });
  }

  function addSection() {
    onChange({
      ...proposalState,
      sections: [
        ...proposalState.sections,
        {
          id: `section-custom-${crypto.randomUUID()}`,
          title: "New Section",
          content: "",
          sourceRequirementIds: [],
          sourceRefs: [],
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
    });
  }

  function insertTemplate(template: (typeof proposalSectionTemplates)[number]) {
    onChange({
      ...proposalState,
      sections: [
        ...proposalState.sections,
        {
          id: `section-template-${template.id}-${crypto.randomUUID()}`,
          title: template.title,
          content: template.content,
          sourceRequirementIds: [],
          sourceRefs: [],
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
    });
  }

  function addComment(sectionId: string) {
    const draft = commentDrafts[sectionId];
    if (!draft?.body.trim()) return;

    const section = proposalState.sections.find((item) => item.id === sectionId);
    if (!section) return;

    updateSection(sectionId, {
      comments: [
        ...section.comments,
        {
          id: crypto.randomUUID(),
          author: draft.author.trim() || "Reviewer",
          body: draft.body.trim(),
          createdAt: new Date().toISOString(),
        },
      ],
    });

    setCommentDrafts((current) => ({
      ...current,
      [sectionId]: {
        author: current[sectionId]?.author ?? "",
        body: "",
      },
    }));
  }

  async function createSnapshot() {
    setIsSavingSnapshot(true);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_snapshot" }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to create snapshot.");
      }

      onChange(payload.workspace.proposalState);
      onActivityLogChange(payload.workspace.activityLog);
    } catch (caught) {
      window.alert(
        caught instanceof Error ? caught.message : "Failed to create snapshot.",
      );
    } finally {
      setIsSavingSnapshot(false);
    }
  }

  async function restoreSnapshot(snapshotId: string) {
    setIsSavingSnapshot(true);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore_snapshot", snapshotId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to restore snapshot.");
      }

      onChange(payload.workspace.proposalState);
      onActivityLogChange(payload.workspace.activityLog);
    } catch (caught) {
      window.alert(
        caught instanceof Error ? caught.message : "Failed to restore snapshot.",
      );
    } finally {
      setIsSavingSnapshot(false);
    }
  }

  async function rewriteSection(sectionId: string, mode: ProposalRewriteMode) {
    setRewritingSectionId(sectionId);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/proposal/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, mode }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to rewrite section.");
      }

      updateSection(sectionId, payload.rewritten);
    } catch (caught) {
      window.alert(caught instanceof Error ? caught.message : "Failed to rewrite section.");
    } finally {
      setRewritingSectionId(null);
    }
  }

  async function generateSection(sectionId: string, mode: ProposalGenerateMode) {
    setGeneratingSectionId(sectionId);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/proposal/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, mode }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to generate section.");
      }

      updateSection(sectionId, payload.generated);
    } catch (caught) {
      window.alert(caught instanceof Error ? caught.message : "Failed to generate section.");
    } finally {
      setGeneratingSectionId(null);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Proposal assembly</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Arrange a section-based proposal draft from reviewed content.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={createSnapshot} disabled={isSavingSnapshot}>
            <History className="size-4" />
            {isSavingSnapshot ? "Saving snapshot..." : "Save snapshot"}
          </Button>
          <Button variant="secondary" onClick={addSection}>
            <Plus className="size-4" />
            Add section
          </Button>
          <Button onClick={onSave} disabled={isSavingProposal}>
            <Save className="size-4" />
            {isSavingProposal ? "Saving..." : "Save proposal"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Readiness check</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone={readiness.ready ? "green" : "yellow"}>
              {readiness.ready ? "Ready for export" : "Needs review"}
            </Badge>
            <Badge tone="green">
              {readiness.approvedCount}/{readiness.totalCount} approved
            </Badge>
            <Badge tone={readiness.missingContent.length ? "red" : "green"}>
              {readiness.missingContent.length} empty sections
            </Badge>
            <Badge tone={readiness.missingEvidence.length ? "yellow" : "green"}>
              {readiness.missingEvidence.length} without evidence
            </Badge>
            <Badge tone={readiness.missingSignoff.length ? "yellow" : "green"}>
              {readiness.missingSignoff.length} missing signoff
            </Badge>
          </div>
          {!readiness.ready ? (
            <div className="grid gap-2 text-sm text-zinc-600">
              {readiness.missingContent.length ? (
                <p>
                  Empty: {readiness.missingContent.map((section) => section.title).join(", ")}
                </p>
              ) : null}
              {readiness.missingEvidence.length ? (
                <p>
                  Missing evidence:{" "}
                  {readiness.missingEvidence.map((section) => section.title).join(", ")}
                </p>
              ) : null}
              {readiness.missingSignoff.length ? (
                <p>
                  Approved but unsigned:{" "}
                  {readiness.missingSignoff.map((section) => section.title).join(", ")}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-zinc-600">
              Every section is approved, signed off, and grounded in cited evidence.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Section templates</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {proposalSectionTemplates.map((template) => (
              <div
                key={template.id}
                className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4"
              >
                <div>
                  <p className="font-semibold text-zinc-950">{template.title}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{template.content}</p>
                </div>
                <div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => insertTemplate(template)}
                  >
                    <Plus className="size-4" />
                    Use template
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Version snapshots</CardTitle>
          </CardHeader>
          <CardContent>
            {proposalState.snapshots.length ? (
              <div className="grid gap-3">
                {proposalState.snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-zinc-950">{snapshot.name}</p>
                      <p className="mt-1 text-sm text-zinc-600">
                        {new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(snapshot.createdAt))}
                      </p>
                      <div className="mt-2">
                        <Badge tone="zinc">
                          {snapshot.sections.length} section
                          {snapshot.sections.length === 1 ? "" : "s"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => restoreSnapshot(snapshot.id)}
                        disabled={isSavingSnapshot}
                      >
                        Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setCompareSnapshotId((current) =>
                            current === snapshot.id ? null : snapshot.id,
                          )
                        }
                      >
                        {compareSnapshotId === snapshot.id ? "Hide compare" : "Compare"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm leading-6 text-zinc-600">
                Save a snapshot before larger edits so you can branch the proposal draft and roll back cleanly.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {compareSnapshot ? (
        <ProposalSnapshotCompare
          currentSections={proposalState.sections}
          snapshot={compareSnapshot}
        />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.72fr]">
        <div className="grid gap-5">
          {proposalState.sections.map((section, index) => (
            <div
              key={section.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedSectionId(section.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedSectionId(section.id);
                }
              }}
              className="text-left"
            >
              <Card
                className={cn(
                  "transition hover:border-emerald-300",
                  selectedSection?.id === section.id && "border-emerald-400 ring-1 ring-emerald-300",
                )}
              >
                <CardContent className="grid gap-4 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge tone="zinc">Section {index + 1}</Badge>
                      {section.sourceRequirementIds.length ? (
                        <Badge tone="teal">
                          {section.sourceRequirementIds.length} source requirement
                          {section.sourceRequirementIds.length > 1 ? "s" : ""}
                        </Badge>
                      ) : null}
                      {section.sourceRefs.length ? (
                        <Badge tone="yellow">
                          {section.sourceRefs.length} cited chunk
                          {section.sourceRefs.length > 1 ? "s" : ""}
                        </Badge>
                      ) : null}
                      <Badge tone={proposalStatusTone(section.status)}>
                        {section.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          moveSection(section.id, "up");
                        }}
                        disabled={index === 0}
                      >
                        <ArrowUp className="size-4" />
                        Up
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          moveSection(section.id, "down");
                        }}
                        disabled={index === proposalState.sections.length - 1}
                      >
                        <ArrowDown className="size-4" />
                        Down
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={section.content.trim() ? "secondary" : "default"}
                      onClick={(event) => {
                        event.stopPropagation();
                        void generateSection(section.id, "first_draft");
                      }}
                      disabled={generatingSectionId === section.id}
                    >
                      {generatingSectionId === section.id
                        ? "Generating..."
                        : section.content.trim()
                          ? "Regenerate draft"
                          : "Generate first draft"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(event) => {
                        event.stopPropagation();
                        void rewriteSection(section.id, "tighten");
                      }}
                      disabled={
                        rewritingSectionId === section.id || generatingSectionId === section.id
                      }
                    >
                      {rewritingSectionId === section.id ? "Rewriting..." : "Tighten"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(event) => {
                        event.stopPropagation();
                        void rewriteSection(section.id, "executive");
                      }}
                      disabled={
                        rewritingSectionId === section.id || generatingSectionId === section.id
                      }
                    >
                      {rewritingSectionId === section.id ? "Rewriting..." : "More executive"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(event) => {
                        event.stopPropagation();
                        void rewriteSection(section.id, "compliance");
                      }}
                      disabled={
                        rewritingSectionId === section.id || generatingSectionId === section.id
                      }
                    >
                      {rewritingSectionId === section.id ? "Rewriting..." : "More compliant"}
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-[0.75fr_1fr]">
                    <label className="grid gap-2 text-sm font-semibold">
                      Review status
                      <select
                        value={section.status}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          updateSection(section.id, {
                            status: event.target.value as typeof section.status,
                            signedOffAt:
                              event.target.value === "approved"
                                ? section.signedOffAt ?? new Date().toISOString()
                                : null,
                          })
                        }
                        className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="in_review">In review</option>
                        <option value="approved">Approved</option>
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Reviewer signoff
                      <input
                        value={section.reviewerName}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          updateSection(section.id, {
                            reviewerName: event.target.value,
                            signedOffAt:
                              event.target.value.trim() && section.status === "approved"
                                ? section.signedOffAt ?? new Date().toISOString()
                                : section.signedOffAt,
                          })
                        }
                        placeholder="Name or role"
                        className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
                    <label className="grid gap-2 text-sm font-semibold">
                      Section owner
                      <input
                        value={section.assigneeName}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          updateSection(section.id, { assigneeName: event.target.value })
                        }
                        placeholder="Owner or SME"
                        className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Follow-up
                      <input
                        value={section.followUpNote}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          updateSection(section.id, { followUpNote: event.target.value })
                        }
                        placeholder="Open question, dependency, or next step"
                        className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-[0.8fr_1fr]">
                    <label className="grid gap-2 text-sm font-semibold">
                      Follow-up due date
                      <input
                        type="date"
                        value={section.followUpDueDate ?? ""}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          updateSection(section.id, {
                            followUpDueDate: event.target.value || null,
                          })
                        }
                        className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
                      />
                    </label>
                    <div className="flex flex-wrap items-end gap-2">
                      {section.followUpDueDate ? (
                        <Badge
                          tone={
                            section.followUpRequired && isOverdue(section.followUpDueDate)
                              ? "red"
                              : "zinc"
                          }
                        >
                          Due {section.followUpDueDate}
                        </Badge>
                      ) : null}
                      {section.followUpRequired && isOverdue(section.followUpDueDate) ? (
                        <Badge tone="red">Overdue</Badge>
                      ) : null}
                    </div>
                  </div>
                  <label className="flex items-center gap-3 text-sm font-semibold text-zinc-700">
                    <input
                      type="checkbox"
                      checked={section.followUpRequired}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) =>
                        updateSection(section.id, {
                          followUpRequired: event.target.checked,
                        })
                      }
                      className="size-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Follow-up still required
                  </label>
                  {section.signedOffAt ? (
                    <p className="text-xs font-medium text-zinc-500">
                      Signed off {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(section.signedOffAt))}
                    </p>
                  ) : null}
                  <div className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-zinc-950">Discussion</p>
                      <div className="flex gap-2">
                        {section.assigneeName ? <Badge tone="teal">{section.assigneeName}</Badge> : null}
                        {section.followUpRequired ? <Badge tone="yellow">Follow-up open</Badge> : null}
                        {section.followUpRequired && isOverdue(section.followUpDueDate) ? (
                          <Badge tone="red">Overdue</Badge>
                        ) : null}
                        <Badge tone="zinc">
                          {section.comments.length} comment{section.comments.length === 1 ? "" : "s"}
                        </Badge>
                      </div>
                    </div>
                    {section.comments.length ? (
                      <div className="grid gap-3">
                        {section.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="rounded-lg border border-zinc-200 bg-white p-3"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-zinc-950">
                                {comment.author}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {new Intl.DateTimeFormat("en", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                }).format(new Date(comment.createdAt))}
                              </p>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                              {comment.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-600">No section comments yet.</p>
                    )}
                    <div className="grid gap-3 md:grid-cols-[0.7fr_1fr_auto] md:items-start">
                      <input
                        value={commentDrafts[section.id]?.author ?? ""}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          setCommentDrafts((current) => ({
                            ...current,
                            [section.id]: {
                              author: event.target.value,
                              body: current[section.id]?.body ?? "",
                            },
                          }))
                        }
                        placeholder="Reviewer name"
                        className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
                      />
                      <textarea
                        rows={3}
                        value={commentDrafts[section.id]?.body ?? ""}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          setCommentDrafts((current) => ({
                            ...current,
                            [section.id]: {
                              author: current[section.id]?.author ?? "",
                              body: event.target.value,
                            },
                          }))
                        }
                        placeholder="Add a review comment, follow-up, or discussion note..."
                        className="rounded-lg border border-zinc-300 p-3 text-sm leading-6 outline-none focus:border-emerald-500"
                      />
                      <Button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          addComment(section.id);
                        }}
                        disabled={!commentDrafts[section.id]?.body?.trim()}
                      >
                        Add comment
                      </Button>
                    </div>
                  </div>
                  <label className="grid gap-2 text-sm font-semibold">
                    Section title
                    <input
                      value={section.title}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) =>
                        updateSection(section.id, { title: event.target.value })
                      }
                      className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    Section content
                    <textarea
                      rows={10}
                      value={section.content}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) =>
                        updateSection(section.id, { content: event.target.value })
                      }
                      className="rounded-lg border border-zinc-300 p-3 text-sm leading-7 outline-none focus:border-emerald-500"
                    />
                  </label>
                  <SourceRefs
                    refs={section.sourceRefs}
                    analysis={analysis}
                    onSelectSource={() => {
                      setSelectedSectionId(section.id);
                    }}
                    selectedSourceId={null}
                  />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <ProposalEvidencePanel analysis={analysis} section={selectedSection} sources={selectedSectionSources} />
      </div>
    </div>
  );
}

function ProposalSnapshotCompare({
  currentSections,
  snapshot,
}: {
  currentSections: WorkspaceProposalState["sections"];
  snapshot: WorkspaceProposalState["snapshots"][number];
}) {
  const comparisons = useMemo(() => {
    const currentById = new Map(currentSections.map((section) => [section.id, section]));
    const snapshotById = new Map(snapshot.sections.map((section) => [section.id, section]));
    const allIds = [...new Set([...currentById.keys(), ...snapshotById.keys()])];

    return allIds.map((id) => {
      const current = currentById.get(id) ?? null;
      const previous = snapshotById.get(id) ?? null;
      const currentContent = current?.content.trim() ?? "";
      const previousContent = previous?.content.trim() ?? "";
      const changed =
        !current ||
        !previous ||
        current.title !== previous.title ||
        currentContent !== previousContent ||
        current.status !== previous.status;

      let changeType: "added" | "removed" | "changed" | "unchanged" = "unchanged";
      if (current && !previous) changeType = "added";
      else if (!current && previous) changeType = "removed";
      else if (changed) changeType = "changed";

      return {
        id,
        current,
        previous,
        changed,
        changeType,
      };
    });
  }, [currentSections, snapshot.sections]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Snapshot compare</CardTitle>
        <p className="text-sm text-zinc-600">
          Comparing the active draft against {snapshot.name}.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        {comparisons.map((item) => (
          <div key={item.id} className="rounded-lg border border-zinc-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-zinc-950">
                {item.current?.title || item.previous?.title || "Untitled section"}
              </p>
              <Badge
                tone={
                  item.changeType === "added"
                    ? "green"
                    : item.changeType === "removed"
                      ? "red"
                      : item.changeType === "changed"
                        ? "yellow"
                        : "zinc"
                }
              >
                {item.changeType}
              </Badge>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Current draft
                </p>
                {item.current ? (
                  <>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone={proposalStatusTone(item.current.status)}>
                        {item.current.status.replace("_", " ")}
                      </Badge>
                      {item.current.reviewerName ? (
                        <Badge tone="zinc">{item.current.reviewerName}</Badge>
                      ) : null}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                      {item.current.content || "No content in current draft."}
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-zinc-500">Section does not exist in current draft.</p>
                )}
              </div>
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Snapshot
                </p>
                {item.previous ? (
                  <>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone={proposalStatusTone(item.previous.status)}>
                        {item.previous.status.replace("_", " ")}
                      </Badge>
                      {item.previous.reviewerName ? (
                        <Badge tone="zinc">{item.previous.reviewerName}</Badge>
                      ) : null}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                      {item.previous.content || "No content in snapshot."}
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-zinc-500">Section did not exist in this snapshot.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ProposalEvidencePanel({
  analysis,
  section,
  sources,
}: {
  analysis: ProposalAnalysis;
  section: WorkspaceProposalState["sections"][number] | null;
  sources: ProposalAnalysis["sources"];
}) {
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(
    sources[0]?.id ?? null,
  );
  const activeSource =
    sources.find((source) => source.id === selectedEvidenceId) ?? sources[0] ?? null;

  if (!section) {
    return (
      <Card className="h-fit">
        <CardContent className="p-5 text-sm text-zinc-600">
          No proposal section selected yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit xl:sticky xl:top-6">
      <CardHeader>
        <CardTitle>Section evidence</CardTitle>
        <p className="text-sm text-zinc-600">{section.title}</p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone="zinc">{section.sourceRequirementIds.length} linked requirements</Badge>
          <Badge tone="yellow">{section.sourceRefs.length} cited chunks</Badge>
        </div>
        {section.sourceRequirementIds.length ? (
          <div className="flex flex-wrap gap-2">
            {section.sourceRequirementIds.map((requirementId) => (
              <Badge key={requirementId} tone="teal">
                {requirementId}
              </Badge>
            ))}
          </div>
        ) : null}
        {sources.length ? (
          <>
            <div className="grid gap-2">
              {sources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSelectedEvidenceId(source.id)}
                  className="text-left"
                >
                  <div
                    className={cn(
                      "rounded-lg border border-zinc-200 p-3 transition hover:border-emerald-300",
                      activeSource?.id === source.id && "border-emerald-400 ring-1 ring-emerald-300",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-zinc-950">{source.label}</p>
                      <Badge tone="zinc">{source.id}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{source.excerpt}</p>
                  </div>
                </button>
              ))}
            </div>
            {activeSource ? <SourcePreview analysis={analysis} selectedSourceId={activeSource.id} /> : null}
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm leading-6 text-zinc-600">
            This section does not have chunk citations yet. Generate or rewrite it with AI, or add source-linked requirements to make the grounding clearer.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityLogView({
  activityLog,
  sections,
}: {
  activityLog: Workspace["activityLog"];
  sections: Workspace["proposalState"]["sections"];
}) {
  const overdueSections = sections.filter(
    (section) => section.followUpRequired && isOverdue(section.followUpDueDate),
  );

  if (!activityLog.length) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-zinc-600">
          No workspace activity has been recorded yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      {overdueSections.length ? (
        <Card className="border-rose-200 bg-rose-50">
          <CardHeader>
            <CardTitle>Overdue follow-ups</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {overdueSections.map((section) => (
              <div key={section.id} className="rounded-lg border border-rose-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-zinc-950">{section.title}</p>
                  <Badge tone="red">Overdue</Badge>
                  {section.assigneeName ? <Badge tone="teal">{section.assigneeName}</Badge> : null}
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  Due {section.followUpDueDate}
                  {section.followUpNote ? ` - ${section.followUpNote}` : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Workspace timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLog.map((entry) => (
              <div key={entry.id} className="flex gap-4 rounded-lg border border-zinc-200 p-4">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-zinc-950">{entry.title}</p>
                    <Badge tone="zinc">
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(entry.createdAt))}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{entry.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SourcePreview({
  analysis,
  selectedSourceId,
}: {
  analysis: ProposalAnalysis;
  selectedSourceId: string | null;
}) {
  const source =
    analysis.sources.find((item) => item.id === selectedSourceId) ?? analysis.sources[0];

  if (!source) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-zinc-600">
          No cited source preview available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Chunk preview</CardTitle>
          <Badge tone="teal">{source.id}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={source.sourceType === "knowledge_asset" ? "yellow" : "zinc"}>
            {source.sourceType === "knowledge_asset" ? "Knowledge asset" : "Document"}
          </Badge>
          {source.assetTitle ? <Badge tone="zinc">{source.assetTitle}</Badge> : null}
          {source.documentLabel ? <Badge tone="zinc">{source.documentLabel}</Badge> : null}
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-700">
          {source.content || source.excerpt}
        </p>
      </CardContent>
    </Card>
  );
}

function ExportView({
  workspaceId,
  analysis,
  reviewState,
  proposalState,
}: {
  workspaceId: string;
  analysis: ProposalAnalysis;
  reviewState: WorkspaceReviewState;
  proposalState: WorkspaceProposalState;
}) {
  const requirementMatrix = useMemo(
    () => formatRequirementMatrixExport(analysis, reviewState),
    [analysis, reviewState],
  );
  const reviewedAnswers = useMemo(
    () => formatReviewedAnswersExport(analysis, reviewState),
    [analysis, reviewState],
  );
  const [pendingExport, setPendingExport] = useState<{
    kind: "docx" | "print";
    href: string;
    label: string;
  } | null>(null);
  const exportReadiness = useMemo(() => {
    const approvedCount = proposalState.sections.filter((section) => section.status === "approved").length;
    const unsignedApproved = proposalState.sections.filter(
      (section) => section.status === "approved" && !section.reviewerName.trim(),
    ).length;
    const uncited = proposalState.sections.filter((section) => section.sourceRefs.length === 0).length;
    return {
      approvedCount,
      totalCount: proposalState.sections.length,
      unsignedApproved,
      uncited,
      ready:
        proposalState.sections.length > 0 &&
        approvedCount === proposalState.sections.length &&
        unsignedApproved === 0 &&
        uncited === 0,
    };
  }, [proposalState.sections]);

  function continueToExport(target: { kind: "docx" | "print"; href: string }) {
    if (target.kind === "print") {
      window.open(target.href, "_blank", "noopener,noreferrer");
      return;
    }

    const link = document.createElement("a");
    link.href = target.href;
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function handleExportAttempt(target: {
    kind: "docx" | "print";
    href: string;
    label: string;
  }) {
    if (exportReadiness.ready) {
      continueToExport(target);
      return;
    }

    setPendingExport(target);
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Final readiness</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge tone={exportReadiness.ready ? "green" : "yellow"}>
              {exportReadiness.ready ? "Export ready" : "Review before export"}
            </Badge>
            <Badge tone="green">
              {exportReadiness.approvedCount}/{exportReadiness.totalCount} sections approved
            </Badge>
            <Badge tone={exportReadiness.unsignedApproved ? "yellow" : "green"}>
              {exportReadiness.unsignedApproved} unsigned approved sections
            </Badge>
            <Badge tone={exportReadiness.uncited ? "yellow" : "green"}>
              {exportReadiness.uncited} sections without citations
            </Badge>
          </div>
          <p className="text-sm text-zinc-600">
            Use this as the final gate before copying or exporting the proposal pack.
          </p>
        </CardContent>
      </Card>

      {pendingExport ? (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle>Review before export</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm leading-6 text-zinc-700">
              `{pendingExport.label}` is being exported before the proposal is fully ready.
                  You can still continue, but ProposalDock is flagging the gaps below first.
            </p>
            <div className="grid gap-2 text-sm text-zinc-700">
              {proposalState.sections.filter((section) => section.status !== "approved").length ? (
                <p>
                  Not approved:{" "}
                  {proposalState.sections
                    .filter((section) => section.status !== "approved")
                    .map((section) => section.title)
                    .join(", ")}
                </p>
              ) : null}
              {proposalState.sections.filter(
                (section) => section.status === "approved" && !section.reviewerName.trim(),
              ).length ? (
                <p>
                  Missing signoff:{" "}
                  {proposalState.sections
                    .filter(
                      (section) =>
                        section.status === "approved" && !section.reviewerName.trim(),
                    )
                    .map((section) => section.title)
                    .join(", ")}
                </p>
              ) : null}
              {proposalState.sections.filter((section) => section.sourceRefs.length === 0).length ? (
                <p>
                  Missing evidence:{" "}
                  {proposalState.sections
                    .filter((section) => section.sourceRefs.length === 0)
                    .map((section) => section.title)
                    .join(", ")}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  continueToExport(pendingExport);
                  setPendingExport(null);
                }}
              >
                Continue anyway
              </Button>
              <Button variant="secondary" onClick={() => setPendingExport(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Executive summary export</CardTitle>
            <p className="text-sm text-zinc-600">Copy-ready summary for email, deck, or proposal shell.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                handleExportAttempt({
                  kind: "docx",
                  href: `/api/workspaces/${workspaceId}/export?type=summary`,
                  label: "Executive summary DOCX",
                })
              }
            >
              <Download className="size-4" />
              DOCX
            </Button>
            <CopyButton text={reviewState.executiveSummary} />
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            readOnly
            rows={10}
            value={reviewState.executiveSummary}
            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-sm leading-7 text-zinc-700"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Proposal assembly draft</CardTitle>
            <p className="text-sm text-zinc-600">The current ordered section draft assembled inside the workspace.</p>
          </div>
          <CopyButton
            text={proposalState.sections
              .map((section) => `${section.title}\n\n${section.content}`)
              .join("\n\n")}
          />
        </CardHeader>
        <CardContent>
          <textarea
            readOnly
            rows={18}
            value={proposalState.sections
              .map((section) => `${section.title}\n\n${section.content}`)
              .join("\n\n")}
            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-sm leading-7 text-zinc-700"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Requirement matrix export</CardTitle>
            <p className="text-sm text-zinc-600">Review status, notes, and draft answer in one copy block.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                handleExportAttempt({
                  kind: "docx",
                  href: `/api/workspaces/${workspaceId}/export?type=matrix`,
                  label: "Requirement matrix DOCX",
                })
              }
            >
              <Download className="size-4" />
              DOCX
            </Button>
            <CopyButton text={requirementMatrix} />
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            readOnly
            rows={18}
            value={requirementMatrix}
            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 p-3 font-mono text-xs leading-6 text-zinc-700"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Reviewed draft answers</CardTitle>
            <p className="text-sm text-zinc-600">Accepted and drafted requirement answers, ready to paste into a response doc.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                handleExportAttempt({
                  kind: "docx",
                  href: `/api/workspaces/${workspaceId}/export?type=answers`,
                  label: "Reviewed draft answers DOCX",
                })
              }
            >
              <Download className="size-4" />
              DOCX
            </Button>
            <CopyButton text={reviewedAnswers || "No reviewed draft answers yet."} />
          </div>
        </CardHeader>
        <CardContent>
          {reviewedAnswers ? (
            <textarea
              readOnly
              rows={16}
              value={reviewedAnswers}
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-sm leading-6 text-zinc-700"
            />
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
              <div className="flex items-center gap-2 font-semibold text-zinc-800">
                <ClipboardList className="size-4" />
                No reviewed draft answers yet
              </div>
              <p className="mt-2">
                Add draft answers in the Requirements tab and they will appear here as a copy-ready export block.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Proposal response pack</CardTitle>
            <p className="text-sm text-zinc-600">One combined pack with summary, reviewed answers, risks, and cited sources.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                handleExportAttempt({
                  kind: "print",
                  href: `/app/workspaces/${workspaceId}/print`,
                  label: "Print view",
                })
              }
            >
              Print View
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                handleExportAttempt({
                  kind: "docx",
                  href: `/api/workspaces/${workspaceId}/export?type=pack`,
                  label: "Proposal response pack DOCX",
                })
              }
            >
              <Download className="size-4" />
              DOCX
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm leading-7 text-zinc-600">
            This pack combines the edited executive summary, response strategy, reviewed answers,
            risk highlights, and supporting source material into a single export flow.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
