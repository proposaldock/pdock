import type { Metadata } from "next";
import { AiReadableSummary } from "@/components/ai-readable-summary";
import { PageFaqSection } from "@/components/page-faq";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RelatedPagesSection,
  SeoBackLink,
  SeoCtaSection,
  SeoHero,
  SeoPageShell,
  SectionLabel,
} from "@/components/public-seo";
import { buildCanonical, getFaqPageJsonLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Proposal Risk Review Software | ProposalDock",
  description:
    "ProposalDock helps service teams identify scope, delivery, compliance, and commercial risks before a proposal is approved and exported.",
  alternates: {
    canonical: buildCanonical("/proposal-risk-review"),
  },
  openGraph: {
    title: "Proposal Risk Review Software | ProposalDock",
    description:
      "ProposalDock acts as a review layer between brief intake and final proposal export so teams can catch risk earlier.",
    url: buildCanonical("/proposal-risk-review"),
  },
};

const riskCategories = [
  {
    title: "Scope risk",
    body: "The proposal quietly promises work the team has not fully scoped or priced.",
  },
  {
    title: "Delivery risk",
    body: "Timelines, staffing, onboarding, or dependencies create pressure the response does not yet acknowledge.",
  },
  {
    title: "Compliance risk",
    body: "Requirements or mandatory asks are missed, poorly covered, or handled without enough evidence.",
  },
  {
    title: "Commercial risk",
    body: "Pricing, commercials, or commitments drift away from what the team can safely support.",
  },
  {
    title: "Evidence gaps",
    body: "Claims sound good in the draft but are not backed by approved knowledge, proof, or known delivery material.",
  },
] as const;

const faqs = [
  {
    question: "What is proposal risk review?",
    answer:
      "Proposal risk review is the process of checking a proposal for scope, delivery, compliance, commercial, and evidence risk before it is approved and sent. ProposalDock supports that review earlier in the workflow, not just at the final draft stage.",
  },
  {
    question: "How do consultants review proposal risk?",
    answer:
      "Consultants usually review requirements, assumptions, staffing pressure, delivery commitments, and proof gaps. ProposalDock helps make those signals visible in one workspace before export.",
  },
  {
    question: "What should be checked before sending a proposal?",
    answer:
      "Teams should review requirement coverage, scope assumptions, delivery risk, commercial commitments, evidence quality, human signoff, and export readiness before sending a proposal.",
  },
  {
    question: "Does ProposalDock replace human proposal review?",
    answer:
      "No. ProposalDock uses AI-assisted analysis to help surface risk and gaps, but people still review the proposal, approve what is safe to send, and sign off before export.",
  },
] as const;

export default function ProposalRiskReviewPage() {
  const faqJsonLd = getFaqPageJsonLd(faqs);

  return (
    <SeoPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <SeoBackLink />

      <SeoHero
        eyebrow="Proposal risk review"
        title="Proposal Risk Review Before You Send"
        intro="Proposal risk is often missed because teams review too late. By the time a polished draft exists, awkward assumptions and delivery gaps are already baked into the response."
        detail="ProposalDock helps teams review risk earlier, while the brief, requirements, knowledge, and draft direction are still easy to question and adjust."
        badges={["Scope risk", "Delivery risk", "Human signoff"]}
        sideTitle="Why teams miss proposal risk"
        sideItems={[
          "The brief is read quickly and interpreted differently by different people",
          "Review happens on final copy instead of earlier decision points",
          "Evidence and assumptions stay scattered across documents",
          "No one sees all the risk categories in one place",
        ]}
      />

      <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
        <SectionLabel>Definition</SectionLabel>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
          What is proposal risk review?
        </h2>
        <div className="mt-5 grid gap-4 text-sm leading-7 text-zinc-700">
          <p>
            Proposal risk review is the process of checking a proposal for scope, delivery,
            compliance, commercial, and evidence risk before it is approved and sent.
          </p>
          <p>
            In ProposalDock, that review sits between brief or RFP intake and final export so the
            team can question assumptions, missing proof, and weak-fit commitments while change is
            still easy.
          </p>
        </div>
      </section>

      <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
        <SectionLabel>Common proposal risks</SectionLabel>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
          Common risks in consulting and service proposals
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {riskCategories.map((item) => (
            <Card key={item.title} className="border-zinc-200 bg-[#f4f6f7]">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-zinc-600">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>How ProposalDock flags risk</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-7 text-zinc-700">
            <p>
              The workflow starts with brief or RFP intake, then extracts requirements and likely
              delivery asks into a structured view that the team can review.
            </p>
            <p>
              Once those requirements are visible, ProposalDock helps surface risk, missing
              information, unsupported claims, and places where approved knowledge is still missing.
            </p>
            <p>
              That gives reviewers something more useful than a late-stage draft: a review layer
              between the raw brief and the final proposal.
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-zinc-950 text-white">
          <CardHeader>
            <CardTitle>Human review before export</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-7 text-zinc-200">
            <p>
              ProposalDock does not ask AI to make legal or commercial decisions by itself. It
              supports the first pass of structured review, then keeps human signoff visible before
              the team exports client-ready material.
            </p>
            <p>
              That makes it easier to move faster without pretending risk has disappeared.
            </p>
          </CardContent>
        </Card>
      </section>

      <RelatedPagesSection
        title="Related pages for risk and response review"
        pages={[
          {
            href: "/client-brief-analysis",
            title: "Client brief analysis",
            body: "Start with the structured intake work that makes risk easier to see.",
          },
          {
            href: "/rfp-response-software",
            title: "RFP response software",
            body: "See how ProposalDock supports formal buyer requests and response workflows.",
          },
          {
            href: "/proposal-review-checklist",
            title: "Proposal review checklist",
            body: "Use a practical manual checklist or map it to ProposalDock's review flow.",
          },
          {
            href: "/ai-proposal-software",
            title: "AI proposal software",
            body: "How AI-assisted analysis supports review without replacing human judgment.",
          },
        ]}
      />

      <SeoCtaSection
        eyebrow="Review before you send"
        title="Catch proposal risk earlier, while the team can still act on it."
        body="Bring the brief into ProposalDock, review requirements and risks, attach approved knowledge, and move into a safer export path with visible human signoff."
        primaryLabel="Start free"
        secondaryHref="/proposal-review-checklist"
        secondaryLabel="Use the checklist"
      />

      <AiReadableSummary
        summary="ProposalDock is an AI-assisted proposal software platform for consultants and B2B service teams. On this page, the focus is proposal risk review: identifying scope, delivery, compliance, commercial, and evidence risks after requirements are extracted and before a proposal is signed off and exported."
      />

      <PageFaqSection title="Questions people ask about proposal risk review" items={faqs} />
    </SeoPageShell>
  );
}
