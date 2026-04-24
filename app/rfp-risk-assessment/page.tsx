import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RelatedPagesSection,
  SeoBackLink,
  SeoCtaSection,
  SeoHero,
  SeoPageShell,
} from "@/components/public-seo";
import { buildCanonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "RFP Risk Assessment Software | ProposalDock",
  description:
    "Identify delivery, compliance, scope, and commercial risks in RFPs before deciding whether and how to respond.",
  alternates: {
    canonical: buildCanonical("/rfp-risk-assessment"),
  },
  openGraph: {
    title: "RFP Risk Assessment Software | ProposalDock",
    description:
      "ProposalDock helps teams review hidden RFP risk before committing to a response path.",
    url: buildCanonical("/rfp-risk-assessment"),
  },
};

const riskTypes = [
  "Delivery risk from timing, staffing, or onboarding pressure",
  "Compliance risk from missed mandatory asks or weak evidence",
  "Scope risk from ambiguous language or under-defined deliverables",
  "Commercial risk from commitments that do not match the deal shape",
] as const;

export default function RfpRiskAssessmentPage() {
  return (
    <SeoPageShell>
      <SeoBackLink />

      <SeoHero
        eyebrow="RFP risk assessment"
        title="RFP Risk Assessment Before You Commit"
        intro="RFPs often contain hidden obligations, timeline pressure, and awkward fit issues that only become visible after the team has already invested serious response effort."
        detail="ProposalDock helps surface those risks early so teams can review them before they fully commit to the response."
        badges={["Delivery risk", "Compliance risk", "Bid decision support"]}
        sideTitle="Why RFPs contain hidden risk"
        sideItems={[
          "Important asks are spread across multiple sections and attachments",
          "Mandatory requirements can look smaller than they are",
          "Buyers often leave scope or delivery detail open to interpretation",
          "Commercial pressure can push teams into weak-fit responses",
        ]}
      />

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>Risk categories to review</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {riskTypes.map((item) => (
              <p key={item} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-7 text-zinc-700">
                {item}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>How a structured review reduces missed obligations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-7 text-zinc-700">
            <p>
              ProposalDock helps the team extract requirements into a structure that makes risk
              easier to inspect. That is the point where obligations, gaps, and staffing concerns
              become easier to discuss.
            </p>
            <p>
              The same structured review also feeds into bid/no-bid analysis, because a good bid
              decision depends on more than whether the opportunity looks attractive at first glance.
            </p>
          </CardContent>
        </Card>
      </section>

      <RelatedPagesSection
        title="Related pages for RFP risk and bid decisions"
        pages={[
          {
            href: "/rfp-response-software",
            title: "RFP response software",
            body: "The main RFP workflow page for ProposalDock.",
          },
          {
            href: "/ai-rfp-analysis",
            title: "AI RFP analysis",
            body: "Start with AI-assisted extraction before moving into risk assessment.",
          },
          {
            href: "/bid-no-bid-analysis",
            title: "Bid/no-bid analysis",
            body: "Use the structured risk picture to decide whether the opportunity is worth pursuing.",
          },
          {
            href: "/proposal-risk-review",
            title: "Proposal risk review",
            body: "The related proposal-side risk page for teams that work across briefs and RFPs.",
          },
        ]}
      />

      <SeoCtaSection
        eyebrow="Review the risk first"
        title="See the hidden delivery, scope, and compliance risk before the response hardens."
        body="ProposalDock helps teams assess RFP risk early, connect it to ownership and fit, and decide how to respond before too much effort is already sunk."
        primaryLabel="Start free"
        secondaryHref="/bid-no-bid-analysis"
        secondaryLabel="See bid/no-bid analysis"
      />
    </SeoPageShell>
  );
}
