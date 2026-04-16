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

const bestFor = [
  "Consultants who respond to frequent client briefs",
  "Agencies that need a cleaner proposal process",
  "Bid leads who want faster first-pass analysis",
  "B2B service teams that want AI help without losing control",
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

          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle>What teams usually want from AI proposal software</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {bestFor.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-zinc-700">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight text-zinc-950">
              What ProposalDock actually does
            </h2>
            <p className="mt-4 text-base leading-8 text-zinc-700">
              Many teams try to use generic AI tools for proposal work, then end up rebuilding
              structure, evidence, and review steps around them. ProposalDock gives that work a
              home: one workspace for the brief, requirements, risks, knowledge, draft sections,
              approvals, and exports.
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
