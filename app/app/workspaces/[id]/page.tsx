import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { WorkspaceResults } from "@/components/workspace-results";
import { requireCurrentUser } from "@/lib/auth";
import { getWorkspace, listOrganizationTeamForUser } from "@/lib/store";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const [workspace, team] = await Promise.all([
    getWorkspace(id, user.id),
    listOrganizationTeamForUser(user.id),
  ]);

  if (!workspace) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <Link
        href="/app"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-950"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>
      <WorkspaceResults workspace={workspace} team={team} />
    </div>
  );
}
