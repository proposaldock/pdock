"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicLead, TeamMember, TeamRole } from "@/lib/types";
import { formatDateTime, isOverdue } from "@/lib/utils";

const statusOptions: PublicLead["status"][] = [
  "new",
  "contacted",
  "qualified",
  "closed",
];

function leadTone(type: PublicLead["type"]) {
  return type === "contact_sales" ? "teal" : "yellow";
}

function statusTone(status: PublicLead["status"]) {
  if (status === "qualified") return "green";
  if (status === "contacted") return "teal";
  if (status === "closed") return "zinc";
  return "yellow";
}

export function PublicLeadsSettings({
  initialLeads,
  currentUserRole,
  teamMembers,
}: {
  initialLeads: PublicLead[];
  currentUserRole: TeamRole;
  teamMembers: TeamMember[];
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [busyLeadId, setBusyLeadId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | PublicLead["type"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | PublicLead["status"]>("all");
  const canView = currentUserRole === "owner" || currentUserRole === "admin";

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesType = typeFilter === "all" || lead.type === typeFilter;
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesQuery =
        !query ||
        [
          lead.name,
          lead.email,
          lead.company,
          lead.plan ?? "",
          lead.message ?? "",
          lead.internalNotes ?? "",
          lead.assignedUserName ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesType && matchesStatus && matchesQuery;
    });
  }, [leads, search, statusFilter, typeFilter]);

  async function saveLead(
    leadId: string,
    status: PublicLead["status"],
    internalNotes: string,
    assignedUserId: string | null,
    nextFollowUpAt: string | null,
  ) {
    setBusyLeadId(leadId);
    setError("");

    try {
      const response = await fetch(`/api/public-leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          internalNotes,
          assignedUserId,
          nextFollowUpAt,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update lead.");
      }

      setLeads((current) =>
        current.map((lead) => (lead.id === leadId ? payload.lead : lead)),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update lead.");
    } finally {
      setBusyLeadId(null);
    }
  }

  function exportCsv() {
    const rows = [
      [
        "type",
        "status",
        "name",
        "email",
        "company",
        "teamSize",
        "plan",
        "source",
        "assignedOwner",
        "nextFollowUpAt",
        "createdAt",
        "message",
        "internalNotes",
      ],
      ...filteredLeads.map((lead) => [
        lead.type,
        lead.status,
        lead.name,
        lead.email,
        lead.company,
        lead.teamSize ?? "",
        lead.plan ?? "",
        lead.source ?? "",
        lead.assignedUserName ?? "",
        lead.nextFollowUpAt ?? "",
        lead.createdAt,
        lead.message ?? "",
        lead.internalNotes ?? "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `proposaldock-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inbound leads</CardTitle>
        <p className="text-sm text-zinc-600">
          ProposalDock saves public contact-sales and waitlist submissions here for beta follow-up.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        {!canView ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
            Only owners and admins can review inbound leads.
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-600">
            No inbound leads yet. New contact-sales and waitlist submissions will appear here.
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone="teal">{leads.length} total leads</Badge>
              <Badge tone="yellow">
                {leads.filter((lead) => lead.type === "waitlist").length} waitlist
              </Badge>
              <Badge tone="green">
                {leads.filter((lead) => lead.type === "contact_sales").length} contact sales
              </Badge>
            </div>

            <div className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 lg:grid-cols-[1fr_180px_180px_auto]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, company, email, owner, notes, or message"
                className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-500"
              />
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as "all" | PublicLead["type"])
                }
                className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="all">All lead types</option>
                <option value="contact_sales">Contact sales</option>
                <option value="waitlist">Waitlist</option>
              </select>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | PublicLead["status"])
                }
                className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="all">All statuses</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <Button variant="secondary" onClick={exportCsv} disabled={!filteredLeads.length}>
                Export CSV
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge tone="zinc">{filteredLeads.length} filtered leads</Badge>
            </div>

            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">
                {error}
              </div>
            ) : null}

            {filteredLeads.length ? (
              filteredLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isSaving={busyLeadId === lead.id}
                  teamMembers={teamMembers}
                  onSave={saveLead}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-600">
                No leads match the current filters yet.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LeadCard({
  lead,
  isSaving,
  teamMembers,
  onSave,
}: {
  lead: PublicLead;
  isSaving: boolean;
  teamMembers: TeamMember[];
  onSave: (
    leadId: string,
    status: PublicLead["status"],
    internalNotes: string,
    assignedUserId: string | null,
    nextFollowUpAt: string | null,
  ) => Promise<void>;
}) {
  const [status, setStatus] = useState<PublicLead["status"]>(lead.status);
  const [notes, setNotes] = useState(lead.internalNotes ?? "");
  const [assignedUserId, setAssignedUserId] = useState(lead.assignedUserId ?? "");
  const [nextFollowUpAt, setNextFollowUpAt] = useState(
    lead.nextFollowUpAt ? lead.nextFollowUpAt.slice(0, 10) : "",
  );

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold text-zinc-950">{lead.name}</p>
        <Badge tone={leadTone(lead.type)}>
          {lead.type === "contact_sales" ? "contact sales" : "waitlist"}
        </Badge>
        {lead.plan ? <Badge tone="zinc">{lead.plan}</Badge> : null}
        {lead.teamSize ? <Badge tone="zinc">{lead.teamSize} seats</Badge> : null}
        <Badge tone={statusTone(status)}>{status}</Badge>
        {lead.assignedUserName ? <Badge tone="teal">{lead.assignedUserName}</Badge> : null}
        {lead.nextFollowUpAt ? (
          <Badge
            tone={
              status !== "closed" && isOverdue(lead.nextFollowUpAt.slice(0, 10))
                ? "red"
                : "yellow"
            }
          >
            {status !== "closed" && isOverdue(lead.nextFollowUpAt.slice(0, 10))
              ? `Overdue ${lead.nextFollowUpAt.slice(0, 10)}`
              : `Next follow-up ${lead.nextFollowUpAt.slice(0, 10)}`}
          </Badge>
        ) : null}
      </div>
      <div className="mt-3 grid gap-2 text-sm text-zinc-600 md:grid-cols-2">
        <p>
          <span className="font-semibold text-zinc-900">Company:</span> {lead.company}
        </p>
        <p>
          <span className="font-semibold text-zinc-900">Email:</span> {lead.email}
        </p>
        <p>
          <span className="font-semibold text-zinc-900">Created:</span>{" "}
          {formatDateTime(lead.createdAt)}
        </p>
        <p>
          <span className="font-semibold text-zinc-900">Source:</span>{" "}
          {lead.source ?? "marketing_site"}
        </p>
      </div>
      {lead.message ? (
        <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-700">
          {lead.message}
        </div>
      ) : null}
      <div className="mt-4 grid gap-4 md:grid-cols-[220px_220px_220px]">
        <label className="grid gap-2 text-sm font-semibold text-zinc-900">
          Lead status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as PublicLead["status"])}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium outline-none focus:border-emerald-500"
            disabled={isSaving}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-900">
          Owner
          <select
            value={assignedUserId}
            onChange={(event) => setAssignedUserId(event.target.value)}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium outline-none focus:border-emerald-500"
            disabled={isSaving}
          >
            <option value="">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-900">
          Next follow-up
          <input
            type="date"
            value={nextFollowUpAt}
            onChange={(event) => setNextFollowUpAt(event.target.value)}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium outline-none focus:border-emerald-500"
            disabled={isSaving}
          />
        </label>
      </div>
      <div className="mt-4 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-zinc-900">
          Internal notes
          <textarea
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-3 text-sm font-normal outline-none focus:border-emerald-500"
            placeholder="Add follow-up notes, owner context, next steps, or outreach history."
            disabled={isSaving}
          />
        </label>
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          disabled={isSaving}
          onClick={() =>
            void onSave(
              lead.id,
              status,
              notes,
              assignedUserId || null,
              nextFollowUpAt || null,
            )
          }
        >
          {isSaving ? "Saving..." : "Save lead update"}
        </Button>
      </div>
      {lead.activityLog.length ? (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm font-semibold text-zinc-900">Activity</p>
          <div className="mt-3 grid gap-3">
            {lead.activityLog.slice(0, 6).map((entry) => (
              <div key={entry.id} className="rounded-lg border border-zinc-200 bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-900">{entry.title}</p>
                  <Badge tone="zinc">{entry.actorName}</Badge>
                  <Badge tone="zinc">{formatDateTime(entry.createdAt)}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{entry.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
