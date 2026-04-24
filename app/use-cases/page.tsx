import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeoBackLink, SeoPageShell } from "@/components/public-seo";
import { buildCanonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "ProposalDock Use Cases | AI Proposal and RFP Workflows",
  description:
    "Explore ProposalDock use cases for consultants, RFP response teams, proposal review, and AI-assisted proposal workflows.",
  alternates: {
    canonical: buildCanonical("/use-cases"),
  },
  openGraph: {
    title: "ProposalDock Use Cases | AI Proposal and RFP Workflows",
    description:
      "A grouped index of ProposalDock workflows for consultants, RFP response teams, proposal review, and AI-assisted proposal work.",
    url: buildCanonical("/use-cases"),
  },
};

const groups = [
  {
    title: "For consultants",
    links: [
      ["/proposal-software-for-consultants", "Proposal software for consultants"],
      ["/consulting-proposal-software", "Consulting proposal software"],
      ["/client-brief-analysis", "Client brief analysis"],
      ["/proposal-automation-for-consultants", "Proposal automation for consultants"],
    ],
  },
  {
    title: "For RFP response teams",
    links: [
      ["/rfp-response-software", "RFP response software"],
      ["/ai-rfp-analysis", "AI RFP analysis"],
      ["/rfp-requirements-extraction", "RFP requirements extraction"],
      ["/rfp-risk-assessment", "RFP risk assessment"],
      ["/bid-no-bid-analysis", "Bid/no-bid analysis"],
      ["/rfp-compliance-matrix", "RFP compliance matrix"],
    ],
  },
  {
    title: "For proposal review",
    links: [
      ["/proposal-risk-review", "Proposal risk review"],
      ["/proposal-review-checklist", "Proposal review checklist"],
      ["/proposal-workflow-software", "Proposal workflow software"],
    ],
  },
  {
    title: "For AI-assisted proposal workflows",
    links: [
      ["/ai-proposal-software", "AI proposal software"],
      ["/client-brief-analysis", "Client brief analysis"],
      ["/ai-rfp-analysis", "AI RFP analysis"],
      ["/proposal-workflow-software", "Proposal workflow software"],
    ],
  },
] as const;

export default function UseCasesPage() {
  return (
    <SeoPageShell>
      <SeoBackLink />

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Use cases
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
          ProposalDock Use Cases
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-8 text-zinc-700">
          ProposalDock helps consultants and B2B service teams turn client briefs and RFPs into
          structured, reviewable proposal work. This page groups the main workflows so users and
          crawlers can understand where each page fits.
        </p>
      </section>

      <section className="mt-12 grid gap-5 md:grid-cols-2">
        {groups.map((group) => (
          <Card key={group.title} className="border-zinc-200 bg-white">
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {group.links.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:border-emerald-200 hover:text-emerald-800"
                >
                  <span>{label}</span>
                  <ArrowRight className="size-4" />
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>
    </SeoPageShell>
  );
}
