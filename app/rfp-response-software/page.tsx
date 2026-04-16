import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, ClipboardCheck, FileSearch, LibraryBig, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildCanonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "RFP Response Software for Service Teams",
  description:
    "ProposalDock is RFP response software for service teams that need structured brief analysis, risk review, reusable knowledge, and a cleaner path to proposal draft and export.",
  alternates: {
    canonical: buildCanonical("/rfp-response-software"),
  },
};

const sections = [
  {
    icon: FileSearch,
    title: "Read the RFP faster",
    body:
      "ProposalDock helps teams break down large RFPs into requirements, risks, and follow-up items without relying on scattered notes and memory.",
  },
  {
    icon: LibraryBig,
    title: "Reuse what the team already knows",
    body:
      "Approved case studies, delivery language, support terms, and capability notes can be attached to the workspace so each response starts from stronger footing.",
  },
  {
    icon: ClipboardCheck,
    title: "Review what matters before the rush",
    body:
      "Instead of reviewing only the final copy, teams can review the requirement list, risk flags, evidence, and draft direction earlier in the process.",
  },
  {
    icon: ShieldCheck,
    title: "Export with fewer surprises",
    body:
      "ProposalDock helps teams move toward proposal export with clearer ownership, fewer hidden assumptions, and better visibility into what has been accepted or left pending.",
  },
] as const;

const benefits = [
  "A structured workspace for each RFP response",
  "Risk visibility before final drafting",
  "Reusable company knowledge across bids and briefs",
  "AI assistance without losing review control",
] as const;

export default function RfpResponseSoftwarePage() {
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
              RFP response software
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              ProposalDock gives teams a clearer system for responding to RFPs and client briefs.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-700">
              ProposalDock is RFP response software built for consultants, agencies, and B2B
              service teams that want a more reliable way to go from intake to proposal draft
              without losing context, evidence, or review control.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-700">
              Instead of juggling briefs, notes, draft language, and approvals across separate
              tools, teams can work from one proposal workspace with analysis, review, knowledge,
              drafting, and export in the same flow.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="green">RFP analysis</Badge>
              <Badge tone="teal">Review workflow</Badge>
              <Badge tone="yellow">Proposal export</Badge>
            </div>
          </div>

          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle>Why teams look for RFP response software</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {benefits.map((item) => (
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
              What ProposalDock adds to the RFP process
            </h2>
            <p className="mt-4 text-base leading-8 text-zinc-700">
              Good RFP response software does more than store files. It helps a team understand the
              brief, coordinate the response, reuse trusted material, and keep decisions visible as
              the proposal takes shape. That is the job ProposalDock is built for.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {sections.map((item) => (
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
            Built for real response work
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
            ProposalDock helps teams respond to RFPs with more structure and less last-minute chaos.
          </h2>
          <div className="mt-5 grid gap-4 text-sm leading-7 text-zinc-700">
            <p>
              If your current process depends on too many documents, too much manual sorting, and
              too much context living in people&apos;s heads, ProposalDock gives the team a cleaner
              operating layer for the response.
            </p>
            <p>
              The result is not just faster drafting. It is better visibility into what the client
              asked for, what the team can support, what still needs review, and what is ready to
              go out the door.
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
