import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { buildCanonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the ProposalDock beta terms covering accounts, acceptable use, billing, AI-generated output, cancellations, and service changes.",
  alternates: {
    canonical: buildCanonical("/terms"),
  },
  openGraph: {
    title: "Terms of Service",
    description:
      "Read the ProposalDock beta terms covering accounts, acceptable use, billing, AI-generated output, cancellations, and service changes.",
    url: buildCanonical("/terms"),
  },
};

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
            <h2 className="text-lg font-bold text-zinc-950">Accounts and eligibility</h2>
            <p className="mt-2">
              You are responsible for activity under your account and for keeping login credentials secure.
              If you create a team, you are also responsible for who you invite and what level of access they receive.
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
            <h2 className="text-lg font-bold text-zinc-950">Acceptable use</h2>
            <p className="mt-2">
              You may not use ProposalDock to process unlawful content, infringe the rights of others,
              interfere with the service, attempt unauthorized access, or use the product in a way that creates
              unreasonable load, abuse, or security risk.
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
            <h2 className="text-lg font-bold text-zinc-950">No professional guarantee</h2>
            <p className="mt-2">
              ProposalDock is a workflow and drafting tool. It does not provide legal advice, procurement advice,
              compliance certification, or guaranteed bid outcomes. You remain responsible for final submissions,
              approvals, and contractual commitments.
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
            <h2 className="text-lg font-bold text-zinc-950">Plan changes and cancellation</h2>
            <p className="mt-2">
              You can upgrade, manage, or cancel a paid subscription through the connected billing flow.
              Unless otherwise stated, changes take effect according to the Stripe checkout or billing portal
              flow shown to you at the time of the change.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">Availability</h2>
            <p className="mt-2">
              During beta, ProposalDock may experience changes, maintenance, or occasional interruptions.
              We aim to keep the service reliable, but beta access is provided on an evolving basis.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">Suspension and termination</h2>
            <p className="mt-2">
              We may suspend or limit access where needed to address abuse, security issues, unpaid subscriptions,
              legal obligations, or risks to the service. You may stop using the service at any time.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">Limitation of liability</h2>
            <p className="mt-2">
              To the maximum extent permitted by law, ProposalDock is provided on an as-available basis during beta.
              We do not promise uninterrupted service or error-free output, and we are not responsible for indirect,
              incidental, or consequential losses arising from your use of the beta.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">Changes to the service or terms</h2>
            <p className="mt-2">
              We may update the product, pricing, or these terms as ProposalDock evolves. When changes matter materially,
              we will update the published terms and reflect the latest operating model in the product.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
