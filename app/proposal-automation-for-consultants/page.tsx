import type { Metadata } from "next";
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
  title: "Proposal Automation for Consultants | ProposalDock",
  description:
    "Automate repetitive proposal work while keeping consultants in control of review, judgment, approvals, and final client-ready output.",
  alternates: {
    canonical: buildCanonical("/proposal-automation-for-consultants"),
  },
  openGraph: {
    title: "Proposal Automation for Consultants | ProposalDock",
    description:
      "ProposalDock automates repetitive proposal work for consultants while keeping human review and signoff in the workflow.",
    url: buildCanonical("/proposal-automation-for-consultants"),
  },
};

const shouldAutomate = [
  "Brief and RFP intake",
  "Requirement mapping and first-pass extraction",
  "Draft structure and initial proposal section setup",
  "Finding related approved knowledge",
] as const;

const shouldNotAutomate = [
  "Final positioning and commercial judgment",
  "Risk acceptance without human review",
  "Unsupported claims or promises to the client",
  "Final signoff before export",
] as const;

export default function ProposalAutomationForConsultantsPage() {
  return (
    <SeoPageShell>
      <SeoBackLink />

      <SeoHero
        eyebrow="Proposal automation for consultants"
        title="Proposal Automation for Consultants Without Losing Control"
        intro="Proposal automation should remove repetitive work, not flatten the judgment that makes a consulting proposal credible. ProposalDock is designed around that line."
        detail="The workflow automates intake, structure, requirement mapping, and first-pass drafting, while keeping consultants responsible for risk review, positioning, approvals, and final client-ready output."
        badges={["AI-assisted workflow", "Human judgment", "Review and signoff"]}
        sideTitle="What automation should do"
        sideItems={[
          "Reduce repetitive sorting and summarizing work",
          "Create a structured first pass from a brief or RFP",
          "Surface risk, missing information, and proof gaps",
          "Leave judgment and signoff with the team",
        ]}
      />

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>What proposal automation should automate</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {shouldAutomate.map((item) => (
              <p key={item} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
                {item}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>What it should not automate away</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {shouldNotAutomate.map((item) => (
              <p key={item} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
                {item}
              </p>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
        <SectionLabel>How ProposalDock supports consultants</SectionLabel>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
          Automate intake, structure, requirement mapping, and first drafts.
        </h2>
        <div className="mt-6 grid gap-4 text-sm leading-7 text-zinc-700">
          <p>
            ProposalDock helps consultants move from messy input to a cleaner working surface. The
            platform extracts requirements, surfaces risks, organizes draft sections, and brings
            approved knowledge into context faster.
          </p>
          <p>
            That creates momentum without asking AI to fully own the proposal. Human review,
            approvals, and final signoff stay visible in the workflow.
          </p>
        </div>
      </section>

      <RelatedPagesSection
        title="Related pages for consultant automation and workflow"
        pages={[
          {
            href: "/proposal-software-for-consultants",
            title: "Proposal software for consultants",
            body: "The main consultant pillar page around ProposalDock's structured workflow.",
          },
          {
            href: "/consulting-proposal-software",
            title: "Consulting proposal software",
            body: "A focused page on structured proposal work for consulting and B2B service teams.",
          },
          {
            href: "/proposal-workflow-software",
            title: "Proposal workflow software",
            body: "See how automation fits inside a broader intake-to-export workflow.",
          },
          {
            href: "/ai-proposal-software",
            title: "AI proposal software",
            body: "How ProposalDock uses AI-assisted analysis and drafting without becoming a black box.",
          },
        ]}
      />

      <SeoCtaSection
        eyebrow="Use automation carefully"
        title="Automate the repetitive parts while keeping the proposal under human control."
        body="ProposalDock helps consultants work faster on intake, structure, and draft setup while keeping review, judgment, and signoff visible all the way to export."
        primaryLabel="Start free"
        secondaryHref="/consulting-proposal-software"
        secondaryLabel="See the consulting workflow"
      />
    </SeoPageShell>
  );
}
