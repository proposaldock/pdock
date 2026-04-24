import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RelatedPagesSection,
  SeoBackLink,
  SeoCtaSection,
  SeoHero,
  SeoPageShell,
  SectionLabel,
} from "@/components/public-seo";
import { buildCanonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Consulting Proposal Software | ProposalDock",
  description:
    "ProposalDock helps consulting and B2B service teams turn client briefs, RFPs, and reusable knowledge into structured, reviewable proposals.",
  alternates: {
    canonical: buildCanonical("/consulting-proposal-software"),
  },
  openGraph: {
    title: "Consulting Proposal Software | ProposalDock",
    description:
      "ProposalDock gives consulting teams a structured proposal workspace for brief intake, risk review, knowledge reuse, human signoff, and export.",
    url: buildCanonical("/consulting-proposal-software"),
  },
};

const breakdownPoints = [
  {
    title: "The brief arrives unstructured",
    body:
      "Important requirements, deadlines, and delivery assumptions are buried inside long emails, RFP documents, and discovery notes.",
  },
  {
    title: "Risk shows up late",
    body:
      "Teams often discover scope gaps, staffing pressure, or awkward assumptions after proposal language is already in circulation.",
  },
  {
    title: "Reusable knowledge is hard to trust",
    body:
      "Past decks, case studies, and delivery language exist, but they are scattered and not clearly approved for the new response.",
  },
] as const;

const workflowSteps = [
  "Dock the client brief or RFP into one proposal workspace.",
  "Extract requirements, deadlines, missing information, and proof gaps.",
  "Review scope, delivery, compliance, and commercial risks before drafting.",
  "Attach approved knowledge so the team drafts from material it can stand behind.",
  "Run human review and signoff before DOCX or export-ready output goes out.",
] as const;

const audience = [
  "Boutique consulting firms handling multiple client proposals at once",
  "Advisory teams that need better visibility into scope and assumptions",
  "B2B service teams that want proposal automation without losing judgment",
  "Delivery leaders who want proposal review before commitments get exported",
] as const;

const comparisonRows = [
  {
    manual: "Read the brief and highlight requirements by hand",
    structured: "Create a structured requirements and risk view before drafting",
  },
  {
    manual: "Search old folders for language that might still be usable",
    structured: "Reuse approved knowledge directly inside the workspace",
  },
  {
    manual: "Review only the final copy",
    structured: "Review assumptions, evidence, and risks earlier in the workflow",
  },
  {
    manual: "Export after a fast final skim",
    structured: "Export after visible human review and signoff",
  },
] as const;

export default function ConsultingProposalSoftwarePage() {
  return (
    <SeoPageShell>
      <SeoBackLink />

      <SeoHero
        eyebrow="Consulting proposal software"
        title="Consulting Proposal Software for Structured Client Work"
        intro="ProposalDock is not just proposal writing software. It is a structured proposal workspace for consulting teams that need to review briefs, identify risk, reuse approved knowledge, and export a clean response."
        detail="The workflow is designed around the real work before a proposal becomes client-ready: brief intake, requirement extraction, risk review, knowledge reuse, human review, signoff, and export."
        badges={["Brief and RFP intake", "Risk review", "Approved knowledge reuse"]}
        sideTitle="What consulting teams need before drafting"
        sideItems={[
          "A cleaner read on what the client is actually asking for",
          "Visibility into scope, timeline, and delivery risk",
          "Reusable knowledge that is easier to trust",
          "A review-ready path from intake to export",
        ]}
      />

      <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
        <SectionLabel>Why proposals break down</SectionLabel>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
          Consulting proposals usually fail in the messy middle, not the final export.
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {breakdownPoints.map((item) => (
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
        <SectionLabel>From intake to proposal</SectionLabel>
        <h2 className="mt-3 text-3xl font-black tracking-tight">
          From client brief to review-ready proposal
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {workflowSteps.map((step) => (
            <div key={step} className="rounded-lg border border-white/15 bg-white/8 p-4">
              <p className="text-sm leading-7 text-zinc-200">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>Built for consultants, delivery teams, and B2B service firms</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {audience.map((item) => (
              <p key={item} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
                {item}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>Manual proposal process vs ProposalDock</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {comparisonRows.map((row) => (
              <div
                key={row.manual}
                className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-2"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Manual process
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">{row.manual}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    ProposalDock
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">{row.structured}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <RelatedPagesSection
        title="Related workflows for consulting teams"
        pages={[
          {
            href: "/proposal-software-for-consultants",
            title: "Proposal software for consultants",
            body: "The consultant pillar page covering the full ProposalDock workflow for small service teams.",
          },
          {
            href: "/proposal-system-for-consultants",
            title: "Proposal system for consultants",
            body: "A guide to turning proposal work into a repeatable operating system instead of a scramble.",
          },
          {
            href: "/proposal-workflow-software",
            title: "Proposal workflow software",
            body: "See how brief intake, review, drafting, and export fit together in one workflow.",
          },
          {
            href: "/client-brief-analysis",
            title: "Client brief analysis",
            body: "Understand how ProposalDock extracts requirements, risks, deadlines, and missing information from a brief.",
          },
          {
            href: "/proposal-risk-review",
            title: "Proposal risk review",
            body: "Review scope, delivery, compliance, and commercial risk before the proposal is approved and sent.",
          },
        ]}
      />

      <SeoCtaSection
        eyebrow="Start the workflow"
        title="Use ProposalDock to turn client briefs and RFPs into structured proposal work."
        body="Upload a brief, attach approved knowledge, review the requirements and risks, and move into a review-ready proposal draft without losing track of what the team still needs to verify."
        primaryLabel="Start free"
        secondaryHref="/contact?intent=contact_sales&plan=team"
        secondaryLabel="Talk to us"
      />

      <p className="mt-6 text-sm leading-6 text-zinc-600">
        If you want the consultant overview first, start with{" "}
        <Link
          href="/proposal-software-for-consultants"
          className="font-semibold text-emerald-700 hover:text-emerald-800"
        >
          proposal software for consultants
        </Link>
        .
      </p>
    </SeoPageShell>
  );
}
