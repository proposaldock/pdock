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
  title: "RFP Compliance Matrix Software | ProposalDock",
  description:
    "Create a structured RFP compliance matrix to track requirements, evidence, ownership, gaps, and response status.",
  alternates: {
    canonical: buildCanonical("/rfp-compliance-matrix"),
  },
  openGraph: {
    title: "RFP Compliance Matrix Software | ProposalDock",
    description:
      "ProposalDock helps response teams organize a compliance matrix from extracted RFP requirements and review signals.",
    url: buildCanonical("/rfp-compliance-matrix"),
  },
};

const matrixRows = [
  {
    requirement: "Onboarding support within 30 days",
    category: "Delivery",
    owner: "Implementation lead",
    evidence: "Delivery playbook",
    risk: "Capacity pressure",
    status: "Needs review",
  },
  {
    requirement: "Dedicated account manager",
    category: "Support",
    owner: "Customer success",
    evidence: "Service model asset",
    risk: "Staffing alignment",
    status: "Covered",
  },
] as const;

export default function RfpComplianceMatrixPage() {
  return (
    <SeoPageShell>
      <SeoBackLink />

      <SeoHero
        eyebrow="RFP compliance matrix"
        title="RFP Compliance Matrix for Response Teams"
        intro="An RFP compliance matrix is a structured way to track what the buyer asked for, who owns the response, what evidence exists, what gaps remain, and what still needs review."
        detail="ProposalDock helps teams create that structure from extracted requirements so compliance tracking is part of the workflow, not an afterthought."
        badges={["Requirement tracking", "Ownership", "Evidence and status"]}
        sideTitle="Why response teams need a compliance matrix"
        sideItems={[
          "To keep mandatory asks visible",
          "To connect each requirement to an owner and evidence",
          "To track gaps and review status before submission",
          "To reduce last-minute compliance surprises",
        ]}
      />

      <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
        <SectionLabel>Example matrix</SectionLabel>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
          Example compliance matrix table
        </h2>
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-lg border border-zinc-200">
            <thead className="bg-zinc-950 text-left text-sm font-semibold text-white">
              <tr>
                <th className="px-4 py-3">Requirement</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Evidence/source</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {matrixRows.map((row) => (
                <tr key={row.requirement} className="text-sm text-zinc-700">
                  <td className="border-t border-zinc-200 px-4 py-3 font-medium">{row.requirement}</td>
                  <td className="border-t border-zinc-200 px-4 py-3">{row.category}</td>
                  <td className="border-t border-zinc-200 px-4 py-3">{row.owner}</td>
                  <td className="border-t border-zinc-200 px-4 py-3">{row.evidence}</td>
                  <td className="border-t border-zinc-200 px-4 py-3">{row.risk}</td>
                  <td className="border-t border-zinc-200 px-4 py-3">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>What is an RFP compliance matrix?</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-7 text-zinc-700">
            <p>
              It is a structured requirement tracker that helps response teams see coverage,
              ownership, proof, risk, and status in one place.
            </p>
            <p>
              That matters because formal buyer requests often contain more obligations than a draft
              alone can keep visible.
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle>How ProposalDock supports matrix creation</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-7 text-zinc-700">
            <p>
              ProposalDock starts with extracted requirements, then supports ownership, risk review,
              approved knowledge reuse, and status tracking that naturally feed into a compliance
              matrix.
            </p>
            <p>
              The result is a more reviewable response process, not just a prettier spreadsheet.
            </p>
          </CardContent>
        </Card>
      </section>

      <RelatedPagesSection
        title="Related pages for requirements, compliance, and review"
        pages={[
          {
            href: "/rfp-response-software",
            title: "RFP response software",
            body: "The main ProposalDock page for response teams and RFP workflows.",
          },
          {
            href: "/rfp-requirements-extraction",
            title: "RFP requirements extraction",
            body: "Start with structured extraction before building a compliance view.",
          },
          {
            href: "/ai-rfp-analysis",
            title: "AI RFP analysis",
            body: "Use AI-assisted analysis to surface the requirements and risks that feed the matrix.",
          },
          {
            href: "/proposal-review-checklist",
            title: "Proposal review checklist",
            body: "Use a practical review checklist alongside your compliance tracking.",
          },
        ]}
      />

      <SeoCtaSection
        eyebrow="Track what matters"
        title="Build a clearer compliance view before the response is finalized."
        body="ProposalDock helps teams track requirements, ownership, evidence, risks, and status in a structure that is easier to review before exporting a client-ready response."
        primaryLabel="Start free"
        secondaryHref="/rfp-response-software"
        secondaryLabel="See the RFP workflow"
      />
    </SeoPageShell>
  );
}
