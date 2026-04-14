import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f4f6f7] px-6 py-16">
      <div className="mx-auto max-w-4xl rounded-lg border border-zinc-200 bg-white p-8 lg:p-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-950"
        >
          <ArrowLeft className="size-4" />
          Back to ProposalDock
        </Link>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Privacy Policy
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950">
          Privacy for ProposalDock beta
        </h1>
        <div className="mt-8 grid gap-8 text-sm leading-7 text-zinc-700">
          <section>
            <h2 className="text-lg font-bold text-zinc-950">What we collect</h2>
            <p className="mt-2">
              ProposalDock stores account details, team data, uploaded proposal materials,
              approved knowledge assets, workspace analysis output, and inbound contact or waitlist submissions.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">How we use it</h2>
            <p className="mt-2">
              We use this information to run the product, analyze proposal materials, support billing,
              operate the beta program, and improve the workflow. Uploaded and pasted content is processed
              server-side to generate analysis and drafts.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">Third-party services</h2>
            <p className="mt-2">
              ProposalDock may send relevant content to trusted infrastructure and AI providers such as
              Anthropic for analysis, Stripe for billing, and cloud storage providers for file handling.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">Retention and access</h2>
            <p className="mt-2">
              Beta data is retained to support active workspaces, billing history, and product support.
              Team owners and admins control access to shared team workspaces and internal lead views.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">Contact</h2>
            <p className="mt-2">
              For privacy requests during the beta, use the contact form on the ProposalDock site and
              include the email tied to your account or submission.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
