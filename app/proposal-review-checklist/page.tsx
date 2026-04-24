import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  title: "Proposal Review Checklist | ProposalDock",
  description:
    "Use this proposal review checklist to check requirements, risks, scope, evidence, approvals, and export readiness before sending a proposal.",
  alternates: {
    canonical: buildCanonical("/proposal-review-checklist"),
  },
  openGraph: {
    title: "Proposal Review Checklist | ProposalDock",
    description:
      "A practical proposal review checklist for B2B service teams, with a clear path into ProposalDock for structured review.",
    url: buildCanonical("/proposal-review-checklist"),
  },
};

const checklistSections = [
  {
    title: "Requirement coverage",
    items: [
      "Does the response address the explicit requirements from the brief or RFP?",
      "Are any asks still unsupported, vague, or missing an owner?",
    ],
  },
  {
    title: "Scope and assumptions",
    items: [
      "Are key assumptions written down and visible to reviewers?",
      "Have we avoided quietly promising work outside the intended scope?",
    ],
  },
  {
    title: "Delivery risk",
    items: [
      "Can the team deliver within the proposed timeline and staffing model?",
      "Are any dependencies, onboarding constraints, or resource gaps visible?",
    ],
  },
  {
    title: "Commercial risk",
    items: [
      "Do pricing, commercials, and commitments align with what delivery can support?",
      "Is anything in the proposal likely to create rework or awkward negotiation later?",
    ],
  },
  {
    title: "Evidence and reusable knowledge",
    items: [
      "Are claims supported by approved knowledge, proof points, or known delivery material?",
      "Have we reused trusted material instead of improvising new unsupported language?",
    ],
  },
  {
    title: "Human review and signoff",
    items: [
      "Has the right person reviewed the risky or high-commitment sections?",
      "Is there a visible signoff path before the response is sent?",
    ],
  },
  {
    title: "Export readiness",
    items: [
      "Is the proposal ready for DOCX or client-ready export without obvious gaps?",
      "Are formatting, ownership, and final review status clear enough to send confidently?",
    ],
  },
];

export default function ProposalReviewChecklistPage() {
  return (
    <SeoPageShell>
      <SeoBackLink />

      <SeoHero
        eyebrow="Proposal review checklist"
        title="Proposal Review Checklist for B2B Service Teams"
        intro="This page is designed to be useful even if you review proposals manually today. Use it as a final pass before sending a proposal, or use ProposalDock to automate the first structured review pass."
        detail="The checklist focuses on the practical issues that usually get missed: requirement coverage, scope assumptions, risk, evidence, approvals, and export readiness."
        badges={["Checklist asset", "Review workflow", "Export readiness"]}
        sideTitle="What a good review catches"
        sideItems={[
          "Requirements that are still uncovered or unsupported",
          "Scope and delivery assumptions that need human review",
          "Evidence gaps and weak claims before they reach the client",
          "Whether the proposal is truly ready to export and send",
        ]}
      />

      <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
        <SectionLabel>Manual review checklist</SectionLabel>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
          Use this checklist before a proposal leaves the team.
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {checklistSections.map((section) => (
            <Card key={section.title} className="border-zinc-200 bg-[#f4f6f7]">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {section.items.map((item) => (
                  <p key={item} className="text-sm leading-7 text-zinc-700">
                    {item}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <SeoCtaSection
        eyebrow="From checklist to workflow"
        title="Use this checklist manually, or use ProposalDock to structure the review."
        body="ProposalDock turns briefs and RFPs into a review workflow with extracted requirements, visible risks, approved knowledge, human signoff, and export-ready proposal work. The checklist stays useful either way."
        primaryLabel="Start free"
        secondaryHref="/proposal-workflow-software"
        secondaryLabel="See the workflow"
      />

      <RelatedPagesSection
        title="Related review and RFP pages"
        pages={[
          {
            href: "/proposal-workflow-software",
            title: "Proposal workflow software",
            body: "The broader workflow from intake through review, drafting, and export.",
          },
          {
            href: "/proposal-software-for-consultants",
            title: "Proposal software for consultants",
            body: "How ProposalDock fits consulting teams that need more structured proposal work.",
          },
          {
            href: "/proposal-risk-review",
            title: "Proposal risk review",
            body: "A more focused look at how teams catch proposal risk before sending.",
          },
          {
            href: "/rfp-response-software",
            title: "RFP response software",
            body: "How the same review logic applies to RFP response work and formal buyer requirements.",
          },
        ]}
      />
    </SeoPageShell>
  );
}
