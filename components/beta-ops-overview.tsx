"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleAlert, TrendingUp, UserRound } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicLead, TeamRole } from "@/lib/types";
import { formatDateTime, isOverdue } from "@/lib/utils";

type MarketingSummary = {
  totalLandingVisits: number;
  totalContactVisits: number;
  totalLeadSubmissions: number;
  totalSignups: number;
  recentLandingVisits: number;
  recentContactVisits: number;
  recentLeadSubmissions: number;
  recentSignups: number;
  convertedLeadUsers: number;
  leadToSignupConversionRate: number;
  totalProLeadSubmissions: number;
  totalTeamLeadSubmissions: number;
  totalProSignups: number;
  totalTeamSignups: number;
  trends: Array<{
    date: string;
    landingVisits: number;
    leadSubmissions: number;
    signups: number;
  }>;
};

export function BetaOpsOverview({
  summary,
  leads,
  currentUserRole,
  initialNotes,
  initialTimeline,
}: {
  summary: MarketingSummary;
  leads: PublicLead[];
  currentUserRole: TeamRole;
  initialNotes: string;
  initialTimeline: Array<{
    id: string;
    body: string;
    createdAt: string;
    authorName: string;
  }>;
}) {
  const canViewLeads = currentUserRole === "owner" || currentUserRole === "admin";
  const canEditNotes = currentUserRole === "owner" || currentUserRole === "admin";
  const openLeads = leads.filter((lead) => lead.status !== "closed");
  const overdueLeads = openLeads.filter((lead) =>
    isOverdue(lead.nextFollowUpAt?.slice(0, 10)),
  );
  const unassignedLeads = openLeads.filter((lead) => !lead.assignedUserId);
  const newLeads = leads.filter((lead) => lead.status === "new");
  const qualifiedLeads = leads.filter((lead) => lead.status === "qualified");
  const recentSubmissions = [...leads]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 4);
  const hottestPlan =
    summary.totalTeamLeadSubmissions > summary.totalProLeadSubmissions
      ? "team"
      : summary.totalProLeadSubmissions > 0
        ? "pro"
        : "free";
  const latestTrend = summary.trends[summary.trends.length - 1] ?? {
    landingVisits: 0,
    leadSubmissions: 0,
    signups: 0,
  };
  const weeklyTrend = summary.trends.slice(-7);
  const weeklyTotals = weeklyTrend.reduce(
    (accumulator, day) => ({
      landingVisits: accumulator.landingVisits + day.landingVisits,
      leadSubmissions: accumulator.leadSubmissions + day.leadSubmissions,
      signups: accumulator.signups + day.signups,
    }),
    { landingVisits: 0, leadSubmissions: 0, signups: 0 },
  );
  const digestText = buildWeeklyDigest({
    summary,
    canViewLeads,
    weeklyTotals,
    overdueLeads,
    unassignedLeads,
    newLeads,
    qualifiedLeads,
    recentSubmissions,
  });
  const digestHref = `data:text/plain;charset=utf-8,${encodeURIComponent(digestText)}`;
  const [notes, setNotes] = useState(initialNotes);
  const [savedNotes, setSavedNotes] = useState(initialNotes);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Beta Ops</p>
            <CardTitle className="mt-1">Go-to-market pulse</CardTitle>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              A quick operating view across traffic, inbound demand, and who needs follow-up next.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/app">
              <Button variant="secondary" size="sm">
                Open dashboard
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="#marketing-analytics">
              <Button variant="secondary" size="sm">
                Marketing analytics
              </Button>
            </Link>
            <Link href="#inbound-leads">
              <Button variant="secondary" size="sm">
                Inbound leads
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OpsMetric
            label="Lead submissions"
            value={summary.totalLeadSubmissions}
            detail={`${summary.recentLeadSubmissions} in the last 30 days`}
            icon={<TrendingUp className="size-4 text-emerald-700" />}
          />
          <OpsMetric
            label="Overdue follow-ups"
            value={canViewLeads ? overdueLeads.length : "Restricted"}
            detail={
              canViewLeads
                ? `${unassignedLeads.length} open leads are still unassigned`
                : "Owners and admins can review lead ops"
            }
            icon={<CircleAlert className="size-4 text-rose-700" />}
          />
          <OpsMetric
            label="Qualified leads"
            value={canViewLeads ? qualifiedLeads.length : "Restricted"}
            detail={
              canViewLeads
                ? `${newLeads.length} new leads still need first response`
                : "Qualified pipeline shown to owners and admins"
            }
            icon={<UserRound className="size-4 text-teal-700" />}
          />
          <OpsMetric
            label="Lead to signup"
            value={`${summary.leadToSignupConversionRate}%`}
            detail={`${summary.convertedLeadUsers} lead emails converted`}
            icon={<TrendingUp className="size-4 text-yellow-700" />}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-zinc-900">Commercial readout</p>
              <Badge tone="teal">{summary.totalLandingVisits} landing visits</Badge>
              <Badge tone="yellow">{summary.totalContactVisits} contact visits</Badge>
              <Badge tone="green">{summary.totalSignups} signups</Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-zinc-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Hottest plan intent
                </p>
                <p className="mt-2 text-lg font-bold text-zinc-950">
                  {hottestPlan === "team"
                    ? "Team interest is strongest"
                    : hottestPlan === "pro"
                      ? "Pro interest is strongest"
                      : "Free and exploratory traffic"}
                </p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Today&apos;s activity
                </p>
                <p className="mt-2 text-lg font-bold text-zinc-950">
                  {latestTrend.landingVisits} visits / {latestTrend.leadSubmissions} leads /{" "}
                  {latestTrend.signups} signups
                </p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Signup efficiency
                </p>
                <p className="mt-2 text-lg font-bold text-zinc-950">
                  {summary.leadToSignupConversionRate}% from lead to account
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-zinc-900">Follow-up health</p>
              {canViewLeads ? (
                <Badge tone={overdueLeads.length ? "red" : "green"}>
                  {overdueLeads.length ? "Needs attention" : "Healthy"}
                </Badge>
              ) : (
                <Badge tone="zinc">Restricted</Badge>
              )}
            </div>
            {canViewLeads ? (
              <div className="mt-4 grid gap-3">
                <HealthRow
                  label="Open leads"
                  value={openLeads.length}
                  tone="zinc"
                />
                <HealthRow
                  label="Overdue follow-ups"
                  value={overdueLeads.length}
                  tone={overdueLeads.length ? "red" : "green"}
                />
                <HealthRow
                  label="Unassigned leads"
                  value={unassignedLeads.length}
                  tone={unassignedLeads.length ? "yellow" : "green"}
                />
                <HealthRow
                  label="Qualified and ready"
                  value={qualifiedLeads.length}
                  tone="teal"
                />
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-zinc-600">
                Owners and admins can review lead health, assignments, and follow-up dates here.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Weekly beta ops digest</p>
              <p className="mt-1 text-sm text-zinc-600">
                Copy or download a simple internal summary of traffic, leads, conversion, and follow-up health.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyButton text={digestText} />
              <a href={digestHref} download="proposaldock-beta-ops-digest.txt">
                <Button type="button" variant="secondary" size="sm">
                  Download TXT
                </Button>
              </a>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
            <pre className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">
              {digestText}
            </pre>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Operator commentary</p>
              <p className="mt-1 text-sm text-zinc-600">
                Save a lightweight weekly note alongside the digest for context, risks, or next moves.
              </p>
            </div>
            {savedNotes.trim() ? <Badge tone="teal">Saved for this team</Badge> : <Badge tone="zinc">No note yet</Badge>}
          </div>
          <div className="mt-4 grid gap-3">
            <textarea
              rows={5}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-3 text-sm outline-none focus:border-emerald-500"
              placeholder="Add a quick weekly note on momentum, blockers, strongest leads, or what the team should do next."
              disabled={!canEditNotes || isSaving}
            />
            {saveError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">
                {saveError}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-zinc-500">
                {canEditNotes
                  ? "Shared across the active organization."
                  : "Only owners and admins can update this shared note."}
              </p>
              <div className="flex flex-wrap gap-2">
                <CopyButton text={savedNotes.trim() || "No beta ops commentary saved yet."} />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void saveNotes(notes)}
                  disabled={!canEditNotes || isSaving || notes === savedNotes}
                >
                  {isSaving ? "Saving..." : "Save note"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Beta ops timeline</p>
              <p className="mt-1 text-sm text-zinc-600">
                A lightweight history of weekly operator commentary for the active team.
              </p>
            </div>
            <Badge tone="zinc">{timeline.length} entries</Badge>
          </div>
          <div className="mt-4 grid gap-3">
            {timeline.length ? (
              timeline.slice(0, 8).map((entry) => (
                <div key={entry.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="teal">{entry.authorName}</Badge>
                    <Badge tone="zinc">{formatDateTime(entry.createdAt)}</Badge>
                    <CopyButton text={entry.body} />
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                    {entry.body}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600">
                No beta ops commentary has been saved yet.
              </div>
            )}
          </div>
        </div>

        {canViewLeads ? (
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-zinc-900">Latest inbound leads</p>
              <Badge tone="zinc">{recentSubmissions.length} shown</Badge>
            </div>
            {recentSubmissions.length ? (
              <div className="grid gap-3 xl:grid-cols-2">
                {recentSubmissions.map((lead) => (
                  <Link key={lead.id} href="#inbound-leads">
                    <div className="rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-emerald-300">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-zinc-950">{lead.company}</p>
                        <Badge tone={lead.type === "contact_sales" ? "teal" : "yellow"}>
                          {lead.type === "contact_sales" ? "contact sales" : "waitlist"}
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
                        {lead.nextFollowUpAt && lead.status !== "closed" ? (
                          <Badge
                            tone={
                              isOverdue(lead.nextFollowUpAt.slice(0, 10)) ? "red" : "yellow"
                            }
                          >
                            {isOverdue(lead.nextFollowUpAt.slice(0, 10))
                              ? `Overdue ${lead.nextFollowUpAt.slice(0, 10)}`
                              : `Follow-up ${lead.nextFollowUpAt.slice(0, 10)}`}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-zinc-600">
                        {lead.name} | {lead.email}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge tone="zinc">{formatDateTime(lead.createdAt)}</Badge>
                        <Badge tone="zinc">{lead.assignedUserName ?? "Unassigned"}</Badge>
                        {lead.plan ? <Badge tone="teal">{lead.plan}</Badge> : null}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600">
                No leads yet. New contact and waitlist submissions will show up here.
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  async function saveNotes(nextNotes: string) {
    setIsSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/organizations/active/beta-ops", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: nextNotes,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save beta ops notes.");
      }

      setSavedNotes(payload.betaOpsNotes ?? "");
      setNotes(payload.betaOpsNotes ?? "");
      setTimeline(payload.betaOpsTimeline ?? []);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Unable to save beta ops notes.",
      );
    } finally {
      setIsSaving(false);
    }
  }
}

function buildWeeklyDigest({
  summary,
  canViewLeads,
  weeklyTotals,
  overdueLeads,
  unassignedLeads,
  newLeads,
  qualifiedLeads,
  recentSubmissions,
}: {
  summary: MarketingSummary;
  canViewLeads: boolean;
  weeklyTotals: {
    landingVisits: number;
    leadSubmissions: number;
    signups: number;
  };
  overdueLeads: PublicLead[];
  unassignedLeads: PublicLead[];
  newLeads: PublicLead[];
  qualifiedLeads: PublicLead[];
  recentSubmissions: PublicLead[];
}) {
  const topRecentLeads = canViewLeads
    ? recentSubmissions
        .slice(0, 3)
        .map((lead) => {
          const followUp = lead.nextFollowUpAt
            ? isOverdue(lead.nextFollowUpAt.slice(0, 10))
              ? `overdue follow-up ${lead.nextFollowUpAt.slice(0, 10)}`
              : `follow-up ${lead.nextFollowUpAt.slice(0, 10)}`
            : "no follow-up date";

          return `- ${lead.company} (${lead.type === "contact_sales" ? "contact sales" : "waitlist"}, ${lead.status}, ${lead.assignedUserName ?? "unassigned"}, ${followUp})`;
        })
        .join("\n")
    : "- Lead details restricted to owners and admins";

  const topPlan =
    summary.totalTeamLeadSubmissions > summary.totalProLeadSubmissions
      ? "Team"
      : summary.totalProLeadSubmissions > 0
        ? "Pro"
        : "No strong plan signal yet";

  return [
    "ProposalDock weekly beta ops digest",
    `Generated: ${new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date())}`,
    "",
    "Traffic and conversion",
    `- Landing visits (7d): ${weeklyTotals.landingVisits}`,
    `- Lead submissions (7d): ${weeklyTotals.leadSubmissions}`,
    `- Signups (7d): ${weeklyTotals.signups}`,
    `- Lead-to-signup conversion: ${summary.leadToSignupConversionRate}%`,
    `- Strongest pricing intent: ${topPlan}`,
    "",
    "Lead health",
    canViewLeads
      ? `- Overdue follow-ups: ${overdueLeads.length}`
      : "- Overdue follow-ups: restricted",
    canViewLeads
      ? `- Unassigned open leads: ${unassignedLeads.length}`
      : "- Unassigned open leads: restricted",
    canViewLeads
      ? `- New leads awaiting first touch: ${newLeads.length}`
      : "- New leads awaiting first touch: restricted",
    canViewLeads
      ? `- Qualified leads ready for follow-up: ${qualifiedLeads.length}`
      : "- Qualified leads ready for follow-up: restricted",
    "",
    "Recent inbound leads",
    topRecentLeads || "- No recent inbound leads",
  ].join("\n");
}

function OpsMetric({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: number | string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm text-zinc-500">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-black text-zinc-950">{value}</p>
      <p className="mt-2 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}

function HealthRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "zinc" | "green" | "yellow" | "red" | "teal";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2">
      <p className="text-sm text-zinc-600">{label}</p>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}
