"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, Pencil, ShieldAlert, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Workspace } from "@/lib/types";
import { formatDate, truncate } from "@/lib/utils";

function workspaceHealth(workspace: Workspace) {
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
    return {
      label: "Ready",
      tone: "green" as const,
      icon: CheckCircle2,
    };
  }

  if (approvedSections > 0 || workspace.activityLog.length > 3) {
    return {
      label: "In progress",
      tone: "yellow" as const,
      icon: Clock3,
    };
  }

  return {
    label: "Needs attention",
    tone: "red" as const,
    icon: ShieldAlert,
  };
}

export function WorkspaceLibrary({
  initialWorkspaces,
}: {
  initialWorkspaces: Workspace[];
}) {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const savedCountLabel = useMemo(
    () => `${workspaces.length} saved locally`,
    [workspaces.length],
  );

  async function removeWorkspace(id: string) {
    const confirmed = window.confirm("Delete this workspace?");
    if (!confirmed) return;

    setBusyId(id);
    setError("");

    try {
      const response = await fetch(`/api/workspaces/${id}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Delete failed.");
      }

      setWorkspaces((current) => current.filter((workspace) => workspace.id !== id));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function submitRename(id: string) {
    const workspaceName = draftName.trim();
    if (!workspaceName) return;

    setBusyId(id);
    setError("");

    try {
      const response = await fetch(`/api/workspaces/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceName }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Rename failed.");
      }

      setWorkspaces((current) =>
        current.map((workspace) =>
          workspace.id === id ? payload.workspace : workspace,
        ),
      );
      setEditingId(null);
      setDraftName("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Rename failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Recent workspaces</h2>
        <Badge tone="teal">{savedCountLabel}</Badge>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4">
        {workspaces.map((workspace) => (
          <Card key={workspace.id} className="transition hover:border-emerald-300 hover:shadow-md">
            <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
              <Link href={`/app/workspaces/${workspace.id}`} className="min-w-0">
                <div>
                  {(() => {
                    const health = workspaceHealth(workspace);
                    const HealthIcon = health.icon;

                    return (
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge tone={health.tone}>
                          <HealthIcon className="size-3.5" />
                          {health.label}
                        </Badge>
                        <Badge tone="zinc">
                          {workspace.proposalState.sections.filter(
                            (section) => section.status === "approved",
                          ).length}
                          /{workspace.proposalState.sections.length} sections approved
                        </Badge>
                      </div>
                    );
                  })()}
                  <div className="flex flex-wrap items-center gap-2">
                    {editingId === workspace.id ? (
                      <input
                        autoFocus
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        onClick={(event) => event.stopPropagation()}
                        className="h-10 w-full max-w-sm rounded-lg border border-zinc-300 px-3 text-sm font-semibold outline-none focus:border-emerald-500"
                      />
                    ) : (
                      <h3 className="font-bold">{workspace.workspaceName}</h3>
                    )}
                    <Badge tone="zinc">{workspace.clientName}</Badge>
                    {workspace.organizationName ? (
                      <Badge tone="teal">{workspace.organizationName}</Badge>
                    ) : null}
                    <Badge
                      tone={
                        workspace.visibility === "organization"
                          ? "green"
                          : workspace.visibility === "selected"
                            ? "teal"
                            : "zinc"
                      }
                    >
                      {workspace.visibility === "organization"
                        ? "team shared"
                        : workspace.visibility === "selected"
                          ? "selected teammates"
                          : "private"}
                    </Badge>
                    <Badge tone="teal">
                      {workspace.analysis.overview.estimatedComplexity}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">
                    {truncate(workspace.analysis.overview.summary, 170)}
                  </p>
                </div>
              </Link>

              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <p className="text-sm text-zinc-500">
                  Updated {formatDate(workspace.updatedAt)}
                </p>
                {editingId === workspace.id ? (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busyId === workspace.id}
                      onClick={() => {
                        setEditingId(null);
                        setDraftName("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={busyId === workspace.id}
                      onClick={() => submitRename(workspace.id)}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busyId === workspace.id}
                      onClick={() => {
                        setEditingId(workspace.id);
                        setDraftName(workspace.workspaceName);
                      }}
                    >
                      <Pencil className="size-4" />
                      Rename
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busyId === workspace.id}
                      onClick={() => removeWorkspace(workspace.id)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
