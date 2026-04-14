import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WorkspaceForm } from "@/components/workspace-form";
import { requireCurrentUser } from "@/lib/auth";
import { getUserAccountById, listKnowledgeAssetsForUser } from "@/lib/store";

export default async function NewWorkspacePage() {
  const sessionUser = await requireCurrentUser();
  const [user, knowledgeAssets] = await Promise.all([
    getUserAccountById(sessionUser.id),
    listKnowledgeAssetsForUser(sessionUser.id),
  ]);

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
      <Link
        href="/app"
        className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-950"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>
      <div className="mt-6">
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
      <div className="mt-8">
        <WorkspaceForm knowledgeAssets={knowledgeAssets} />
      </div>
    </div>
  );
}
