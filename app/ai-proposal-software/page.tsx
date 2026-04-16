import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Bot, CheckCircle2, ClipboardCheck, FileSearch, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildCanonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Proposal Software for B2B Service Teams",
  description:
    "ProposalDock is AI proposal software for B2B service teams that need faster brief analysis, grounded draft support, review workflows, and export-ready proposal packs.",
  alternates: {
    canonical: buildCanonical("/ai-proposal-software"),
  },
  openGraph: {
    title: "AI Proposal Software for B2B Service Teams",
    description:
      "ProposalDock helps teams use AI for proposal analysis, grounded drafting, and review without turning the workflow into a black box.",
    url: buildCanonical("/ai-proposal-software"),
  },
};

const capabilities = [
  {
    icon: FileSearch,
    title: "AI analysis that becomes usable work",
    body:
      "ProposalDock turns client briefs and RFPs into structured requirements, risks, open questions, and source-linked notes that a team can actually review.",
  },
  {
    icon: Bot,
    title: "Draft support without freeform chaos",
    body:
      "Instead of prompting from scratch every time, teams work from one proposal workspace where AI suggestions stay connected to the brief and approved company knowledge.",
  },
  {
    icon: ClipboardCheck,
    title: "Review and signoff stay visible",
    body:
      "Teams can accept or reject requirements, add comments, refine sections, and keep ownership clear before anything becomes client-facing.",
  },
  {
    icon: ShieldCheck,
    title: "Grounded output over guesswork",
    body:
      "The goal is not to replace judgment. It is to help the team move faster while keeping evidence, context, and human review in the loop.",
  },
] as const;

const aiControls = [
  {
    label: "AI helps with",
    items: [
      "reading long briefs faster",
      "turning asks into requirements",
      "spotting risks and missing context",
      "drafting first-pass response language",
    ],
  },
  {
    label: "The team controls",
    items: [
      "what is accepted or rejected",
      "which claims are safe to make",
      "how sections are rewritten",
      "what gets exported or sent",
    ],
  },
] as const;

export default function AiProposalSoftwarePage() {
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
              AI proposal software
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              ProposalDock helps proposal teams use AI without turning the workflow into a black box.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-700">
              ProposalDock is AI proposal software built for B2B service teams that need faster
              brief analysis, clearer review, better reuse of approved company knowledge, and a
              stronger path from intake to proposal-ready draft.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-700">
              The product is designed to compress repetitive proposal work, not to hide important
              decisions. AI helps with analysis and drafting, while people still control review,
              signoff, and final export.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="green">Grounded analysis</Badge>
              <Badge tone="teal">Human review</Badge>
              <Badge tone="yellow">Export-ready drafts</Badge>
            </div>
          </div>

          <Card className="border-zinc-200 bg-zinc-950 text-white">
            <CardHeader>
              <CardTitle>AI should speed up the work, not hide the judgment.</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              {aiControls.map((group) => (
                <div key={group.label}>
                  <p className="text-sm font-semibold text-emerald-300">{group.label}</p>
                  <div className="mt-3 grid gap-2">
                    {group.items.map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm leading-6 text-zinc-200">
                        <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-300" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight text-zinc-950">
              What AI does inside ProposalDock
            </h2>
            <p className="mt-4 text-base leading-8 text-zinc-700">
              Many teams already know that AI can draft text. The harder problem is making that
              help reliable enough for real proposal work. ProposalDock uses AI inside a structured
              workspace, so analysis and draft suggestions can be reviewed, challenged, and refined
              before they become client-facing material.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {capabilities.map((item) => (
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

        <section className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-zinc-200 bg-white">
            <CardHeader>
              <CardTitle>Why generic AI chat is not enough</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm leading-7 text-zinc-700">
              <p>
                Generic AI tools are useful for isolated drafting, but proposal work needs more
                structure than a chat window. Teams need source material, requirements, risks,
                approved knowledge, review decisions, and final export to stay connected.
              </p>
              <p>
                ProposalDock is built around that operating reality. AI becomes part of the proposal
                process instead of a separate place where context is easy to lose.
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-white">
            <CardHeader>
              <CardTitle>What makes the AI safer to use</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                "Outputs stay connected to uploaded brief material and company knowledge.",
                "Requirements and risks can be accepted, rejected, or left pending.",
                "Draft sections are treated as starting points, not final truth.",
                "Human review remains visible before export.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-zinc-700">
                  <ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            The practical difference
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
            AI helps proposal teams move faster when the workflow around it is clear.
          </h2>
          <div className="mt-5 grid gap-4 text-sm leading-7 text-zinc-700">
            <p>
              ProposalDock is built so that AI suggestions stay inside a proposal system with
              structure, evidence, review, and ownership. That matters more than model quality
              alone when real client work is on the line.
            </p>
            <p>
              If your team wants AI proposal software that helps with intake, analysis, drafting,
              and review without asking people to juggle disconnected tools, ProposalDock is built
              for that exact job.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register?plan=free">
              <Button variant="accent" size="lg">
                Start free
              </Button>
            </Link>
            <Link href="/contact?intent=contact_sales&plan=team">
              <Button variant="secondary" size="lg">
                Talk to sales
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
