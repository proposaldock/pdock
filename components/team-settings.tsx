"use client";

import { useState } from "react";
import Link from "next/link";
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
            Invite teammates by email. Existing ProposalDock users are added right away, and
            everyone else will see the team as soon as they sign up with the same email.
          </div>

          {!canUseTeamFeatures ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-semibold text-yellow-950">
                Team sharing is available on the Team plan.
              </p>
              <p className="mt-2 text-sm leading-6 text-yellow-900">
                Your current access level is{" "}
                <span className="font-semibold">{effectivePlan.toUpperCase()}</span>. Upgrade to
                Team when you want teammate invites, shared workspaces, and collaborative review.
              </p>
              <div className="mt-4">
                <Link href="/app/settings#billing">
                  <Button size="sm" variant="secondary">
                    View Team plan
                  </Button>
                </Link>
              </div>
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
                {isSaving ? "Saving..." : "Invite teammate"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {team.pendingInvites.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Pending invites</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {team.pendingInvites.map((invite) => (
              <div
                key={invite.inviteId}
                className="grid gap-3 rounded-lg border border-zinc-200 p-4 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-zinc-900">{invite.email}</p>
                    <Badge tone="yellow">pending</Badge>
                    <Badge tone="zinc">{invite.role}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600">
                    Invited by {invite.invitedByName}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Sent {formatDate(invite.invitedAt)}
                  </p>
                </div>

                {canManage ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isSaving}
                    onClick={async () => {
                      setError("");
                      setIsSaving(true);

                      try {
                        const response = await fetch(
                          `/api/team/invites/${invite.inviteId}`,
                          { method: "DELETE" },
                        );
                        const payload = await response.json();

                        if (!response.ok) {
                          throw new Error(payload.error || "Could not cancel invite.");
                        }

                        setTeam(payload.team);
                      } catch (caught) {
                        setError(
                          caught instanceof Error
                            ? caught.message
                            : "Could not cancel invite.",
                        );
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                  >
                    Cancel invite
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

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
