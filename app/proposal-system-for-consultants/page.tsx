import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildCanonical } from "@/lib/site";

export const metadata: Metadata = {
  title: "Proposal System for Consultants | ProposalDock",
  description:
    "A practical guide to building a proposal system for consultants with brief intake, risk review, evidence, reusable knowledge, drafting, and export.",
  alternates: {
    canonical: buildCanonical("/proposal-system-for-consultants"),
  },
  openGraph: {
    title: "Proposal System for Consultants | ProposalDock",
    description:
      "Learn what a proposal system for consultants should include, from brief intake and risk review to evidence and export.",
    url: buildCanonical("/proposal-system-for-consultants"),
  },
};

const tableOfContents = [
  { href: "#definition", label: "What it means" },
  { href: "#components", label: "Core components" },
  { href: "#comparison", label: "Template vs system" },
  { href: "#playbook", label: "Operating playbook" },
  { href: "#proposaldock", label: "Where ProposalDock fits" },
] as const;

const components = [
  {
    title: "Brief intake",
    body:
      "The system starts by capturing the real client request, RFP, discovery notes, and any deal-specific context in one place.",
  },
  {
    title: "Requirement and risk triage",
    body:
      "The team needs an early read on what matters, what is missing, where the risks are, and what must be clarified before writing goes too far.",
  },
  {
    title: "Evidence and proof",
    body:
      "Claims should connect to source material, approved company knowledge, case references, or a clear proof note.",
  },
  {
    title: "Review decisions",
    body:
      "Accepted content, rejected assumptions, pending answers, ownership, and signoff should be visible before anything becomes client-facing.",
  },
  {
    title: "Proposal assembly",
    body:
      "Reviewed material should turn into useful sections such as executive summary, client context, approach, scope, assumptions, risks, proof, and next steps.",
  },
] as const;

const comparison = [
  {
    label: "Proposal template",
    usefulFor: "Formatting and repeatable document structure.",
    limitation:
      "Does not analyze the brief, expose delivery risk, verify claims, or manage review.",
  },
  {
    label: "Generic AI writer",
    usefulFor: "Producing fast first-pass text.",
    limitation:
      "Often separates writing from source material, reusable knowledge, approvals, and export readiness.",
  },
  {
    label: "Proposal system",
    usefulFor: "Running the full proposal workflow from intake to reviewed output.",
    limitation:
      "Requires the team to be deliberate about evidence, ownership, and final judgment.",
  },
] as const;

const playbook = [
  {
    step: "01",
    title: "Start with the buyer's request",
    body:
      "Keep the brief, RFP, pasted notes, and uploaded documents attached to the opportunity rather than scattered across folders and chat.",
  },
  {
    step: "02",
    title: "Create the decision view before drafting",
    body:
      "Summarize the recommendation, deadline risk, missing information, proof gaps, clarification questions, and delivery or compliance risks.",
  },
  {
    step: "03",
    title: "Reuse only material you trust",
    body:
      "Approved knowledge should carry enough context to show who owns it, when it was reviewed, and how it should be used.",
  },
  {
    step: "04",
    title: "Draft from evidence, then review",
    body:
      "Use AI for structure and first-pass language, but keep human review, source checks, and section ownership in the workflow.",
  },
  {
    step: "05",
    title: "Export when the proposal is ready",
    body:
      "Treat export as a final gate: empty sections, missing citations, unsigned approvals, and stale evidence should be visible first.",
  },
] as const;

const faqs = [
  {
    question: "What is a proposal system for consultants?",
    answer:
      "A proposal system for consultants is the repeatable operating process used to move from client brief or RFP to reviewed proposal output. It usually includes intake, requirement analysis, risk review, reusable knowledge, evidence, section drafting, human approval, and export readiness.",
  },
  {
    question: "How is a proposal system different from proposal software?",
    answer:
      "Proposal software is the tool. A proposal system is the workflow the team follows. The best software supports the system by keeping brief analysis, proof, review, and proposal drafting connected.",
  },
  {
    question: "Why do consultants need more than a proposal template?",
    answer:
      "Templates help with structure, but they do not tell the consultant what the client is asking for, what risks are hidden in the brief, what evidence supports a claim, or what still needs review before submission.",
  },
  {
    question: "Where does AI fit in a consulting proposal system?",
    answer:
      "AI is most useful when it helps analyze the brief, find requirements, identify risks, suggest draft language, and organize source material. The consultant still reviews, edits, approves, and decides what goes to the client.",
  },
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
      {children}
    </p>
  );
}

export default function ProposalSystemForConsultantsPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#f4f6f7] px-6 py-12 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
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

        <header className="mt-10 border-b border-zinc-200 pb-10">
          <div className="flex flex-wrap gap-2">
            <Badge tone="green">Guide</Badge>
            <Badge tone="teal">Consulting proposals</Badge>
            <Badge tone="yellow">Evidence-first workflow</Badge>
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Proposal system for consultants: a practical guide to briefs, evidence, reviews, and drafts.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-700">
            Consultants rarely lose proposal time because they cannot write. The work slows down
            when the brief is messy, proof is scattered, assumptions are unclear, and review happens
            too late. A proposal system gives that work a repeatable operating shape.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-700">
            This guide is for consultants who want a practical proposal system, not just another
            template: clearer intake, earlier risk review, stronger proof, and a better path from
            brief to reviewed draft.
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-5 lg:sticky lg:top-6">
            <p className="text-sm font-semibold text-zinc-950">In this guide</p>
            <nav className="mt-4 grid gap-2">
              {tableOfContents.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-5 border-t border-zinc-200 pt-5">
              <div className="grid gap-3">
                <Link href="/proposal-software-for-consultants">
                  <Button variant="accent" className="w-full">
                    Consultant software guide
                  </Button>
                </Link>
                <Link href="/proposal-workflow-software">
                  <Button variant="secondary" className="w-full">
                    Workflow software guide
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

          <article className="grid gap-12">
            <section id="definition" className="rounded-lg border border-zinc-200 bg-white p-8">
              <SectionLabel>What it means</SectionLabel>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
                A proposal system is the way your team moves from opportunity to reviewed response.
              </h2>
              <div className="mt-5 grid gap-4 text-sm leading-7 text-zinc-700">
                <p>
                  A template gives you a document shape. A generic AI writer gives you text. A
                  proposal system gives you an operating flow: capture the request, understand the
                  risk, find the proof, assign the review, assemble the response, and export when it
                  is ready.
                </p>
                <p>
                  For consultants, this matters because the proposal is often a promise about
                  diagnosis, scope, delivery approach, capability, and trust. The system should help
                  protect that promise from rushed assumptions.
                </p>
              </div>
            </section>

            <section id="components">
              <SectionLabel>Core components</SectionLabel>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
                The useful version is focused, not heavy.
              </h2>
              <div className="mt-6 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
                {components.map((item) => (
                  <div key={item.title} className="grid gap-2 p-6 md:grid-cols-[220px_1fr]">
                    <h3 className="font-semibold text-zinc-950">{item.title}</h3>
                    <p className="text-sm leading-7 text-zinc-600">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="comparison" className="rounded-lg border border-zinc-200 bg-zinc-950 p-8 text-white">
              <SectionLabel>Template vs system</SectionLabel>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                The difference shows up before the proposal is written.
              </h2>
              <div className="mt-7 overflow-hidden rounded-lg border border-white/15">
                <div className="grid grid-cols-[0.75fr_1fr_1fr] border-b border-white/15 bg-white/10 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">
                  <div className="p-4">Option</div>
                  <div className="p-4">Useful for</div>
                  <div className="p-4">Limitation</div>
                </div>
                {comparison.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-1 border-b border-white/15 last:border-b-0 md:grid-cols-[0.75fr_1fr_1fr]"
                  >
                    <div className="p-4 font-semibold text-white">{item.label}</div>
                    <div className="p-4 text-sm leading-7 text-zinc-300">{item.usefulFor}</div>
                    <div className="p-4 text-sm leading-7 text-zinc-300">{item.limitation}</div>
                  </div>
                ))}
              </div>
            </section>

            <section id="playbook">
              <SectionLabel>Operating playbook</SectionLabel>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
                A simple five-step proposal system consultants can repeat.
              </h2>
              <div className="mt-6 grid gap-4">
                {playbook.map((item) => (
                  <div
                    key={item.step}
                    className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-6 md:grid-cols-[80px_1fr]"
                  >
                    <div className="text-3xl font-black text-emerald-700">{item.step}</div>
                    <div>
                      <h3 className="font-semibold text-zinc-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-zinc-600">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="proposaldock" className="rounded-lg border border-zinc-200 bg-white p-8">
              <SectionLabel>Where ProposalDock fits</SectionLabel>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
                ProposalDock supports the system without turning it into an enterprise rollout.
              </h2>
              <div className="mt-5 grid gap-4 text-sm leading-7 text-zinc-700">
                <p>
                  ProposalDock gives each opportunity a workspace for brief analysis, bid/no-bid
                  thinking, approved knowledge, evidence status, proposal sections, ownership,
                  review, and export readiness.
                </p>
                <p>
                  It is intentionally more structured than a generic AI writer, but lighter than a
                  large proposal platform. That makes it a practical fit for consultants, agencies,
                  and small B2B service teams that want evidence-first proposal work.
                </p>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/proposal-software-for-consultants">
                  <Button variant="accent" size="lg">
                    Explore proposal software for consultants
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/register?plan=free">
                  <Button variant="secondary" size="lg">
                    Start free
                  </Button>
                </Link>
              </div>
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-8">
              <SectionLabel>Related pages</SectionLabel>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
                Explore the related consultant and review pages
              </h2>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {[
                  {
                    href: "/consulting-proposal-software",
                    title: "Consulting proposal software",
                    body: "A focused look at how ProposalDock supports structured consulting proposal work.",
                  },
                  {
                    href: "/client-brief-analysis",
                    title: "Client brief analysis",
                    body: "See how messy briefs become structured requirements, risks, and draft planning signals.",
                  },
                  {
                    href: "/proposal-risk-review",
                    title: "Proposal risk review",
                    body: "Review scope, delivery, compliance, and evidence risk before export.",
                  },
                  {
                    href: "/proposal-automation-for-consultants",
                    title: "Proposal automation for consultants",
                    body: "Automate repetitive intake and drafting work while keeping human signoff visible.",
                  },
                ].map((item) => (
                  <div key={item.href} className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
                    <h3 className="font-semibold text-zinc-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-zinc-600">{item.body}</p>
                    <Link
                      href={item.href}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Read more
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-8">
              <SectionLabel>FAQ</SectionLabel>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
                Questions about proposal systems for consultants
              </h2>
              <div className="mt-8 grid gap-5">
                {faqs.map((item) => (
                  <div key={item.question} className="border-t border-zinc-200 pt-5 first:border-t-0 first:pt-0">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
                      <div>
                        <h3 className="font-semibold text-zinc-950">{item.question}</h3>
                        <p className="mt-2 text-sm leading-7 text-zinc-600">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
