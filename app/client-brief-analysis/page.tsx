import type { Metadata } from "next";
import Link from "next/link";
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
  title: "Client Brief Analysis Software | ProposalDock",
  description:
    "Analyze client briefs with AI-assisted requirement extraction, risk review, scope clarification, and proposal planning.",
  alternates: {
    canonical: buildCanonical("/client-brief-analysis"),
  },
  openGraph: {
    title: "Client Brief Analysis Software | ProposalDock",
    description:
      "ProposalDock helps teams turn messy client briefs into structured requirements, risks, deadlines, and proposal planning signals.",
    url: buildCanonical("/client-brief-analysis"),
  },
};

const extractionPoints = [
  "Named requirements and deliverables",
  "Deadlines and timing constraints",
  "Likely owners across delivery, project, or commercial teams",
  "Risk flags tied to scope, staffing, and missing information",
  "Clarification questions worth asking before a proposal is finalized",
] as const;

const riskPoints = [
  {
    title: "Missed obligations",
    body: "Important delivery asks get buried in long narrative text and show up late in review.",
  },
  {
    title: "Weak assumptions",
    body: "Teams draft around what they think the client means instead of what the brief actually says.",
  },
  {
    title: "Late clarification",
    body: "Questions that should have been raised early only appear after proposal language is already moving around.",
  },
] as const;

const faqs = [
  {
    question: "What is client brief analysis?",
    answer:
      "Client brief analysis is the process of turning a messy client request into structured requirements, deadlines, risks, owners, and clarification questions. ProposalDock supports that process before the proposal moves too far into drafting.",
  },
  {
    question: "Why does brief analysis matter before proposal drafting?",
    answer:
      "It helps the team understand what the client actually asked for, what is still unclear, and where delivery or scope risk may appear before unsupported language gets into the draft.",
  },
  {
    question: "How does ProposalDock keep humans in control?",
    answer:
      "ProposalDock uses AI-assisted extraction as a first pass, but the team still reviews requirements, checks risks, decides what approved knowledge to reuse, and signs off before export.",
  },
  {
    question: "Can client brief analysis support RFP work too?",
    answer:
      "Yes. The same structured review approach can be applied to formal RFP documents when the team needs clearer requirements and risk extraction before drafting.",
  },
] as const;

export default function ClientBriefAnalysisPage() {
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
        eyebrow="Client brief analysis"
        title="Client Brief Analysis for Better Proposals"
        intro="Client brief analysis is the work of turning a messy client request into something structured enough to review, question, and draft against. ProposalDock helps teams do that before the proposal process becomes expensive."
        detail="Instead of manually scanning long email threads or discovery documents, teams can extract requirements, deadlines, missing information, scope signals, and proposal risks into one review-ready workspace."
        badges={["Requirement extraction", "Scope clarification", "Proposal planning"]}
        sideTitle="What better brief analysis should reveal"
        sideItems={[
          "What the client is explicitly asking for",
          "Where the brief is vague or incomplete",
          "Which deadlines or deliverables create delivery pressure",
          "What the proposal team should clarify before drafting too far",
        ]}
      />

      <section className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>What is client brief analysis?</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-7 text-zinc-700">
            <p>
              It is the step between receiving a client request and writing a response. The goal
              is to turn loose information into structured requirements, ownership, risks, and open
              questions.
            </p>
            <p>
              ProposalDock uses AI-assisted analysis to create that first structured view, then
              keeps human review in the loop so the team can decide what is solid, what needs proof,
              and what still needs clarification.
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>What ProposalDock extracts from a brief</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {extractionPoints.map((item) => (
              <p key={item} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
                {item}
              </p>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
        <SectionLabel>Why this matters</SectionLabel>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
          Why manual brief review creates proposal risk
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {riskPoints.map((item) => (
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

      <section className="mt-12 rounded-lg border border-zinc-200 bg-zinc-950 p-8 text-white">
        <SectionLabel>Example output</SectionLabel>
        <h2 className="mt-3 text-3xl font-black tracking-tight">
          Example brief-to-structured-output block
        </h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-white/15 bg-white/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
              Original brief requirement
            </p>
            <p className="mt-3 text-sm leading-7 text-zinc-100">
              &quot;The supplier must deliver onboarding support within 30 days and provide a
              named project lead.&quot;
            </p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
              Structured output
            </p>
            <div className="mt-3 grid gap-2 text-sm leading-7 text-zinc-100">
              <p>- Requirement: onboarding support</p>
              <p>- Deadline: within 30 days</p>
              <p>- Owner: delivery/project team</p>
              <p>- Risk: resource availability</p>
              <p>- Clarification needed: scope of onboarding support</p>
            </div>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-7 text-zinc-300">
          That kind of structure makes it easier to plan the proposal, ask better follow-up
          questions, and draft from something grounded instead of freeform interpretation.
        </p>
      </section>

      <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
        <SectionLabel>Proposal quality</SectionLabel>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
          How better brief analysis improves proposal quality
        </h2>
        <div className="mt-6 grid gap-4 text-sm leading-7 text-zinc-700">
          <p>
            Better proposal quality usually starts before drafting. When the team understands the
            requirement set, the risks, the missing information, and the likely owners, the draft
            is easier to shape and easier to review.
          </p>
          <p>
            ProposalDock helps create that foundation first, then supports knowledge reuse, human
            signoff, and final export.
          </p>
        </div>
      </section>

      <RelatedPagesSection
        title="Related pages for brief analysis and proposal review"
        pages={[
          {
            href: "/proposal-workflow-software",
            title: "Proposal workflow software",
            body: "See how client brief intake connects to review, drafting, and export.",
          },
          {
            href: "/proposal-software-for-consultants",
            title: "Proposal software for consultants",
            body: "The broader consultant pillar page around structured proposal work.",
          },
          {
            href: "/proposal-risk-review",
            title: "Proposal risk review",
            body: "Review the scope, delivery, and evidence risks that appear during analysis.",
          },
          {
            href: "/ai-proposal-software",
            title: "AI proposal software",
            body: "How AI-assisted analysis and drafting work inside ProposalDock.",
          },
        ]}
      />

      <AiReadableSummary
        summary="ProposalDock is an AI-assisted proposal software platform for consultants and B2B service teams. On this page, the focus is client brief analysis: extracting requirements, deadlines, risks, owners, and clarification questions so proposal work starts from a structured review instead of guesswork."
      />

      <PageFaqSection
        title="Questions people ask about client brief analysis"
        items={faqs}
      />

      <SeoCtaSection
        eyebrow="Try ProposalDock"
        title="Upload a brief and turn it into structured proposal planning."
        body="Start with one client request, extract the requirements and risks, add approved knowledge, and move into a cleaner proposal workflow without losing human judgment."
        primaryLabel="Start free"
        secondaryHref="/proposal-software-for-consultants"
        secondaryLabel="See the consultant workflow"
      />

      <p className="mt-6 text-sm leading-6 text-zinc-600">
        Teams handling more formal opportunities can also see how ProposalDock supports{" "}
        <Link
          href="/rfp-response-software"
          className="font-semibold text-emerald-700 hover:text-emerald-800"
        >
          RFP response work
        </Link>
        .
      </p>
    </SeoPageShell>
  );
}
