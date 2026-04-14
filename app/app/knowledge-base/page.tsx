import { KnowledgeBaseManager } from "@/components/knowledge-base-manager";
import { Badge } from "@/components/ui/badge";
import { requireCurrentUser } from "@/lib/auth";
import { getPlanEntitlements } from "@/lib/entitlements";
import { getUserAccountById, listKnowledgeAssetsForUser } from "@/lib/store";

export default async function KnowledgeBasePage() {
  const sessionUser = await requireCurrentUser();
  const user = await getUserAccountById(sessionUser.id);

  if (!user) {
    return null;
  }

  const entitlements = getPlanEntitlements(user.billing);
  const assets = entitlements.canUseKnowledgeBase
    ? await listKnowledgeAssetsForUser(sessionUser.id)
    : [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <p className="text-sm font-semibold text-emerald-700">Knowledge Base</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight">
        Approved company knowledge
      </h1>
      <div className="mt-3">
        <Badge tone="teal">{user.organization.organizationName}</Badge>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
        Build a reusable library of approved material for the active team and attach the right assets to each proposal workspace.
      </p>
      <div className="mt-8">
        <KnowledgeBaseManager
          initialAssets={assets}
          canManage={entitlements.canUseKnowledgeBase}
        />
      </div>
    </div>
  );
}
