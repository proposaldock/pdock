import type { PublicLead, Workspace, WorkspaceActivityEntry } from "@/lib/types";

export type WorkspaceHealth = "ready" | "in_progress" | "at_risk";

export type DashboardActivityEntry = WorkspaceActivityEntry & {
  workspaceId: string;
  workspaceName: string;
  clientName: string;
  health: WorkspaceHealth;
};

export type DashboardLeadActivityEntry = PublicLead["activityLog"][number] & {
  leadId: string;
  leadName: string;
  company: string;
  email: string;
  status: PublicLead["status"];
  assignedUserName: string | null;
  nextFollowUpAt: string | null;
  leadType: PublicLead["type"];
};

export function computeWorkspaceHealth(workspace: Workspace): WorkspaceHealth {
  const totalSections = workspace.proposalState.sections.length;
  const approvedSections = workspace.proposalState.sections.filter(
    (section) => section.status === "approved",
  ).length;
  const uncitedSections = workspace.proposalState.sections.filter(
    (section) => section.sourceRefs.length === 0,
  ).length;
  const unsignedApproved = workspace.proposalState.sections.filter(
    (section) => section.status === "approved" && !section.reviewerName.trim(),
  ).length;

  if (
    totalSections > 0 &&
    approvedSections === totalSections &&
    uncitedSections === 0 &&
    unsignedApproved === 0
  ) {
    return "ready";
  }

  if (approvedSections > 0 || workspace.activityLog.length > 3) {
    return "in_progress";
  }

  return "at_risk";
}

export function buildDashboardActivity(workspaces: Workspace[]): DashboardActivityEntry[] {
  return workspaces
    .flatMap((workspace) =>
      workspace.activityLog.map((entry) => ({
        ...entry,
        workspaceId: workspace.id,
        workspaceName: workspace.workspaceName,
        clientName: workspace.clientName,
        health: computeWorkspaceHealth(workspace),
      })),
    )
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function buildDashboardLeadActivity(
  leads: PublicLead[],
): DashboardLeadActivityEntry[] {
  return leads
    .flatMap((lead) =>
      lead.activityLog.map((entry) => ({
        ...entry,
        leadId: lead.id,
        leadName: lead.name,
        company: lead.company,
        email: lead.email,
        status: lead.status,
        assignedUserName: lead.assignedUserName,
        nextFollowUpAt: lead.nextFollowUpAt,
        leadType: lead.type,
      })),
    )
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
