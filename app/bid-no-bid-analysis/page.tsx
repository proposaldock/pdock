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
  title: "Bid/No-Bid Analysis Software | ProposalDock",
  description:
    "Use structured bid/no-bid analysis to evaluate RFP fit, delivery risk, requirements, deadlines, and response effort before pursuing an opportunity.",
  alternates: {
    canonical: buildCanonical("/bid-no-bid-analysis"),
  },
  openGraph: {
    title: "Bid/No-Bid Analysis Software | ProposalDock",
    description:
      "ProposalDock helps teams evaluate whether an RFP is worth pursuing before proposal effort accelerates.",
    url: buildCanonical("/bid-no-bid-analysis"),
  },
};

const criteria = [
  "Strategic fit",
  "Requirement fit",
  "Delivery capacity",
  "Deadline pressure",
  "Risk profile",
  "Commercial value",
] as const;

const scorecardRows = [
  {
    category: "Strategic fit",
    score: "Go",
    note: "Matches the target client profile and core service line.",
  },
  {
    category: "Requirement fit",
    score: "Caution",
    note: "Mostly aligned, but some asks still need clarification.",
  },
  {
    category: "Delivery capacity",
    score: "Caution",
    note: "Current staffing may be tight for the requested timeline.",
  },
  {
    category: "Deadline",
    score: "No-bid risk",
    note: "Response and delivery windows are both compressed.",
  },
  {
    category: "Commercial value",
    score: "Go",
    note: "Worth pursuing if the staffing and scope issues can be managed.",
  },
] as const;

export default function BidNoBidAnalysisPage() {
  return (
    <SeoPageShell>
      <SeoBackLink />

      <SeoHero
        eyebrow="Bid/no-bid analysis"
        title="Bid/No-Bid Analysis for RFP Decisions"
        intro="Bid/no-bid analysis is the moment where a team decides whether an opportunity is worth pursuing, not just whether it looks interesting on paper."
        detail="ProposalDock helps structure that decision around fit, requirements, deadlines, delivery risk, and response effort so the team can decide with more context."
        badges={["Decision support", "Fit and risk", "Response effort"]}
        sideTitle="Key criteria to review"
        sideItems={criteria}
      />

      <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
        <SectionLabel>Scorecard example</SectionLabel>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
          Example bid/no-bid scorecard
        </h2>
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-lg border border-zinc-200">
            <thead className="bg-zinc-950 text-left text-sm font-semibold text-white">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {scorecardRows.map((row) => (
                <tr key={row.category} className="text-sm text-zinc-700">
                  <td className="border-t border-zinc-200 px-4 py-3 font-medium">{row.category}</td>
                  <td className="border-t border-zinc-200 px-4 py-3">{row.score}</td>
                  <td className="border-t border-zinc-200 px-4 py-3 leading-6">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>What is bid/no-bid analysis?</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-7 text-zinc-700">
            <p>
              It is the structured review that helps a team decide whether to pursue an
              opportunity, how aggressively to pursue it, or whether to walk away.
            </p>
            <p>
              The decision usually depends on more than demand. Requirement fit, delivery capacity,
              response effort, and commercial value all matter.
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>How ProposalDock supports the decision</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-7 text-zinc-700">
            <p>
              ProposalDock helps surface the relevant inputs first: extracted requirements, risk
              categories, deadlines, knowledge gaps, and likely review points.
            </p>
            <p>
              That gives the team a more grounded bid/no-bid discussion before drafting work
              accelerates.
            </p>
          </CardContent>
        </Card>
      </section>

      <RelatedPagesSection
        title="Related pages for RFP decisions and workflow"
        pages={[
          {
            href: "/rfp-response-software",
            title: "RFP response software",
            body: "The broader ProposalDock workflow for RFP responses.",
          },
          {
            href: "/rfp-risk-assessment",
            title: "RFP risk assessment",
            body: "Review hidden delivery, compliance, and scope risk before committing.",
          },
          {
            href: "/ai-rfp-analysis",
            title: "AI RFP analysis",
            body: "Start with extracted requirements and deadlines before making the bid call.",
          },
          {
            href: "/proposal-workflow-software",
            title: "Proposal workflow software",
            body: "See how bid decisions fit inside the wider intake-to-export workflow.",
          },
        ]}
      />

      <SeoCtaSection
        eyebrow="Decide with more context"
        title="Use a structured RFP review before deciding whether to bid."
        body="ProposalDock helps teams turn an RFP into a clearer view of fit, risk, deadlines, and response effort so bid/no-bid analysis feels less like guesswork."
        primaryLabel="Start free"
        secondaryHref="/rfp-risk-assessment"
        secondaryLabel="Review RFP risk"
      />
    </SeoPageShell>
  );
}
