"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Search,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import { WorkspaceLibrary } from "@/components/workspace-library";
import {
  buildDashboardActivity,
  buildDashboardLeadActivity,
  computeWorkspaceHealth,
} from "@/lib/dashboard";
import type { PublicLead, Workspace } from "@/lib/types";
import { formatDateTime, isOverdue } from "@/lib/utils";

export function DashboardOverview({
  workspaces,
  leads,
}: {
  workspaces: Workspace[];
  leads: PublicLead[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [healthFilter, setHealthFilter] = useState<"all" | "ready" | "in_progress" | "at_risk">(
    "all",
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filteredWorkspaces = useMemo(
    () =>
      workspaces.filter((workspace) => {
        const matchesQuery =
          !normalizedQuery ||
          workspace.workspaceName.toLowerCase().includes(normalizedQuery) ||
          workspace.clientName.toLowerCase().includes(normalizedQuery) ||
          workspace.analysis.overview.summary.toLowerCase().includes(normalizedQuery);
        const health = computeWorkspaceHealth(workspace);
        const matchesHealth = healthFilter === "all" || health === healthFilter;

        return matchesQuery && matchesHealth;
      }),
    [healthFilter, normalizedQuery, workspaces],
  );
  const recentActivity = useMemo(
    () =>
      buildDashboardActivity(workspaces)
        .filter((entry) => {
          const matchesQuery =
            !normalizedQuery ||
            entry.title.toLowerCase().includes(normalizedQuery) ||
            entry.detail.toLowerCase().includes(normalizedQuery) ||
            entry.workspaceName.toLowerCase().includes(normalizedQuery) ||
            entry.clientName.toLowerCase().includes(normalizedQuery);
          const matchesHealth = healthFilter === "all" || entry.health === healthFilter;

          return matchesQuery && matchesHealth;
        })
        .slice(0, 8),
    [healthFilter, normalizedQuery, workspaces],
  );
  const healthSummary = useMemo(
    () =>
      filteredWorkspaces.reduce(
        (summary, workspace) => {
          const health = computeWorkspaceHealth(workspace);
          if (health === "ready") summary.ready += 1;
          if (health === "in_progress") summary.inProgress += 1;
          if (health === "at_risk") summary.atRisk += 1;
          return summary;
        },
        { ready: 0, inProgress: 0, atRisk: 0 },
      ),
    [filteredWorkspaces],
  );
  const nextNeedsAttention = useMemo(
    () => filteredWorkspaces.find((workspace) => computeWorkspaceHealth(workspace) === "at_risk"),
    [filteredWorkspaces],
  );
  const nextInProgress = useMemo(
    () => filteredWorkspaces.find((workspace) => computeWorkspaceHealth(workspace) === "in_progress"),
    [filteredWorkspaces],
  );
  const opsSummary = useMemo(
    () =>
      filteredWorkspaces
        .map((workspace) => {
          const health = computeWorkspaceHealth(workspace);
          const approvedCount = workspace.proposalState.sections.filter(
            (section) => section.status === "approved",
          ).length;
          const totalCount = workspace.proposalState.sections.length;
          const uncitedCount = workspace.proposalState.sections.filter(
            (section) => section.sourceRefs.length === 0,
          ).length;
          const unsignedApproved = workspace.proposalState.sections.filter(
            (section) => section.status === "approved" && !section.reviewerName.trim(),
          ).length;
          const overdueFollowUps = workspace.proposalState.sections.filter(
            (section) => section.followUpRequired && isOverdue(section.followUpDueDate),
          ).length;

          return [
            `${workspace.workspaceName} (${workspace.clientName})`,
            `Health: ${health}`,
            `Approved sections: ${approvedCount}/${totalCount}`,
            `Sections without evidence: ${uncitedCount}`,
            `Unsigned approved sections: ${unsignedApproved}`,
            `Overdue follow-ups: ${overdueFollowUps}`,
            `Updated: ${new Intl.DateTimeFormat("en", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(workspace.updatedAt))}`,
          ].join(" | ");
        })
        .join("\n"),
    [filteredWorkspaces],
  );
  const workloadByOwner = useMemo(() => {
    const groups = new Map<
      string,
      {
        owner: string;
        totalSections: number;
        openFollowUps: number;
        approvedSections: number;
        items: Array<{
          workspaceId: string;
          workspaceName: string;
          clientName: string;
          sectionId: string;
          sectionTitle: string;
          status: Workspace["proposalState"]["sections"][number]["status"];
          followUpRequired: boolean;
          followUpNote: string;
          followUpDueDate: string | null;
        }>;
      }
    >();

    for (const workspace of filteredWorkspaces) {
      for (const section of workspace.proposalState.sections) {
        const owner = section.assigneeName.trim() || "Unassigned";
        const existing = groups.get(owner) ?? {
          owner,
          totalSections: 0,
          openFollowUps: 0,
          approvedSections: 0,
          items: [],
        };

        existing.totalSections += 1;
        if (section.followUpRequired) existing.openFollowUps += 1;
        if (section.status === "approved") existing.approvedSections += 1;
        existing.items.push({
          workspaceId: workspace.id,
          workspaceName: workspace.workspaceName,
          clientName: workspace.clientName,
          sectionId: section.id,
          sectionTitle: section.title,
          status: section.status,
          followUpRequired: section.followUpRequired,
          followUpNote: section.followUpNote,
          followUpDueDate: section.followUpDueDate,
        });
        groups.set(owner, existing);
      }
    }

    return [...groups.values()].sort((a, b) => {
      if (b.openFollowUps !== a.openFollowUps) return b.openFollowUps - a.openFollowUps;
      return a.owner.localeCompare(b.owner);
    });
  }, [filteredWorkspaces]);
  const filteredLeads = useMemo(() => {
    if (!leads.length) return [];

    return leads.filter((lead) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          lead.name,
          lead.email,
          lead.company,
          lead.message ?? "",
          lead.internalNotes ?? "",
          lead.assignedUserName ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesQuery;
    });
  }, [leads, normalizedQuery]);
  const overdueLeads = useMemo(
    () =>
      filteredLeads.filter(
        (lead) => lead.status !== "closed" && isOverdue(lead.nextFollowUpAt?.slice(0, 10)),
      ),
    [filteredLeads],
  );
  const dueSoonLeads = useMemo(
    () =>
      filteredLeads.filter(
        (lead) =>
          lead.status !== "closed" &&
          lead.nextFollowUpAt &&
          !isOverdue(lead.nextFollowUpAt.slice(0, 10)),
      ),
    [filteredLeads],
  );
  const nextLeadToOpen = overdueLeads[0] ?? dueSoonLeads[0] ?? null;
  const leadOpsSummary = useMemo(
    () =>
      filteredLeads
        .map((lead) =>
          [
            `${lead.company} (${lead.name})`,
            `Type: ${lead.type}`,
            `Status: ${lead.status}`,
            `Owner: ${lead.assignedUserName ?? "Unassigned"}`,
            `Next follow-up: ${lead.nextFollowUpAt ? lead.nextFollowUpAt.slice(0, 10) : "None"}`,
            `Email: ${lead.email}`,
          ].join(" | "),
        )
        .join("\n"),
    [filteredLeads],
  );
  const recentLeadActivity = useMemo(
    () =>
      buildDashboardLeadActivity(filteredLeads)
        .filter((entry) => {
          const matchesQuery =
            !normalizedQuery ||
            entry.title.toLowerCase().includes(normalizedQuery) ||
            entry.detail.toLowerCase().includes(normalizedQuery) ||
            entry.company.toLowerCase().includes(normalizedQuery) ||
            entry.leadName.toLowerCase().includes(normalizedQuery) ||
            entry.email.toLowerCase().includes(normalizedQuery) ||
            (entry.assignedUserName ?? "").toLowerCase().includes(normalizedQuery);

          return matchesQuery;
        })
        .slice(0, 8),
    [filteredLeads, normalizedQuery],
  );
  const leadMetrics = useMemo(
    () => ({
      total: filteredLeads.length,
      contacted: filteredLeads.filter((lead) => lead.status === "contacted").length,
      qualified: filteredLeads.filter((lead) => lead.status === "qualified").length,
      overdue: filteredLeads.filter(
        (lead) => lead.status !== "closed" && isOverdue(lead.nextFollowUpAt?.slice(0, 10)),
      ).length,
    }),
    [filteredLeads],
  );

  return (
    <>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Workspace filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by workspace, client, summary, or activity..."
              className="h-11 w-full rounded-lg border border-zinc-300 pl-10 pr-3 text-sm outline-none focus:border-emerald-500"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All" },
              { value: "ready", label: "Ready" },
              { value: "in_progress", label: "In progress" },
              { value: "at_risk", label: "Needs attention" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setHealthFilter(
                    option.value as "all" | "ready" | "in_progress" | "at_risk",
                  )
                }
                className="rounded-lg"
              >
                <Badge tone={healthFilter === option.value ? "teal" : "zinc"}>
                  {option.label}
                </Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Ops actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => setHealthFilter("ready")}
          >
            Show ready workspaces
          </Button>
          <Button
            variant="secondary"
            onClick={() => setHealthFilter("at_risk")}
          >
            Show items needing attention
          </Button>
          <Button
            variant="secondary"
            onClick={() => setHealthFilter("in_progress")}
          >
            Show in-progress workspaces
          </Button>
          <Button
            onClick={() => {
              if (nextNeedsAttention) {
                router.push(`/app/workspaces/${nextNeedsAttention.id}`);
              }
            }}
            disabled={!nextNeedsAttention}
          >
            Open next needs-attention workspace
            <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (nextInProgress) {
                router.push(`/app/workspaces/${nextInProgress.id}`);
              }
            }}
            disabled={!nextInProgress}
          >
            Open next in-progress workspace
            <ArrowRight className="size-4" />
          </Button>
          <CopyButton
            text={
              opsSummary ||
              "No workspaces matched the current dashboard filters."
            }
          />
          {leads.length ? (
            <>
              <Button
                variant="secondary"
                onClick={() => router.push("/app/settings")}
              >
                Open lead follow-ups
                <ArrowRight className="size-4" />
              </Button>
              <CopyButton
                text={
                  leadOpsSummary ||
                  "No inbound leads matched the current dashboard search."
                }
              />
              <Button
                onClick={() => router.push("/app/settings")}
                disabled={!nextLeadToOpen}
              >
                Open next lead needing follow-up
                <ArrowRight className="size-4" />
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>

      {leads.length ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div>
                <p className="text-sm text-zinc-500">Total leads</p>
                <p className="mt-2 text-2xl font-black">{leadMetrics.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div>
                <p className="text-sm text-zinc-500">Contacted</p>
                <p className="mt-2 text-2xl font-black">{leadMetrics.contacted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div>
                <p className="text-sm text-zinc-500">Qualified</p>
                <p className="mt-2 text-2xl font-black">{leadMetrics.qualified}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div>
                <p className="text-sm text-zinc-500">Overdue follow-ups</p>
                <p className="mt-2 text-2xl font-black">{leadMetrics.overdue}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {leads.length ? (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Lead follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge tone="teal">{filteredLeads.length} leads in view</Badge>
              <Badge tone={overdueLeads.length ? "red" : "green"}>
                {overdueLeads.length} overdue
              </Badge>
              <Badge tone={dueSoonLeads.length ? "yellow" : "zinc"}>
                {dueSoonLeads.length} upcoming
              </Badge>
            </div>

            {filteredLeads.length ? (
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                {filteredLeads.slice(0, 6).map((lead) => (
                  <Link key={lead.id} href="/app/settings">
                    <div className="rounded-lg border border-zinc-200 p-4 transition hover:border-emerald-300">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-zinc-950">{lead.company}</p>
                        <Badge tone={lead.type === "contact_sales" ? "teal" : "yellow"}>
                          {lead.type === "contact_sales" ? "contact sales" : "mailing list"}
                        </Badge>
                        <Badge
                          tone={
                            lead.status === "qualified"
                              ? "green"
                              : lead.status === "contacted"
                                ? "teal"
                                : lead.status === "closed"
                                  ? "zinc"
                                  : "yellow"
                          }
                        >
                          {lead.status}
                        </Badge>
                        {lead.status !== "closed" &&
                        isOverdue(lead.nextFollowUpAt?.slice(0, 10)) ? (
                          <Badge tone="red">Overdue</Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-zinc-600">
                        {lead.name} | {lead.email}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {lead.assignedUserName ? (
                          <Badge tone="zinc">{lead.assignedUserName}</Badge>
                        ) : (
                          <Badge tone="zinc">Unassigned</Badge>
                        )}
                        {lead.nextFollowUpAt ? (
                          <Badge
                            tone={
                              lead.status !== "closed" &&
                              isOverdue(lead.nextFollowUpAt.slice(0, 10))
                                ? "red"
                                : "yellow"
                            }
                          >
                            Follow-up {lead.nextFollowUpAt.slice(0, 10)}
                          </Badge>
                        ) : null}
                        <Badge tone="zinc">{formatDateTime(lead.createdAt)}</Badge>
                      </div>
                      {lead.internalNotes ? (
                        <p className="mt-3 text-sm leading-6 text-zinc-600">
                          {lead.internalNotes}
                        </p>
                      ) : lead.message ? (
                        <p className="mt-3 text-sm leading-6 text-zinc-600">
                          {lead.message}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
                No inbound leads matched the current dashboard search.
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {leads.length ? (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Lead activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLeadActivity.length ? (
              <div className="grid gap-4">
                {recentLeadActivity.map((entry) => (
                  <Link key={entry.id} href="/app/settings">
                    <div className="rounded-lg border border-zinc-200 p-4 transition hover:border-emerald-300">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-zinc-950">{entry.title}</p>
                        <Badge tone={entry.leadType === "contact_sales" ? "teal" : "yellow"}>
                          {entry.leadType === "contact_sales" ? "contact sales" : "mailing list"}
                        </Badge>
                        <Badge
                          tone={
                            entry.status === "qualified"
                              ? "green"
                              : entry.status === "contacted"
                                ? "teal"
                                : entry.status === "closed"
                                  ? "zinc"
                                  : "yellow"
                          }
                        >
                          {entry.status}
                        </Badge>
                        {entry.status !== "closed" &&
                        isOverdue(entry.nextFollowUpAt?.slice(0, 10)) ? (
                          <Badge tone="red">Overdue</Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">{entry.detail}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge tone="zinc">{entry.company}</Badge>
                        <Badge tone="zinc">{entry.leadName}</Badge>
                        {entry.assignedUserName ? (
                          <Badge tone="teal">{entry.assignedUserName}</Badge>
                        ) : (
                          <Badge tone="zinc">Unassigned</Badge>
                        )}
                        {entry.nextFollowUpAt ? (
                          <Badge
                            tone={
                              entry.status !== "closed" &&
                              isOverdue(entry.nextFollowUpAt.slice(0, 10))
                                ? "red"
                                : "yellow"
                            }
                          >
                            Follow-up {entry.nextFollowUpAt.slice(0, 10)}
                          </Badge>
                        ) : null}
                        <Badge tone="zinc">{formatDateTime(entry.createdAt)}</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
                No lead activity matched the current dashboard search.
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Team workload</CardTitle>
        </CardHeader>
        <CardContent>
          {workloadByOwner.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {workloadByOwner.map((group) => (
                <div key={group.owner} className="rounded-lg border border-zinc-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-zinc-950">{group.owner}</p>
                    <Badge tone="zinc">{group.totalSections} sections</Badge>
                    <Badge tone={group.openFollowUps ? "yellow" : "green"}>
                      {group.openFollowUps} open follow-ups
                    </Badge>
                    <Badge
                      tone={
                        group.items.some(
                          (item) =>
                            item.followUpRequired && isOverdue(item.followUpDueDate),
                        )
                          ? "red"
                          : "zinc"
                      }
                    >
                      {
                        group.items.filter(
                          (item) =>
                            item.followUpRequired && isOverdue(item.followUpDueDate),
                        ).length
                      }{" "}
                      overdue
                    </Badge>
                    <Badge tone="teal">{group.approvedSections} approved</Badge>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {group.items
                      .filter((item) => item.followUpRequired)
                      .slice(0, 4)
                      .map((item) => (
                        <Link
                          key={`${group.owner}-${item.workspaceId}-${item.sectionId}`}
                          href={`/app/workspaces/${item.workspaceId}`}
                        >
                          <div className="rounded-lg bg-zinc-50 p-3 transition hover:bg-zinc-100">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-zinc-900">{item.sectionTitle}</p>
                              <Badge tone="zinc">{item.workspaceName}</Badge>
                              <Badge tone="teal">{item.clientName}</Badge>
                              {item.followUpRequired && isOverdue(item.followUpDueDate) ? (
                                <Badge tone="red">Overdue</Badge>
                              ) : item.followUpDueDate ? (
                                <Badge tone="zinc">Due {item.followUpDueDate}</Badge>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-zinc-600">
                              {item.followUpNote || "Follow-up required."}
                            </p>
                          </div>
                        </Link>
                      ))}
                    {group.openFollowUps === 0 ? (
                      <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                        No open follow-ups for this owner.
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
              No workload items matched the current dashboard filters.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <div>
                <p className="text-sm text-zinc-500">Ready for export</p>
                <p className="text-2xl font-black">{healthSummary.ready}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Clock3 className="size-5 text-amber-600" />
              <div>
                <p className="text-sm text-zinc-500">In progress</p>
                <p className="text-2xl font-black">{healthSummary.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <ShieldAlert className="size-5 text-rose-600" />
              <div>
                <p className="text-sm text-zinc-500">Needs attention</p>
                <p className="text-2xl font-black">{healthSummary.atRisk}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length ? (
            <div className="grid gap-4">
              {recentActivity.map((entry) => (
                <Link key={entry.id} href={`/app/workspaces/${entry.workspaceId}`}>
                  <div className="rounded-lg border border-zinc-200 p-4 transition hover:border-emerald-300">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-zinc-950">{entry.title}</p>
                      <Badge tone="zinc">{entry.workspaceName}</Badge>
                      <Badge tone="teal">{entry.clientName}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{entry.detail}</p>
                    <p className="mt-2 text-xs font-medium text-zinc-500">
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(entry.createdAt))}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
              No activity matched the current search and filters.
            </div>
          )}
        </CardContent>
      </Card>

      {filteredWorkspaces.length ? (
        <section className="mt-8 scroll-mt-24" id="workspaces">
          <WorkspaceLibrary initialWorkspaces={filteredWorkspaces} />
        </section>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center" id="workspaces">
          <p className="font-semibold">No workspaces matched</p>
          <p className="mt-1 text-sm text-zinc-600">
            Try another search or broaden the health filter.
          </p>
        </div>
      )}
    </>
  );
}
