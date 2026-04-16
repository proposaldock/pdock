import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ActivationBeacon } from "@/components/activation-beacon";
import { Badge } from "@/components/ui/badge";
import { WorkspaceForm } from "@/components/workspace-form";
import { requireCurrentUser } from "@/lib/auth";
import { getPlanEntitlements } from "@/lib/entitlements";
import {
  getUserAccountById,
  listKnowledgeAssetsForUser,
  listWorkspacesForUser,
} from "@/lib/store";

export default async function NewWorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const sessionUser = await requireCurrentUser();
  const [user, allKnowledgeAssets, workspaces, resolvedSearchParams] = await Promise.all([
    getUserAccountById(sessionUser.id),
    listKnowledgeAssetsForUser(sessionUser.id),
    listWorkspacesForUser(sessionUser.id),
    searchParams,
  ]);

  if (!user) {
    return null;
  }

  const entitlements = getPlanEntitlements(user.billing);
  const knowledgeAssets = entitlements.canUseKnowledgeBase ? allKnowledgeAssets : [];
  const ownedWorkspaceCount = workspaces.filter(
    (workspace) => workspace.ownerId === sessionUser.id,
  ).length;
  const workspaceLimitReached = ownedWorkspaceCount >= entitlements.workspaceLimit;
  const showWelcome = resolvedSearchParams.welcome === "1";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      {showWelcome ? <ActivationBeacon eventType="first_workspace_started" /> : null}
      <Link
        href="/app"
        className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-950"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>
      <div className="mt-6">
        {showWelcome ? (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-950">
              Welcome. Your first useful step is creating one proposal workspace.
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-900">
              You can use sample demo data, paste a client brief, or upload source material.
              ProposalDock will then build the first requirements, risks, draft guidance, and
              sources for review.
            </p>
          </div>
        ) : null}
        <p className="text-sm font-semibold text-emerald-700">New workspace</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">
          Create proposal workspace
        </h1>
        <div className="mt-3">
          <Badge tone="teal">{user.organization.organizationName}</Badge>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Upload source material, add approved company knowledge, and generate a
          structured analysis package for the bid team inside the active team space.
        </p>
      </div>
      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5">
        <p className="text-sm font-semibold text-zinc-900">How this flow works</p>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-zinc-600 md:grid-cols-3">
          <p>
            <span className="font-semibold text-zinc-900">1. Add the brief</span><br />
            Upload source files or paste the client request directly.
          </p>
          <p>
            <span className="font-semibold text-zinc-900">2. Attach trusted knowledge</span><br />
            Add reusable company context from the Knowledge Base or paste deal-specific notes.
          </p>
          <p>
            <span className="font-semibold text-zinc-900">3. Run analysis</span><br />
            ProposalDock builds requirements, risks, draft language, and evidence-linked source chunks.
          </p>
        </div>
      </div>
      <div className="mt-8">
        <WorkspaceForm
          knowledgeAssets={knowledgeAssets}
          canUseKnowledgeBase={entitlements.canUseKnowledgeBase}
          workspaceLimitReached={workspaceLimitReached}
          effectivePlan={entitlements.effectivePlan}
        />
      </div>
    </div>
  );
}
