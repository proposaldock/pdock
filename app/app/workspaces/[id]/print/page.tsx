import { notFound, redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth";
import { getPlanEntitlements } from "@/lib/entitlements";
import {
  appendWorkspaceActivity,
  createActivityEntry,
  getUserAccountById,
  getWorkspace,
} from "@/lib/store";

function ReviewedAnswers({ workspaceId }: { workspaceId: Awaited<ReturnType<typeof getWorkspace>> }) {
  if (!workspaceId) return null;

  const acceptedAnswers = workspaceId.analysis.requirements
    .map((requirement) => {
      const review = workspaceId.reviewState.requirements.find(
        (item) => item.requirementId === requirement.id,
      );

      if (!review?.draftAnswer.trim()) return null;

      return {
        requirement,
        review,
      };
    })
    .filter(
      (
        item,
      ): item is {
        requirement: (typeof workspaceId.analysis.requirements)[number];
        review: (typeof workspaceId.reviewState.requirements)[number];
      } => Boolean(item),
    );

  if (!acceptedAnswers.length) {
    return <p>No reviewed draft answers are available yet.</p>;
  }

  return (
    <div className="space-y-8">
      {acceptedAnswers.map((item) => (
        <section key={item.requirement.id} className="space-y-2">
          <h3 className="text-lg font-bold">
            {item.requirement.id}: {item.requirement.title}
          </h3>
          <p className="text-sm text-zinc-500">Decision: {item.review.decision}</p>
          <p className="leading-7 whitespace-pre-wrap">{item.review.draftAnswer}</p>
          {item.review.note.trim() ? (
            <p className="text-sm text-zinc-600">Internal note: {item.review.note}</p>
          ) : null}
        </section>
      ))}
    </div>
  );
}

export default async function PrintableWorkspacePackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const [account, workspace] = await Promise.all([
    getUserAccountById(user.id),
    getWorkspace(id, user.id),
  ]);

  if (!account || !workspace) {
    notFound();
  }

  if (!getPlanEntitlements(account.billing).canExport) {
    redirect("/app/settings?plan=pro");
  }

  await appendWorkspaceActivity(id, [
    createActivityEntry(
      "print_view_opened",
      "Print view opened",
      "The printable response pack view was opened.",
    ),
  ], user.id);

  return (
    <main className="min-h-screen bg-white text-zinc-950 print:bg-white">
      <div className="mx-auto max-w-4xl px-8 py-12">
        <header className="border-b border-zinc-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            ProposalDock
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Proposal Response Pack</h1>
          <div className="mt-6 grid gap-2 text-sm text-zinc-600">
            <p>
              <span className="font-semibold text-zinc-900">Workspace:</span>{" "}
              {workspace.workspaceName}
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Client:</span> {workspace.clientName}
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Prepared:</span>{" "}
              {new Intl.DateTimeFormat("en", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date())}
            </p>
          </div>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Executive Summary</h2>
          <p className="mt-4 whitespace-pre-wrap leading-8">
            {workspace.reviewState.executiveSummary}
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Response Strategy</h2>
          <p className="mt-4 whitespace-pre-wrap leading-8">
            {workspace.reviewState.responseStrategy}
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Reviewed Answers</h2>
          <div className="mt-6">
            <ReviewedAnswers workspaceId={workspace} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Risk Highlights</h2>
          <div className="mt-6 space-y-6">
            {workspace.analysis.risks.map((risk) => (
              <div key={risk.title} className="border-l-4 border-rose-300 pl-4">
                <h3 className="font-bold">{risk.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">Severity: {risk.severity}</p>
                <p className="mt-3 leading-7">{risk.description}</p>
                <p className="mt-3 leading-7">
                  <span className="font-semibold">Recommendation:</span>{" "}
                  {risk.recommendation}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Evidence Sources</h2>
          <div className="mt-6 space-y-6">
            {workspace.analysis.sources.map((source) => (
              <div key={source.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-semibold">
                    {source.id}
                  </span>
                  <span className="font-semibold">{source.label}</span>
                  <span className="text-sm text-zinc-500">
                    {source.sourceType === "knowledge_asset"
                      ? source.assetTitle || "Knowledge asset"
                      : source.documentLabel || "Document"}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-700">
                  {source.content || source.excerpt}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
