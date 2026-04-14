import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { PublicLeadForm } from "@/components/public-lead-form";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string; plan?: string }>;
}) {
  const resolved = await searchParams;
  const intent = resolved.intent === "waitlist" ? "waitlist" : "contact_sales";
  const plan =
    resolved.plan === "free" || resolved.plan === "pro" || resolved.plan === "team"
      ? resolved.plan
      : null;

  return (
    <main className="min-h-screen bg-[#f4f6f7] px-6 py-16">
      <AnalyticsBeacon page="contact" path="/contact" />
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-950"
        >
          <ArrowLeft className="size-4" />
          Back to ProposalDock
        </Link>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              ProposalDock beta
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Bring the right proposal workflow into the room early.
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-300">
              Whether you are evaluating ProposalDock for one bid lead or a wider team, this
              gives us enough context to shape the right rollout conversation.
            </p>
            <div className="mt-8 grid gap-4">
              {[
                "Grounded RFP analysis with source-linked output",
                "Shared review, signoff, and proposal assembly",
                "Knowledge base reuse across client responses",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                  <p className="text-sm leading-6 text-zinc-200">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-8">
            <AnalyticsBeacon page="contact" path="/contact" plan={plan} />
            <PublicLeadForm intent={intent} plan={plan} />
          </div>
        </div>
      </div>
    </main>
  );
}
