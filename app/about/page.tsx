import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  LibraryBig,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildCanonical, getOrganizationJsonLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "About ProposalDock | AI Proposal Software",
  description:
    "Learn how ProposalDock works as AI proposal software for RFP responses, how it accelerates proposal work, and how teams stay in control of review, signoff, and final export.",
  alternates: {
    canonical: buildCanonical("/about"),
  },
  openGraph: {
    title: "About ProposalDock | AI Proposal Software",
    description:
      "Learn how ProposalDock works as AI proposal software for RFP responses, how it accelerates proposal work, and how teams stay in control.",
    url: buildCanonical("/about"),
  },
};

const offeringAreas = [
  {
    icon: FileSearch,
    title: "Brief analysis that becomes usable work",
    body:
      "ProposalDock turns long RFPs and client briefs into a structured workspace with requirements, risks, open questions, draft strategy, and traceable source refs.",
  },
  {
    icon: LibraryBig,
    title: "Reusable company knowledge",
    body:
      "Teams can keep approved case studies, support language, delivery approach, and capability statements in one place, then attach them to live workspaces when they are relevant.",
  },
  {
    icon: ClipboardCheck,
    title: "Review and signoff in one flow",
    body:
      "Instead of losing review notes across docs, chat, and email, ProposalDock keeps review decisions, comments, approvals, ownership, and follow-up dates inside the proposal workspace.",
  },
  {
    icon: ShieldCheck,
    title: "Export with more confidence",
    body:
      "ProposalDock helps teams move into proposal drafting and export with better grounding, clearer evidence, and fewer last-minute assumptions.",
  },
] as const;

const aiWorkflow = [
  {
    title: "AI reads the incoming material",
    body:
      "When a team uploads a brief, pastes text, or adds company knowledge, ProposalDock uses AI to identify what the client is asking for, where the risks are, and which sections need human follow-up.",
  },
  {
    title: "AI suggests, but does not silently decide",
    body:
      "The system produces requirement lists, coverage signals, risk notes, draft summaries, and proposal section suggestions, but those outputs stay inside a reviewable workflow rather than being treated as finished truth.",
  },
  {
    title: "AI stays tied to source material",
    body:
      "ProposalDock is designed to keep draft output grounded in uploaded material and approved knowledge assets, so the team can see where ideas came from before they become client-facing language.",
  },
  {
    title: "Humans still control the final response",
    body:
      "People review the analysis, accept or reject requirements, rewrite sections, sign off on final copy, assign ownership, and decide what gets exported. AI accelerates the work; it does not replace proposal judgment.",
  },
] as const;

const teamFit = [
  "Consultants and boutique agencies responding to frequent client briefs",
  "Bid leads who need cleaner first-pass analysis before stakeholder review",
  "Delivery teams that want shared proposal workspaces instead of scattered files",
  "Operators who want AI help without giving up control of the final response",
] as const;

const outcomes = [
  "Less time lost copying text between tools",
  "Faster first-pass understanding of what the client actually needs",
  "More consistent use of approved company material",
  "A review flow that is easier to follow and easier to trust",
  "Cleaner handoff from intake to proposal draft to export",
] as const;

export default function AboutPage() {
  const organizationJsonLd = getOrganizationJsonLd();

  return (
    <main className="min-h-screen bg-[#f4f6f7] px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              About ProposalDock
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              ProposalDock is AI proposal software for teams that need a cleaner way to respond to briefs and RFPs.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-700">
              ProposalDock is built for B2B service teams that need a more reliable way to analyze
              client requests, organize response work, reuse approved company knowledge, and move
              into proposal drafting without rebuilding the process from scratch every time.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-700">
              The product is not meant to be a general-purpose chatbot. It is a proposal workflow:
              intake, analysis, review, drafting, signoff, and export, all inside one structured
              workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="green">Grounded analysis</Badge>
              <Badge tone="teal">Reusable knowledge</Badge>
              <Badge tone="yellow">Human signoff</Badge>
            </div>
          </div>

          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle>What teams usually get from ProposalDock</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {outcomes.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-zinc-700">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <section className="mt-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              What ProposalDock offers
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
              A proposal operating system instead of a pile of disconnected steps.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {offeringAreas.map((item) => (
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

        <section className="mt-12 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-zinc-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bot className="size-6 text-emerald-600" />
                <CardTitle>How ProposalDock uses AI</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              {aiWorkflow.map((item, index) => (
                <div
                  key={item.title}
                  className="border-t border-zinc-200 pt-5 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-center gap-3">
                    <Badge tone="teal">0{index + 1}</Badge>
                    <p className="font-semibold text-zinc-950">{item.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-zinc-600">{item.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-zinc-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="size-6 text-emerald-600" />
                <CardTitle>Best fit</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              {teamFit.map((item) => (
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
            The practical promise
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
            ProposalDock uses AI to compress the busywork, not to hide the work.
          </h2>
          <div className="mt-5 grid gap-4 text-sm leading-7 text-zinc-700">
            <p>
              The goal is not to auto-submit proposals or make teams trust black-box output.
              The goal is to help a team understand the brief faster, draft from stronger
              footing, reuse approved material more consistently, and keep review inside one
              visible workflow.
            </p>
            <p>
              That is why ProposalDock keeps human review, approvals, comments, ownership,
              evidence, and export decisions inside the product. AI helps the team move faster,
              but the team still owns what goes out the door.
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
          <p className="mt-5 text-sm leading-6 text-zinc-600">
            Consultants can also read the focused guide to{" "}
            <Link
              href="/proposal-software-for-consultants"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              proposal software for consultants
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
