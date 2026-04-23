import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  LibraryBig,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildCanonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Proposal Software for Consultants | ProposalDock",
  description:
    "Proposal software for consultants who need client brief analysis, reusable expertise, risk review, and stronger proposal drafts without the scramble.",
  alternates: {
    canonical: buildCanonical("/proposal-software-for-consultants"),
  },
  openGraph: {
    title: "Proposal Software for Consultants | ProposalDock",
    description:
      "ProposalDock gives consultants one workspace to analyze client briefs, reuse expertise, review risks, and draft stronger proposals.",
    url: buildCanonical("/proposal-software-for-consultants"),
  },
};

const consultantNeeds = [
  {
    icon: FileSearch,
    title: "Understand the client brief faster",
    body:
      "Turn long client requests into requirements, risks, open questions, and draft direction before you start writing from a blank page.",
  },
  {
    icon: LibraryBig,
    title: "Reuse your best consulting material",
    body:
      "Keep approved delivery approach, case study language, support models, and capability statements ready for the next proposal.",
  },
  {
    icon: ClipboardCheck,
    title: "Keep decisions and review visible",
    body:
      "Track what has been accepted, rejected, or left pending so the response does not depend on scattered notes and memory.",
  },
  {
    icon: ShieldCheck,
    title: "Send proposals with more confidence",
    body:
      "Move from client intake to grounded draft content with clearer evidence, fewer assumptions, and a cleaner final export path.",
  },
] as const;

const fits = [
  "Independent consultants responding to complex client requests",
  "Boutique consulting teams that need reusable proposal knowledge",
  "Fractional operators and advisors who write proposals regularly",
  "Consulting leads who need faster first-pass analysis before client follow-up",
] as const;

const consultantFaqs = [
  {
    question: "What is proposal software for consultants?",
    answer:
      "Proposal software for consultants helps turn client briefs, RFPs, discovery notes, and approved expertise into a more structured proposal workflow. ProposalDock focuses on brief analysis, reusable knowledge, review decisions, draft sections, and export-ready proposal material.",
  },
  {
    question: "Can solo consultants use ProposalDock?",
    answer:
      "Yes. Solo consultants can use ProposalDock to analyze one client request, reuse their own background material or case study language, draft a stronger response, and keep risks or open questions visible before sending a proposal.",
  },
  {
    question: "How does ProposalDock help boutique consulting firms?",
    answer:
      "Boutique consulting firms can use ProposalDock to keep proposal work in one workspace instead of spreading requirements, reusable expertise, review notes, and final proposal sections across old documents, chat threads, and memory.",
  },
  {
    question: "How is ProposalDock different from a generic AI proposal generator?",
    answer:
      "ProposalDock is built around a proposal workflow rather than one prompt. It helps consultants analyze the brief, spot risks, reuse approved knowledge, review evidence, manage proposal sections, and export a response pack after human review.",
  },
  {
    question: "Does ProposalDock replace consultant judgment?",
    answer:
      "No. AI helps with analysis, structure, risk spotting, and first-pass drafting. The consultant still reviews the output, edits the positioning, approves what is safe to use, and decides what should go to the client.",
  },
] as const;

const consultantBeforeAfter = [
  {
    before: "Starting every proposal from a blank document",
    after: "Starting from analyzed requirements and reusable expertise",
  },
  {
    before: "Digging through old decks for language you trust",
    after: "Attaching approved knowledge directly to the workspace",
  },
  {
    before: "Trying to remember what still needs follow-up",
    after: "Seeing risks, pending items, and review decisions in one place",
  },
] as const;

const consultantUseCases = [
  {
    title: "RFP response for consulting teams",
    body:
      "Break an RFP into requirements, risks, clarification questions, proof gaps, and draft sections before the team starts writing.",
  },
  {
    title: "Client brief review",
    body:
      "Turn a messy client request into a clearer view of what the buyer wants, what is missing, and what needs follow-up before proposal work goes too far.",
  },
  {
    title: "Scope, assumptions, and delivery risk",
    body:
      "Keep assumptions, delivery risks, and open questions visible so the proposal does not quietly promise work the team has not reviewed.",
  },
  {
    title: "Evidence-backed proposal drafting",
    body:
      "Use approved consulting knowledge, case references, and source-linked analysis to draft from stronger material instead of generic AI output.",
  },
] as const;

const comparisonPoints = [
  {
    title: "Compared with generic AI writers",
    body:
      "ProposalDock is structured around requirements, risks, sources, knowledge assets, human review, section ownership, and export readiness instead of a blank chat box.",
  },
  {
    title: "Compared with heavy enterprise proposal tools",
    body:
      "ProposalDock is lighter-weight for consultants and small service teams that need a focused proposal workspace without a long implementation project.",
  },
  {
    title: "Compared with old proposal folders",
    body:
      "ProposalDock keeps the brief, analysis, reusable expertise, review notes, proposal sections, and evidence in one working context.",
  },
] as const;

export default function ProposalSoftwareForConsultantsPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: consultantFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#f4f6f7] px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-950"
        >
          <ArrowLeft className="size-4" />
          Back to ProposalDock
        </Link>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Proposal software for consultants
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Proposal software for consultants who want better briefs, stronger drafts, and less weekend scramble.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-700">
              Consultants often have the expertise, but the proposal process still burns time:
              reading the brief, extracting requirements, finding reusable language, checking risks,
              and shaping a response that feels specific to the client.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-700">
              ProposalDock gives that work one proposal workspace for consultants, so you can
              analyze the request, attach approved knowledge, review what matters, and move into
              proposal drafting with more structure and less last-minute scrambling.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="green">Client brief analysis</Badge>
              <Badge tone="teal">Reusable expertise</Badge>
              <Badge tone="yellow">Proposal drafts</Badge>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
              <Link
                href="/proposal-system-for-consultants"
                className="text-emerald-700 hover:text-emerald-800"
              >
                Proposal system guide
              </Link>
              <Link
                href="/proposal-workflow-software"
                className="text-emerald-700 hover:text-emerald-800"
              >
                Proposal workflow guide
              </Link>
            </div>
          </div>

          <Card className="border-zinc-200">
            <CardHeader>
              <h2 className="text-lg font-semibold text-zinc-950">
                When consultants feel the pain most
              </h2>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                "The brief is important, but messy.",
                "The client expects a specific response, not a generic pitch.",
                "You know you have good past material, but it is scattered.",
                "You need to move quickly without sounding careless.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-zinc-700">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Consulting proposal use cases
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
            How consultants use ProposalDock before the proposal becomes a final document.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-700">
            Proposal software for consultants should help before the writing stage gets expensive.
            ProposalDock is designed to support the messy middle: reading the brief, deciding what
            deserves caution, finding proof, and turning reviewed material into a client-ready
            response.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {consultantUseCases.map((item) => (
              <div key={item.title} className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
                <h3 className="font-semibold text-zinc-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight text-zinc-950">
              A cleaner way to manage consulting proposals
            </h2>
            <p className="mt-4 text-base leading-8 text-zinc-700">
              ProposalDock is built for consultants who want AI help without losing the voice,
              nuance, and judgment that make consulting proposals work. It helps with the heavy
              lifting around analysis and structure, while leaving positioning and final judgment
              with you.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {consultantNeeds.map((item) => (
              <Card key={item.title} className="border-zinc-200 bg-white">
                <CardHeader>
                  <item.icon className="size-7 text-emerald-600" />
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-zinc-600">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Why not just use a generic AI writer?
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
            Consultants need proposal judgment, not just faster text.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {comparisonPoints.map((item) => (
              <div key={item.title} className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
                <h3 className="font-semibold text-zinc-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-zinc-200 bg-zinc-950 text-white">
            <CardHeader>
              <CardTitle>Best fit for consultants</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {fits.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-zinc-200">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-300" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-white">
            <CardHeader>
              <CardTitle>From old proposal habits to a cleaner process</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {consultantBeforeAfter.map((item) => (
                <div key={item.before} className="grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-2">
                  <p className="text-sm leading-6 text-zinc-500">{item.before}</p>
                  <p className="text-sm font-semibold leading-6 text-zinc-900">{item.after}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Start with one client request
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
            Use ProposalDock when a brief is important enough to deserve a real workflow.
          </h2>
          <div className="mt-5 grid gap-4 text-sm leading-7 text-zinc-700">
            <p>
              A strong consulting proposal needs more than a quick draft. It needs a clear read of
              the client&apos;s requirements, a view of risks and assumptions, and reusable material
              that still feels specific to the opportunity.
            </p>
            <p>
              ProposalDock helps you get to that point faster, while keeping human review and final
              judgment exactly where they belong.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register?plan=free">
              <Button variant="accent" size="lg">
                Start free
              </Button>
            </Link>
            <Link
              href="/contact?intent=contact_sales&plan=team"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-zinc-950 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
            >
              Talk to us
            </Link>
          </div>
          <p className="mt-5 text-sm leading-6 text-zinc-600">
            Want the operating model first? Read the guide to building a{" "}
            <Link
              href="/proposal-system-for-consultants"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              proposal system for consultants
            </Link>
            .
          </p>
        </section>

        <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Consultant FAQ
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
            Questions consultants ask before trying proposal software
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {consultantFaqs.map((item) => (
              <div key={item.question} className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
                <h3 className="font-semibold text-zinc-950">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
