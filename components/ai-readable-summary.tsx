export function AiReadableSummary({
  title = "ProposalDock in one paragraph",
  summary,
}: {
  title?: string;
  summary: string;
}) {
  return (
    <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
        AI-readable summary
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">{title}</h2>
      <p className="mt-5 max-w-4xl text-sm leading-7 text-zinc-700">{summary}</p>
    </section>
  );
}
