import type { Metadata } from "next";
import {
  RelatedPagesSection,
  SeoBackLink,
  SeoCtaSection,
  SeoHero,
  SeoPageShell,
  SectionLabel,
} from "@/components/public-seo";
import { buildCanonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "RFP Requirements Extraction Software | ProposalDock",
  description:
    "Extract RFP requirements into a structured view for review, ownership, risk assessment, and proposal drafting.",
  alternates: {
    canonical: buildCanonical("/rfp-requirements-extraction"),
  },
  openGraph: {
    title: "RFP Requirements Extraction Software | ProposalDock",
    description:
      "ProposalDock helps teams convert raw RFP language into structured requirements with ownership, risk flags, and response context.",
    url: buildCanonical("/rfp-requirements-extraction"),
  },
};

export default function RfpRequirementsExtractionPage() {
  return (
    <SeoPageShell>
      <SeoBackLink />

      <SeoHero
        eyebrow="RFP requirements extraction"
        title="RFP Requirements Extraction for Structured Response Work"
        intro="RFP requirements extraction is the step that turns long buyer documents into a structured view the team can actually work from. ProposalDock helps create that view before drafting and review drift apart."
        detail="The goal is not just speed. It is clearer ownership, earlier risk assessment, and a more grounded path into proposal drafting."
        badges={["Requirement mapping", "Ownership", "Risk context"]}
        sideTitle="What a structured extraction should include"
        sideItems={[
          "The requirement itself in plain language",
          "Deadlines and role expectations",
          "Likely response owner",
          "Risk signals and review status",
        ]}
      />

      <section className="mt-12 rounded-lg border border-zinc-200 bg-zinc-950 p-8 text-white">
        <SectionLabel>Extraction example</SectionLabel>
        <h2 className="mt-3 text-3xl font-black tracking-tight">
          Example from original requirement to structured output
        </h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-white/15 bg-white/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
              Original RFP requirement
            </p>
            <p className="mt-3 text-sm leading-7 text-zinc-100">
              &quot;Vendor must provide implementation support within 30 days and include a
              dedicated account manager.&quot;
            </p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
              Extracted requirement
            </p>
            <div className="mt-3 grid gap-2 text-sm leading-7 text-zinc-100">
              <p>- Requirement: implementation support</p>
              <p>- Deadline: within 30 days</p>
              <p>- Role required: dedicated account manager</p>
              <p>- Response owner: delivery/customer success</p>
              <p>- Risk: staffing and onboarding capacity</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
        <SectionLabel>Why extraction matters</SectionLabel>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
          Structured requirements make response work easier to review.
        </h2>
        <div className="mt-6 grid gap-4 text-sm leading-7 text-zinc-700">
          <p>
            When requirements are extracted into a structured list, the team can assign owners,
            review risk, build a compliance matrix, and decide what needs evidence before the draft
            grows.
          </p>
          <p>
            ProposalDock helps create that structure from the RFP, then keeps the response workflow
            connected to review and export.
          </p>
        </div>
      </section>

      <RelatedPagesSection
        title="Related pages for requirements and compliance work"
        pages={[
          {
            href: "/rfp-response-software",
            title: "RFP response software",
            body: "The broader response workflow that starts with structured requirements.",
          },
          {
            href: "/ai-rfp-analysis",
            title: "AI RFP analysis",
            body: "How ProposalDock supports AI-assisted RFP review without skipping human judgment.",
          },
          {
            href: "/rfp-compliance-matrix",
            title: "RFP compliance matrix",
            body: "Track extracted requirements, evidence, ownership, gaps, and review status.",
          },
          {
            href: "/proposal-workflow-software",
            title: "Proposal workflow software",
            body: "See how structured extraction feeds into the wider proposal workflow.",
          },
        ]}
      />

      <SeoCtaSection
        eyebrow="Start with structure"
        title="Extract requirements first so review and drafting have something solid to work from."
        body="ProposalDock helps teams turn raw RFP language into structured requirements, then connect those requirements to risk review, ownership, approved knowledge, and proposal drafting."
        primaryLabel="Start free"
        secondaryHref="/rfp-response-software"
        secondaryLabel="See the RFP workflow"
      />
    </SeoPageShell>
  );
}
