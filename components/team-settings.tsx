"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BillingPlan, OrganizationTeam, TeamRole } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const roles: TeamRole[] = ["owner", "admin", "member"];

type TeamSettingsProps = {
  initialTeam: OrganizationTeam;
  canUseTeamFeatures: boolean;
  effectivePlan: BillingPlan;
};

export function TeamSettings({
  initialTeam,
  canUseTeamFeatures,
  effectivePlan,
}: TeamSettingsProps) {
  const [team, setTeam] = useState(initialTeam);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("member");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const canManage =
    canUseTeamFeatures &&
    (team.currentUserRole === "owner" || team.currentUserRole === "admin");

  async function addMember() {
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not add team member.");
      }

      setTeam(payload.team);
      setEmail("");
      setRole("member");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add team member.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateRole(membershipId: string, nextRole: TeamRole) {
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/team/${membershipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not update team role.");
      }

      setTeam(payload.team);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update team role.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeMember(membershipId: string) {
    const confirmed = window.confirm("Remove this person from the team?");
    if (!confirmed) return;

    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/team/${membershipId}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not remove team member.");
      }

      setTeam(payload.team);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not remove team member.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="teal">{team.organizationName}</Badge>
            <Badge tone="zinc">Role: {team.currentUserRole}</Badge>
            <Badge tone="green">{team.members.length} members</Badge>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
            Team members with active accounts can see organization-shared workspaces and
            knowledge assets immediately.
          </div>

          {!canUseTeamFeatures ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
              Team sharing is available on the Team plan. Your current access level is{" "}
              <span className="font-semibold">{effectivePlan.toUpperCase()}</span>.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
              {error}
            </div>
          ) : null}

          {canManage ? (
            <div className="grid gap-4 rounded-lg border border-zinc-200 p-4 md:grid-cols-[1fr_180px_auto]">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teammate@company.com"
                className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
              />
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as TeamRole)}
                className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
              >
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <Button onClick={addMember} disabled={isSaving || !email.trim()}>
                {isSaving ? "Saving..." : "Add member"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {team.members.map((member) => (
            <div
              key={member.membershipId}
              className="grid gap-3 rounded-lg border border-zinc-200 p-4 md:grid-cols-[1fr_auto_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-zinc-900">{member.name}</p>
                  <Badge tone={member.role === "owner" ? "green" : member.role === "admin" ? "teal" : "zinc"}>
                    {member.role}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-zinc-600">{member.email}</p>
                <p className="mt-1 text-xs text-zinc-500">Joined {formatDate(member.joinedAt)}</p>
              </div>

              {canManage && member.role !== "owner" ? (
                <select
                  value={member.role}
                  disabled={isSaving}
                  onChange={(event) =>
                    updateRole(member.membershipId, event.target.value as TeamRole)
                  }
                  className="h-10 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
                >
                  {roles.filter((item) => item !== "owner").map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : (
                <div />
              )}

              {canManage && member.role !== "owner" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isSaving}
                  onClick={() => removeMember(member.membershipId)}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
