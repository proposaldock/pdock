import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  Layers3,
  LibraryBig,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildCanonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Proposal System for Consultants | Briefs, Evidence, Reviews, Drafts",
  description:
    "A practical guide to building a proposal system for consultants, including brief intake, evidence, reusable knowledge, review workflows, proposal drafts, and export readiness.",
  alternates: {
    canonical: buildCanonical("/proposal-system-for-consultants"),
  },
  openGraph: {
    title: "Proposal System for Consultants | Briefs, Evidence, Reviews, Drafts",
    description:
      "Learn what a proposal system for consultants should include and how ProposalDock supports evidence-first proposal work.",
    url: buildCanonical("/proposal-system-for-consultants"),
  },
};

const systemParts = [
  {
    icon: FileSearch,
    title: "Brief intake",
    body:
      "A consulting proposal system should keep the client request, RFP, discovery notes, and uploaded source material attached to the work from the start.",
  },
  {
    icon: Layers3,
    title: "Requirement and risk triage",
    body:
      "Before writing starts, the team needs a practical view of requirements, missing information, clarification questions, and delivery or compliance risks.",
  },
  {
    icon: LibraryBig,
    title: "Approved knowledge reuse",
    body:
      "Reusable consulting material should be easy to find, but also reviewable: who owns it, when it was last checked, and where proof lives.",
  },
  {
    icon: ClipboardCheck,
    title: "Human review and signoff",
    body:
      "A useful proposal system makes review decisions visible so accepted content, rejected assumptions, and pending follow-ups do not get lost.",
  },
] as const;

const systemChecklist = [
  "What did the client actually ask for?",
  "Which requirements are high priority or risky?",
  "What proof or case evidence supports the response?",
  "Which assumptions need client clarification?",
  "Who needs to review each proposal section?",
  "What is ready to export and what still needs work?",
] as const;

const comparisonRows = [
  {
    label: "Proposal template",
    detail:
      "Useful for formatting, but it does not analyze the brief, track risks, or show whether claims are supported by evidence.",
  },
  {
    label: "Generic AI writer",
    detail:
      "Useful for fast text, but often weak on source grounding, reusable company knowledge, review decisions, and export readiness.",
  },
  {
    label: "Proposal system",
    detail:
      "Connects intake, requirements, proof, reusable knowledge, human review, drafting, ownership, and final output in one operating flow.",
  },
] as const;

const workflowSteps = [
  {
    title: "Capture the client request",
    body:
      "Start from the real brief, RFP, or discovery notes instead of a blank proposal document.",
  },
  {
    title: "Decide what needs caution",
    body:
      "Review deadline pressure, missing facts, unsupported claims, compliance risk, and questions for the client.",
  },
  {
    title: "Draft from reviewed material",
    body:
      "Use approved knowledge and source-linked analysis as the base for proposal sections.",
  },
  {
    title: "Export only after review",
    body:
      "Check evidence, ownership, status, and signoff before sending proposal material to the client.",
  },
] as const;

const faqs = [
  {
    question: "What is a proposal system for consultants?",
    answer:
      "A proposal system for consultants is the repeatable operating process used to move from client brief or RFP to reviewed proposal output. It usually includes intake, requirement analysis, risk review, reusable knowledge, evidence, section drafting, human approval, and export readiness.",
  },
  {
    question: "How is a proposal system different from proposal software?",
    answer:
      "Proposal software is the tool. A proposal system is the workflow the team follows. The best software supports the system by keeping brief analysis, proof, review, and proposal drafting connected.",
  },
  {
    question: "Why do consultants need more than a proposal template?",
    answer:
      "Templates help with structure, but they do not tell the consultant what the client is asking for, what risks are hidden in the brief, what evidence supports a claim, or what still needs review before submission.",
  },
  {
    question: "Where does AI fit in a consulting proposal system?",
    answer:
      "AI is most useful when it helps analyze the brief, find requirements, identify risks, suggest draft language, and organize source material. The consultant still reviews, edits, approves, and decides what goes to the client.",
  },
] as const;

export default function ProposalSystemForConsultantsPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
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

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Proposal system for consultants
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              A proposal system helps consultants manage briefs, evidence, reviews, and drafts.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-700">
              Consultants rarely lose proposals because they lack writing ability. The harder
              problem is operational: understanding the brief, finding reusable proof, spotting
              risky assumptions, getting review, and turning everything into a client-ready
              response.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-700">
              A proposal system gives that work a repeatable shape. ProposalDock supports that
              system with AI-assisted analysis, approved knowledge, review status, evidence checks,
              and export-ready proposal workspaces.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="green">Brief intake</Badge>
              <Badge tone="teal">Evidence review</Badge>
              <Badge tone="yellow">Proposal drafts</Badge>
            </div>
          </div>

          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle>A consultant proposal system should answer</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {systemChecklist.map((item) => (
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
            Core components
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
            What a good proposal system includes.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-700">
            A system does not need to be heavy. For consultants and small B2B service teams, the
            useful version is usually focused: capture the request, understand the risk, reuse
            trusted material, review the response, and export when the work is ready.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {systemParts.map((item) => (
              <Card key={item.title} className="border-zinc-200 bg-zinc-50">
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

        <section className="mt-12 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-zinc-200 bg-zinc-950 text-white">
            <CardHeader>
              <CardTitle>Template, AI writer, or proposal system?</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {comparisonRows.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/15 bg-white/8 p-4">
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="mt-2 text-sm leading-7 text-zinc-300">{item.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-white">
            <CardHeader>
              <CardTitle>A practical consulting proposal workflow</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {workflowSteps.map((item, index) => (
                <div key={item.title} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-center gap-3">
                    <Badge tone="teal">0{index + 1}</Badge>
                    <p className="font-semibold text-zinc-950">{item.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-zinc-600">{item.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-6 text-emerald-600" />
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              How ProposalDock fits
            </p>
          </div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
            ProposalDock is built as proposal software for consultants who want the system without the sprawl.
          </h2>
          <div className="mt-5 grid gap-4 text-sm leading-7 text-zinc-700">
            <p>
              ProposalDock gives each opportunity a workspace where the team can analyze the brief,
              review risks, attach approved knowledge, assemble proposal sections, track evidence,
              and export response material.
            </p>
            <p>
              The product is intentionally focused: it is not a giant enterprise proposal suite,
              and it is not just a generic AI text generator. It is a structured place for
              evidence-first proposal work.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/proposal-software-for-consultants">
              <Button variant="accent" size="lg">
                Explore proposal software for consultants
              </Button>
            </Link>
            <Link
              href="/register?plan=free"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-zinc-950 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
            >
              Start free
            </Link>
          </div>
        </section>

        <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
            Questions about proposal systems for consultants
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
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
