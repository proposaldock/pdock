import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          Terms of Service
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950">
          Terms for ProposalDock beta
        </h1>
        <div className="mt-8 grid gap-8 text-sm leading-7 text-zinc-700">
          <section>
            <h2 className="text-lg font-bold text-zinc-950">Beta use</h2>
            <p className="mt-2">
              ProposalDock is currently offered as a beta workflow product for proposal and RFP response work.
              Features may evolve as the product matures.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">Your content</h2>
            <p className="mt-2">
              You are responsible for the documents, company knowledge, and response content you upload or create.
              You should only upload material you are allowed to use and process.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">AI-generated output</h2>
            <p className="mt-2">
              ProposalDock helps teams move faster, but generated output should always be reviewed by a human
              before submission. The product is designed to stay grounded, not to replace review and approval.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">Billing</h2>
            <p className="mt-2">
              Paid plans, if enabled for your account, are billed through Stripe. Subscription terms,
              renewals, and cancellations follow the billing flow shown in your account settings.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">Availability</h2>
            <p className="mt-2">
              During beta, ProposalDock may experience changes, maintenance, or occasional interruptions.
              We aim to keep the service reliable, but beta access is provided on an evolving basis.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
