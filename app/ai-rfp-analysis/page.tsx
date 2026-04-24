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
  title: "AI RFP Analysis Software | ProposalDock",
  description:
    "Use AI-assisted RFP analysis to extract requirements, risks, deadlines, scope gaps, and response priorities before drafting.",
  alternates: {
    canonical: buildCanonical("/ai-rfp-analysis"),
  },
  openGraph: {
    title: "AI RFP Analysis Software | ProposalDock",
    description:
      "ProposalDock helps teams move from raw RFP documents to structured requirements, risks, deadlines, and review-ready response work.",
    url: buildCanonical("/ai-rfp-analysis"),
  },
};

const whatItFinds = [
  "Named requirements and mandatory asks",
  "Deadlines, response timing, and delivery constraints",
  "Scope gaps and unclear buyer expectations",
  "Priority areas that need early attention",
  "Risk flags before drafting and pricing move too far",
] as const;

const faqs = [
  {
    question: "What is AI RFP analysis?",
    answer:
      "AI RFP analysis is the process of using AI-assisted review to turn an RFP document into structured requirements, risks, deadlines, scope gaps, and response priorities. In ProposalDock, this analysis supports human review rather than replacing commercial or delivery judgment.",
  },
  {
    question: "What is the best way to review an RFP with AI?",
    answer:
      "The best approach is to use AI-assisted extraction first, then review the structured output with humans. ProposalDock is built to show requirements, risks, and gaps clearly before the response is drafted too far.",
  },
  {
    question: "Can AI decide whether to bid on an RFP?",
    answer:
      "AI can help organize the inputs, but ProposalDock is designed so humans still decide fit, risk tolerance, and whether the opportunity should move forward.",
  },
  {
    question: "How does ProposalDock keep the analysis review-ready?",
    answer:
      "ProposalDock turns the RFP into structured requirements, deadlines, risks, and draft direction that the team can inspect, question, and approve before export.",
  },
] as const;

export default function AiRfpAnalysisPage() {
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
        eyebrow="AI RFP analysis"
        title="AI RFP Analysis for Faster, Safer Responses"
        intro="AI RFP analysis means using structured assistance to turn raw RFP documents into something the team can actually review: requirements, deadlines, risks, scope gaps, and proposal priorities."
        detail="ProposalDock uses AI-assisted analysis as the first pass, then keeps human review in charge before the response becomes a client-facing draft."
        badges={["Requirements", "Deadlines", "Risk and scope gaps"]}
        sideTitle="What teams miss in manual RFP review"
        sideItems={[
          "Buried requirements inside long narrative sections",
          "Timeline pressure hiding in appendices or legal language",
          "Scope asks that sound smaller than they are",
          "Gaps that should affect bid or no-bid decisions",
        ]}
      />

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>What is AI RFP analysis?</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-7 text-zinc-700">
            <p>
              It is not autonomous decision-making. It is structured extraction and organization so
              the team can review what matters faster.
            </p>
            <p>
              ProposalDock helps create a first-pass map of the RFP, then lets humans judge fit,
              risk, ownership, and final response direction.
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>Requirements, risks, deadlines, and scope gaps</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {whatItFinds.map((item) => (
              <p key={item} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
                {item}
              </p>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-12 rounded-lg border border-zinc-200 bg-zinc-950 p-8 text-white">
        <SectionLabel>From analysis to draft</SectionLabel>
        <h2 className="mt-3 text-3xl font-black tracking-tight">
          From RFP analysis to proposal draft
        </h2>
        <div className="mt-6 grid gap-4 text-sm leading-7 text-zinc-200">
          <p>
            Once the requirement and risk picture is visible, ProposalDock helps teams attach
            approved knowledge, prepare draft sections, and move into a cleaner response process.
          </p>
          <p>
            Human review and approval still matter. The point is to reach them faster with better
            structure, not to skip them.
          </p>
        </div>
      </section>

      <RelatedPagesSection
        title="Related pages for RFP analysis and response work"
        pages={[
          {
            href: "/rfp-response-software",
            title: "RFP response software",
            body: "The main RFP pillar page for ProposalDock's response workflow.",
          },
          {
            href: "/rfp-requirements-extraction",
            title: "RFP requirements extraction",
            body: "See how raw buyer language becomes structured requirements.",
          },
          {
            href: "/rfp-risk-assessment",
            title: "RFP risk assessment",
            body: "Review delivery, compliance, scope, and commercial risk before committing.",
          },
          {
            href: "/bid-no-bid-analysis",
            title: "Bid/no-bid analysis",
            body: "Use the structured review output to support bid decisions.",
          },
          {
            href: "/ai-proposal-software",
            title: "AI proposal software",
            body: "The broader view of how AI-assisted proposal work fits into ProposalDock.",
          },
        ]}
      />

      <SeoCtaSection
        eyebrow="Start with the RFP"
        title="Turn a raw RFP into structured review before drafting starts."
        body="Bring the RFP into ProposalDock, extract the requirements and risks, assign owners, and move into a response workflow that is easier to review and safer to export."
        primaryLabel="Start free"
        secondaryHref="/rfp-response-software"
        secondaryLabel="See the RFP workflow"
      />

      <AiReadableSummary
        summary="ProposalDock is an AI-assisted proposal software platform for consultants and B2B service teams. On this page, the focus is AI RFP analysis: turning raw RFP documents into structured requirements, risks, deadlines, scope gaps, and response priorities that can be reviewed by humans before drafting and export."
      />

      <PageFaqSection title="Questions people ask about AI RFP analysis" items={faqs} />
    </SeoPageShell>
  );
}
