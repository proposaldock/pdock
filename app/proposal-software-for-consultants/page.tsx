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
  title: "Proposal Software for Consultants",
  description:
    "ProposalDock helps consultants analyze client briefs, reuse approved expertise, draft stronger proposals, and keep review work organized in one AI-assisted workspace.",
  alternates: {
    canonical: buildCanonical("/proposal-software-for-consultants"),
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

export default function ProposalSoftwareForConsultantsPage() {
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
              Proposal software for consultants
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              ProposalDock helps consultants turn client briefs into stronger proposal drafts faster.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-700">
              Consultants often have the expertise, but the proposal process still burns time:
              reading the brief, extracting requirements, finding reusable language, checking risks,
              and shaping a response that feels specific to the client.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-700">
              ProposalDock gives that work one AI-assisted workspace, so you can analyze the request,
              attach approved knowledge, review what matters, and move into proposal drafting with
              more structure.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="green">Client brief analysis</Badge>
              <Badge tone="teal">Reusable expertise</Badge>
              <Badge tone="yellow">Proposal drafts</Badge>
            </div>
          </div>

          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle>Best fit for consultants</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {fits.map((item) => (
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
              A cleaner way to manage consulting proposals
            </h2>
            <p className="mt-4 text-base leading-8 text-zinc-700">
              ProposalDock is built for consultants who want AI help without losing control of the
              work. The product keeps analysis, knowledge, review, draft content, and export inside
              one flow instead of spreading the proposal across documents, chat, and ad hoc prompts.
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
