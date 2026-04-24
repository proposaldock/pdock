import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
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
  title: "Proposal Workflow Software for Client Briefs | ProposalDock",
  description:
    "Proposal workflow software for teams handling client briefs and RFPs with intake, analysis, knowledge reuse, review, drafting, and export in one workspace.",
  alternates: {
    canonical: buildCanonical("/proposal-workflow-software"),
  },
  openGraph: {
    title: "Proposal Workflow Software for Client Briefs | ProposalDock",
    description:
      "ProposalDock helps teams manage client brief intake, analysis, knowledge reuse, review, drafting, and export in one proposal workflow.",
    url: buildCanonical("/proposal-workflow-software"),
  },
};

const workflowPieces = [
  {
    icon: FileSearch,
    title: "Brief intake",
    body:
      "Start with the client request, pasted brief, or RFP and keep the source material attached to the workspace from the beginning.",
  },
  {
    icon: Layers3,
    title: "Structured analysis",
    body:
      "Turn the brief into requirements, risks, open questions, and draft direction before the team spends hours writing.",
  },
  {
    icon: LibraryBig,
    title: "Knowledge reuse",
    body:
      "Attach approved delivery language, case studies, support models, and capability notes so draft work starts from stronger material.",
  },
  {
    icon: ClipboardCheck,
    title: "Review and signoff",
    body:
      "Accept, reject, comment, and refine inside the same proposal workflow instead of losing decisions across docs and chat.",
  },
] as const;

const workflowOutcomes = [
  "One place for brief material, analysis, risks, notes, and draft work",
  "Less context switching between documents, chat, and AI prompts",
  "Clearer ownership before proposal sections are finalized",
  "A more reliable handoff from intake to export",
] as const;

const operatingRhythm = [
  {
    phase: "Intake",
    detail: "Capture the client request, add context, and keep source files tied to the workspace.",
  },
  {
    phase: "Triage",
    detail: "Review requirements, risks, missing evidence, and open questions before writing starts.",
  },
  {
    phase: "Build",
    detail: "Use approved knowledge and AI-assisted draft support to shape response sections.",
  },
  {
    phase: "Ship",
    detail: "Finalize decisions, confirm ownership, and export the proposal pack when the team is ready.",
  },
] as const;

export default function ProposalWorkflowSoftwarePage() {
  return (
    <main className="min-h-screen bg-[#f4f6f7] px-6 py-16">
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
              Proposal workflow software
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Proposal workflow software for teams moving from client brief to proposal export.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-700">
              Proposal work usually breaks across too many places: the RFP in one folder, notes in
              another, AI prompts somewhere else, review comments in chat, and final copy in a doc.
              ProposalDock brings that work into one structured proposal workflow.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-700">
              Teams can analyze the brief, reuse approved company knowledge, review requirements
              and risks, draft response sections, and export a cleaner proposal pack without losing
              context along the way.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="green">Brief intake</Badge>
              <Badge tone="teal">Review workflow</Badge>
              <Badge tone="yellow">Proposal export</Badge>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
              <Link
                href="/proposal-software-for-consultants"
                className="text-emerald-700 hover:text-emerald-800"
              >
                Consultant software guide
              </Link>
              <Link
                href="/proposal-system-for-consultants"
                className="text-emerald-700 hover:text-emerald-800"
              >
                Proposal system guide
              </Link>
            </div>
          </div>

          <Card className="border-zinc-200">
            <CardHeader>
              <h2 className="text-lg font-semibold text-zinc-950">
                The operating rhythm ProposalDock supports
              </h2>
            </CardHeader>
            <CardContent className="grid gap-3">
              {operatingRhythm.map((item) => (
                <div key={item.phase} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="font-semibold text-zinc-950">{item.phase}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{item.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-12 rounded-lg border border-zinc-200 bg-zinc-950 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Operational clarity
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">
            The workflow matters because proposal work changes hands.
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-300">
            A proposal may start with sales, move through a consultant or SME, touch delivery,
            involve leadership review, and end in a polished client-facing document. ProposalDock
            gives those handoffs a clearer place to happen.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {workflowOutcomes.map((item) => (
              <div key={item} className="rounded-lg border border-white/15 bg-white/8 p-4">
                <p className="text-sm leading-6 text-zinc-100">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight text-zinc-950">
              The core proposal workflow inside ProposalDock
            </h2>
            <p className="mt-4 text-base leading-8 text-zinc-700">
              ProposalDock is built around the sequence teams already follow, but makes each step
              easier to see, review, and reuse. AI helps accelerate the busywork, while the team
              stays responsible for decisions and final output.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {workflowPieces.map((item) => (
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
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-6 text-emerald-600" />
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Why it matters
            </p>
          </div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
            A stronger workflow helps proposal teams move faster without lowering the bar.
          </h2>
          <div className="mt-5 grid gap-4 text-sm leading-7 text-zinc-700">
            <p>
              Speed is useful only if the response still feels accurate, specific, and reviewable.
              ProposalDock is built so that AI assistance sits inside a workflow with sources,
              knowledge, review decisions, and ownership.
            </p>
            <p>
              That makes it easier to understand what the client asked for, what the team can
              support, and what still needs attention before the proposal goes out.
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
        </section>

        <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Related workflow pages
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
            Explore the review steps around the workflow
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[
              {
                href: "/client-brief-analysis",
                title: "Client brief analysis",
                body: "Start the workflow with structured intake, extracted requirements, and clarification questions.",
              },
              {
                href: "/proposal-review-checklist",
                title: "Proposal review checklist",
                body: "Use a practical checklist for requirement coverage, assumptions, risk, approvals, and export readiness.",
              },
              {
                href: "/rfp-compliance-matrix",
                title: "RFP compliance matrix",
                body: "Track requirement coverage, evidence, ownership, gaps, and review status in one structured view.",
              },
              {
                href: "/bid-no-bid-analysis",
                title: "Bid/no-bid analysis",
                body: "See how early fit and risk review should shape whether the team pursues the opportunity at all.",
              },
            ].map((item) => (
              <Card key={item.href} className="border-zinc-200 bg-zinc-50">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <p className="text-sm leading-6 text-zinc-600">{item.body}</p>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Read more
                    <ArrowLeft className="size-4 rotate-180" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
