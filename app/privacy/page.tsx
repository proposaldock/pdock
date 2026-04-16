import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { buildCanonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read how ProposalDock handles account data, proposal materials, analytics, billing, and beta operations during product use.",
  alternates: {
    canonical: buildCanonical("/privacy"),
  },
  openGraph: {
    title: "Privacy Policy",
    description:
      "Read how ProposalDock handles account data, proposal materials, analytics, billing, and beta operations during product use.",
    url: buildCanonical("/privacy"),
  },
};

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
            <h2 className="text-lg font-bold text-zinc-950">Who this policy applies to</h2>
            <p className="mt-2">
              This policy applies to visitors to the ProposalDock website, people who submit contact
              or waitlist forms, and users who create accounts or work inside ProposalDock workspaces.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">What we collect</h2>
            <p className="mt-2">
              ProposalDock stores account details, team data, uploaded proposal materials,
              approved knowledge assets, workspace analysis output, and inbound contact or waitlist submissions.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">Examples of account and workspace data</h2>
            <p className="mt-2">
              This can include your name, email address, organization name, billing identifiers,
              uploaded proposal documents, pasted brief text, internal review notes, generated drafts,
              team comments, export history, and workspace activity logs.
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
            <h2 className="text-lg font-bold text-zinc-950">Legal basis and product operations</h2>
            <p className="mt-2">
              We process data to provide the service you ask us to provide, maintain account access,
              operate subscription billing, secure the product, respond to support requests, and understand
              how the beta is being used so we can improve it.
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
            <h2 className="text-lg font-bold text-zinc-950">Analytics and beta operations data</h2>
            <p className="mt-2">
              ProposalDock tracks basic first-party product and marketing signals such as visits,
              signup intent, inbound leads, and beta follow-up status. These signals are used to operate
              the beta program and understand demand, not to expose customer pipeline information to regular users.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">How long we keep data</h2>
            <p className="mt-2">
              We keep account and workspace data while your account remains active and for a reasonable period
              afterward to support billing records, support requests, service continuity, and product security.
              We may retain limited records where required for legal, financial, or fraud-prevention reasons.
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
            <h2 className="text-lg font-bold text-zinc-950">Security and confidentiality</h2>
            <p className="mt-2">
              We use access controls, authenticated sessions, hosted infrastructure, and managed providers
              to reduce risk. Even so, you should avoid uploading material you are not permitted to process
              and should treat beta software as an evolving service rather than a final compliance product.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">Your choices</h2>
            <p className="mt-2">
              You can update account information, manage team access, and cancel paid subscriptions through
              the product or connected billing portal. If you want us to delete or export specific account data,
              contact us using the account email tied to your workspace.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-zinc-950">International providers</h2>
            <p className="mt-2">
              Because ProposalDock uses cloud providers and AI infrastructure, data may be processed by providers
              operating in more than one country. We choose providers to run the service reliably, but cross-border
              processing can be part of the product workflow.
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
