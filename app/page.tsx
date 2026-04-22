import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  LibraryBig,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import {
  buildCanonical,
  getOrganizationJsonLd,
  getSoftwareApplicationJsonLd,
} from "@/lib/site";
import { ActivationLink } from "@/components/activation-link";

const featureCards = [
  {
    icon: FileSearch,
    title: "AI requirement analysis in minutes",
    body:
      "Turn long RFPs and client briefs into a structured requirement list with coverage status, SME flags, and source refs your team can trust.",
  },
  {
    icon: ShieldCheck,
    title: "Risk review before the scramble starts",
    body:
      "Flag red lines, unclear asks, missing evidence, and risky assumptions before they leak into the response.",
  },
  {
    icon: Sparkles,
    title: "AI draft support that stays grounded",
    body:
      "Build executive summaries, response plans, and proposal sections that stay tied to approved company knowledge.",
  },
] as const;

const workflowSteps = [
  {
    title: "Dock the brief",
    body:
      "Create a workspace, add the client name, paste the brief or upload files, then add company knowledge and any instructions for the AI.",
    visual: "intake",
  },
  {
    title: "Review the evidence",
    body:
      "Open Requirements, Risks, Draft, and Sources to check what the AI found, what it cited, and what still needs human review.",
    visual: "review",
  },
  {
    title: "Assemble the response",
    body:
      "Move accepted material into Proposal, refine sections, collect signoff, and export a clean response pack when it is ready.",
    visual: "proposal",
  },
] as const;

const heroTrustPoints = [
  "No credit card needed",
  "Private proposal workspaces",
  "Human review before export",
] as const;

const quickWorkflow = [
  {
    title: "Add the brief",
    body: "Paste the client request or upload source material.",
  },
  {
    title: "Review the analysis",
    body: "See requirements, risks, draft direction, and source refs.",
  },
  {
    title: "Draft and export",
    body: "Refine the response and move toward a clean proposal pack.",
  },
] as const;

const fitCards = [
  {
    title: "Best fit",
    body:
      "Consultants, agencies, and B2B service teams that need to turn messy client briefs into reviewed proposal drafts without a heavy rollout.",
    points: [
      "You respond to custom client requests",
      "You need structure before writing",
      "You want AI help with human review",
    ],
  },
  {
    title: "Not trying to replace",
    body:
      "Enterprise RFP factories with mature content governance, large response teams, and deep platform requirements.",
    points: [
      "Heavy implementation programs",
      "Large-scale content library migrations",
      "Complex enterprise procurement suites",
    ],
  },
] as const;

const fastPathSteps = [
  "Paste or upload one real client brief",
  "Review requirements, risks, and missing evidence",
  "Attach lightweight company knowledge",
  "Generate a first proposal-ready draft",
] as const;

const proofPoints = [
  "AI proposal analysis with conservative grounding",
  "Human review, approvals, and section ownership",
  "Knowledge base reuse across RFP responses",
  "DOCX exports and print-ready proposal packs",
] as const;

const seoResources = [
  {
    href: "/ai-proposal-software",
    title: "AI proposal software",
    body:
      "A clearer explanation of how ProposalDock uses AI for brief analysis, grounded drafting, and human review.",
  },
  {
    href: "/rfp-response-software",
    title: "RFP response software",
    body:
      "A focused page on how ProposalDock helps teams move from RFP intake to proposal draft with less chaos.",
  },
  {
    href: "/proposal-software-for-consultants",
    title: "Proposal software for consultants",
    body:
      "A practical guide for consultants who need a cleaner way to analyze briefs, reuse expertise, and draft proposals.",
  },
  {
    href: "/proposal-system-for-consultants",
    title: "Proposal system for consultants",
    body:
      "A guide to managing briefs, evidence, reviews, reusable knowledge, and proposal drafts in one consulting proposal system.",
  },
  {
    href: "/proposal-workflow-software",
    title: "Proposal workflow software",
    body:
      "A closer look at how ProposalDock connects intake, analysis, review, drafting, and export in one workflow.",
  },
] as const;

const useCases = [
  {
    title: "Proposal software for consultants",
    body:
      "Analyze client briefs, review risks, reuse approved expertise, and move into a grounded proposal draft without rebuilding the process from scratch.",
    href: "/proposal-software-for-consultants",
  },
  {
    title: "Agencies",
    body:
      "Keep RFP analysis, creative or technical response planning, review notes, and final proposal material in one shared workspace.",
    href: "/rfp-response-software",
  },
  {
    title: "B2B service teams",
    body:
      "Coordinate requirements, risks, knowledge, section ownership, and exports across the people responsible for winning client work.",
    href: "/proposal-workflow-software",
  },
] as const;

function WorkflowMockup({
  variant,
}: {
  variant: "intake" | "review" | "proposal";
}) {
  const config = {
    intake: {
      label: "Workspace setup",
      title: "Customer Portal RFP",
      left: ["Client name", "Brief material", "Company knowledge", "AI instructions"],
      right: ["Paste brief", "Attach DOCX", "Add approved facts"],
    },
    review: {
      label: "Analysis review",
      title: "Requirements and risks",
      left: ["12 requirements", "3 high-priority risks", "8 source citations", "4 SME flags"],
      right: ["Accept", "Reject", "Add note"],
    },
    proposal: {
      label: "Proposal assembly",
      title: "Response pack",
      left: ["Executive summary", "Implementation approach", "Security response", "Support model"],
      right: ["Draft", "In review", "Approved"],
    },
  }[variant];

  return (
    <div className="min-h-[300px] bg-white p-4 sm:p-6">
      <div className="rounded-lg border border-zinc-200 bg-[#f4f6f7] p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              {config.label}
            </p>
            <p className="mt-1 text-xl font-black text-zinc-950">{config.title}</p>
          </div>
          <Button size="sm" variant="accent">
            {variant === "proposal" ? "Export" : "Continue"}
          </Button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_0.75fr]">
          <div className="grid gap-3">
            {config.left.map((item, index) => (
              <div key={item} className="rounded-lg border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-zinc-900">{item}</p>
                  <Badge tone={index === 0 ? "green" : index === 1 ? "teal" : "zinc"}>
                    {index === 0 ? "ready" : index === 1 ? "active" : "queued"}
                  </Badge>
                </div>
                <div className="mt-3 h-2 rounded-full bg-zinc-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${86 - index * 14}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-sm font-bold text-zinc-950">
              {variant === "intake"
                ? "Input panel"
                : variant === "review"
                  ? "Review actions"
                  : "Export readiness"}
            </p>
            <div className="mt-4 grid gap-3">
              {config.right.map((item) => (
                <div key={item} className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "per month",
    detail: "Try the workflow with one real workspace.",
    points: [
      "One proposal workspace",
      "Try the AI proposal analysis flow",
      "No credit card needed",
    ],
    href: "/register?plan=free",
    cta: "Start free",
    tone: "zinc" as const,
  },
  {
    name: "Pro",
    price: "$49",
    cadence: "per month",
    detail: "For serious solo proposal work.",
    points: [
      "Unlimited proposal workspaces",
      "Knowledge base and export flow",
      "Reusable approved company knowledge",
    ],
    href: "/register?plan=pro",
    cta: "Choose Pro",
    tone: "green" as const,
  },
  {
    name: "Team",
    price: "$149",
    cadence: "per month",
    detail: "For shared proposal operations.",
    points: [
      "Organization workspaces",
      "Selected teammate sharing",
      "Team access, review, and sharing",
    ],
    href: "/contact?intent=contact_sales&plan=team",
    cta: "Contact sales",
    tone: "teal" as const,
  },
] as const;

const faqs = [
  {
    question: "Do I need a credit card to start?",
    answer:
      "No. You can start on the Free plan with one workspace and test the core proposal workflow before choosing Pro or Team.",
  },
  {
    question: "Can I cancel a paid plan?",
    answer:
      "Yes. Paid plans are managed through Stripe billing, where you can update or cancel your subscription from the billing portal.",
  },
  {
    question: "What does ProposalDock actually help with?",
    answer:
      "ProposalDock helps teams take an incoming brief or RFP, turn it into structured requirements and risks, review the output with source grounding, draft proposal sections, and export a response pack without juggling the work across several disconnected tools.",
  },
  {
    question: "How is this different from using ChatGPT or Claude in a browser?",
    answer:
      "ProposalDock is built around the proposal workflow itself, not around freeform prompting. It keeps the brief, knowledge base, analysis, review decisions, section approvals, ownership, and export flow inside one workspace so the team can actually operate the response together.",
  },
  {
    question: "How does AI fit into the workflow?",
    answer:
      "AI helps read the brief, surface requirements, flag risks, and generate grounded draft content. The team still reviews the output, approves sections, adds comments, assigns follow-up, and decides what is safe to send. The goal is faster proposal work, not blind automation.",
  },
  {
    question: "Can we reuse approved company material across proposals?",
    answer:
      "Yes. ProposalDock includes a knowledge base where you can keep approved case studies, support language, delivery approach, security content, and other reusable material, then attach the relevant assets to a live workspace when you need them.",
  },
  {
    question: "Do we have to upload PDFs?",
    answer:
      "No. You can start with pasted text, TXT, DOCX, or your own working notes. In beta, pasted text and text-based document flows are the safest way to get moving quickly if a client brief arrives in an awkward format.",
  },
  {
    question: "How does ProposalDock handle sensitive proposal material?",
    answer:
      "ProposalDock is designed to keep work inside authenticated workspaces with role-based access, shared organization controls, and managed storage. Teams should still treat beta software with appropriate care, but the product is built for real proposal work rather than public or disposable content.",
  },
  {
    question: "Which plan should we start with?",
    answer:
      "Free is best for evaluating the workflow. Pro fits solo consultants and bid leads who need more room to work. Team is the right starting point when several people need shared workspaces, ownership, review visibility, and teammate access.",
  },
  {
    question: "Can ProposalDock work for both solo operators and teams?",
    answer:
      "Yes. A solo user can run the full proposal workflow alone, while a team can layer on shared workspaces, teammate access, review coordination, approvals, and follow-up ownership without changing the core process.",
  },
  {
    question: "What happens after signup?",
    answer:
      "You land in the app, create your first workspace, add the brief, run analysis, and move into review and proposal drafting from there. If you later need more capacity or team features, you can upgrade from Settings.",
  },
  {
    question: "Who is ProposalDock best suited for right now?",
    answer:
      "It is best suited for consultants, agencies, and B2B service teams who regularly respond to client briefs and want a cleaner way to go from intake to proposal draft without losing context, evidence, or review control.",
  },
] as const;

export const metadata: Metadata = {
  title: "AI Proposal Workspace for Consultants and B2B Service Teams",
  description:
    "AI proposal workspace for consultants, agencies, and B2B service teams. Turn client briefs and RFPs into reviewed proposal drafts faster.",
  alternates: {
    canonical: buildCanonical("/"),
  },
  openGraph: {
    title: "AI Proposal Workspace for Consultants and B2B Service Teams",
    description:
      "ProposalDock helps consultants, agencies, and B2B service teams turn client briefs and RFPs into reviewed proposal drafts faster.",
    url: buildCanonical("/"),
  },
};

export default async function LandingPage() {
  const user = await getCurrentUser();
  const primaryCtaHref = user ? "/app" : "/register?plan=free";
  const primaryCtaLabel = user ? "Open dashboard" : "Start free";
  const secondaryCtaHref = user ? "/app/new" : "#how-it-works";
  const secondaryCtaLabel = user ? "Create workspace" : "See how it works";
  const organizationJsonLd = getOrganizationJsonLd();
  const softwareJsonLd = getSoftwareApplicationJsonLd();

  return (
    <main className="bg-white text-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareJsonLd),
        }}
      />
      <AnalyticsBeacon page="landing" path="/" />
      <section className="relative min-h-[82vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1800&q=80"
          alt="Team reviewing proposal materials together"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover"
        />
        <div className="absolute inset-0 bg-zinc-950/68" />
        <div className="relative mx-auto flex min-h-[82vh] max-w-7xl flex-col px-6 py-6 lg:px-8">
          <header className="sticky top-0 z-50 -mx-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-zinc-950/72 px-6 py-4 backdrop-blur lg:-mx-8 lg:px-8">
            <Link href="/" className="text-lg font-black tracking-tight text-white">
              ProposalDock
            </Link>
            <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-white/88">
              <Link href="/about" className="hover:text-white">
                About
              </Link>
              <a href="#workflow" className="hover:text-white">
                Workflow
              </a>
              <a href="#pricing" className="hover:text-white">
                Pricing
              </a>
              <a href="#faq" className="hover:text-white">
                FAQ
              </a>
              <Link href={user ? "/app" : "/login"}>
                <Button variant="secondary" size="sm">
                  {user ? "Dashboard" : "Sign in"}
                </Button>
              </Link>
              {user ? (
                <Link href="/app">
                  <Button variant="accent" size="sm">
                    Open app
                  </Button>
                </Link>
              ) : (
                <ActivationLink href="/register?plan=free" eventType="start_free_clicked">
                  <Button variant="accent" size="sm">
                    Start free
                  </Button>
                </ActivationLink>
              )}
            </nav>
          </header>

          <div className="flex flex-1 items-center py-16 sm:py-20">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-md bg-white/12 px-3 py-1 text-sm font-semibold text-emerald-200 ring-1 ring-white/15 backdrop-blur">
                Lightweight AI proposal workspace for service teams
              </p>
              <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                Win the deal without the weekend scramble.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-100">
                ProposalDock helps consultants, agencies, and small B2B service teams analyze
                briefs, review requirements and risks, reuse approved knowledge, and draft
                responses inside one simple workspace.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {user ? (
                  <Link href={primaryCtaHref}>
                    <Button size="lg" variant="accent">
                      {primaryCtaLabel}
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                ) : (
                  <ActivationLink href={primaryCtaHref} eventType="start_free_clicked">
                    <Button size="lg" variant="accent">
                      {primaryCtaLabel}
                      <ArrowRight className="size-4" />
                    </Button>
                  </ActivationLink>
                )}
                <Link href={secondaryCtaHref}>
                  <Button size="lg" variant="secondary">
                    {secondaryCtaLabel}
                  </Button>
                </Link>
              </div>
              {!user ? (
                <p className="mt-3 text-sm font-medium text-zinc-200">
                  Start free with one workspace. No credit card needed.
                </p>
              ) : null}
            </div>
          </div>

          <div className="mb-2 grid gap-4 rounded-lg border border-white/12 bg-white/8 p-5 text-white backdrop-blur md:grid-cols-4">
            {proofPoints.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                <p className="text-sm leading-6 text-white/92">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="mb-8 grid gap-3 rounded-lg border border-zinc-200 bg-[#f4f6f7] p-4 text-sm text-zinc-700 md:grid-cols-3">
            {heroTrustPoints.map((point) => (
              <div key={point} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span className="font-medium">{point}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                One simple path from messy brief to reviewable proposal draft.
              </h2>
              <p className="mt-4 text-sm leading-6 text-zinc-600">
                ProposalDock is easiest to understand by running one brief through the flow.
                Start with sample data, pasted text, or a real client request.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {quickWorkflow.map((step, index) => (
                <div key={step.title} className="rounded-lg border border-zinc-200 bg-[#f4f6f7] p-5">
                  <Badge tone="teal">0{index + 1}</Badge>
                  <p className="mt-4 font-semibold text-zinc-950">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-[#f4f6f7]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Why teams switch
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Proposal work, with evidence and review built in.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featureCards.map((feature) => (
              <Card key={feature.title} className="border-zinc-200 bg-white">
                <CardHeader>
                  <feature.icon className="size-7 text-emerald-600" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-zinc-600">{feature.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Positioning
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Built for teams that need a proposal workflow today, not a six-month platform rollout.
            </h2>
            <p className="mt-4 text-sm leading-6 text-zinc-600">
              ProposalDock is intentionally lighter than enterprise RFP suites. It focuses on the
              moment smaller service teams feel most pressure: turning a live client request into a
              credible, reviewable proposal draft quickly.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {fitCards.map((card) => (
              <Card key={card.title} className="border-zinc-200">
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                  <p className="text-sm leading-6 text-zinc-600">{card.body}</p>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {card.points.map((point) => (
                    <div key={point} className="flex items-start gap-3 text-sm text-zinc-700">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      <span>{point}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Workflow
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">
            What the workflow looks like inside ProposalDock.
          </h2>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            These are product-style views of the flow: setup, review, proposal assembly, and export.
          </p>
        </div>

        <div className="mt-10 grid gap-8">
          {workflowSteps.map((step, index) => (
            <div
              key={step.title}
              className="grid gap-5 border-t border-zinc-200 pt-8 lg:grid-cols-[0.7fr_1.3fr]"
            >
              <div>
                <Badge tone="teal">0{index + 1}</Badge>
                <h3 className="mt-4 text-2xl font-bold tracking-tight">{step.title}</h3>
                <p className="mt-3 max-w-lg text-base leading-7 text-zinc-600">{step.body}</p>
              </div>
              <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                <WorkflowMockup variant={step.visual} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Fast path
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              From brief to first proposal draft in one focused session.
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-300">
              The first win should not require weeks of setup. ProposalDock is designed so a small
              team can start with one real brief, see the structure, and decide whether the workflow
              helps before investing in a bigger process.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {fastPathSteps.map((step, index) => (
              <div key={step} className="rounded-lg border border-white/15 bg-white/8 p-5">
                <Badge tone="green">0{index + 1}</Badge>
                <p className="mt-4 text-sm font-semibold leading-6 text-zinc-100">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-[#f4f6f7]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Use cases
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Built for teams that turn expertise into client-ready proposals.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {useCases.map((useCase) => (
              <Card key={useCase.title} className="border-zinc-200 bg-white">
                <CardHeader>
                  <CardTitle>{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <p className="text-sm leading-6 text-zinc-600">{useCase.body}</p>
                  <Link
                    href={useCase.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Learn more
                    <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-y border-zinc-200 bg-[#f4f6f7]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Start free, then move into Pro or Team when the proposal process sticks.
            </h2>
            <p className="mt-4 text-sm leading-6 text-zinc-600">
              Free is for trying the workflow. Pro is for individual users doing serious
              proposal work. Team is for collaboration, sharing, and multi-person review.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={plan.name === "Pro" ? "border-emerald-400 shadow-lg" : "border-zinc-200"}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>{plan.name}</CardTitle>
                    <Badge tone={plan.tone}>
                      {plan.name === "Pro"
                        ? "Most popular"
                        : plan.name === "Team"
                          ? "For teams"
                          : "Starter"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-4xl font-black">{plan.price}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      {plan.cadence}
                    </p>
                  </div>
                  <p className="text-sm text-zinc-600">{plan.detail}</p>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-3">
                    {plan.points.map((point) => (
                      <div key={point} className="flex items-start gap-3 text-sm text-zinc-700">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={user ? "/app/settings" : plan.href}>
                    <Button className="w-full" variant={plan.name === "Pro" ? "accent" : "secondary"}>
                      {user ? `Open ${plan.name} plan` : plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Before you sign up
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              The common questions people ask before trying ProposalDock.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Bring one real brief",
                body: "You can paste text, upload source material, or start with sample data to see the workflow quickly.",
              },
              {
                title: "Keep review human",
                body: "AI creates structure and draft direction, but your team accepts, rejects, edits, and signs off.",
              },
              {
                title: "Upgrade only when it fits",
                body: "Free is for testing. Pro and Team unlock more capacity, knowledge reuse, and collaboration.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-zinc-200 bg-[#f4f6f7] p-5">
                <p className="font-semibold text-zinc-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <LibraryBig className="size-5 text-emerald-600" />
              <h3 className="text-xl font-bold">What the team gets</h3>
            </div>
            <div className="mt-5 grid gap-4">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="font-semibold text-zinc-900">Shared proposal workspaces</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Keep analysis, approvals, snapshots, and exports in one place instead of spreading the RFP response across docs and chat.
              </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="font-semibold text-zinc-900">Knowledge that stays approved</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Reuse case studies, delivery models, security language, and support material without inventing claims on the fly.
                </p>
              </div>
            </div>
          </div>

          <div id="faq" className="rounded-lg border border-zinc-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="size-5 text-emerald-600" />
              <h3 className="text-xl font-bold">FAQ</h3>
            </div>
            <div className="mt-5 grid gap-4">
              {faqs.map((item) => (
                <div key={item.question} className="border-t border-zinc-200 pt-4 first:border-t-0 first:pt-0">
                  <p className="font-semibold text-zinc-900">{item.question}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Learn more
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              More detailed guides on how ProposalDock fits proposal work.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {seoResources.map((resource) => (
              <Card key={resource.href} className="border-zinc-200 bg-[#f4f6f7]">
                <CardHeader>
                  <CardTitle>{resource.title}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <p className="text-sm leading-6 text-zinc-600">{resource.body}</p>
                  <Link href={resource.href} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                    Read more
                    <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-[#f4f6f7]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Stay in the loop
              </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Need a team rollout or just want product updates?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
                Use contact sales for team rollout conversations, or join the mailing list if you want updates on AI proposal workflow improvements without starting a workspace yet.
            </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              <Card className="border-zinc-200">
                <CardHeader>
                  <CardTitle>Contact sales</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <p className="text-sm leading-6 text-zinc-600">
                    Best for team rollout, stakeholder alignment, and pricing conversations.
                  </p>
                  <Link href="/contact?intent=contact_sales&plan=team">
                    <Button className="w-full" variant="accent">
                      Talk to us
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-zinc-200">
                <CardHeader>
                  <CardTitle>Join mailing list</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <p className="text-sm leading-6 text-zinc-600">
                    Best if you want product updates before bringing ProposalDock deeper into your process.
                  </p>
                  <Link href="/contact?intent=mailing_list">
                    <Button className="w-full" variant="secondary">
                      Join mailing list
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Ready to try it
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
              Start with one live brief and see how much of the proposal scramble disappears.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
              Create an account, upload a real client request, and move from intake to grounded draft content inside one AI-assisted proposal workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link href={primaryCtaHref}>
                  <Button size="lg" variant="accent">
                    {primaryCtaLabel}
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              ) : (
                <ActivationLink href={primaryCtaHref} eventType="start_free_clicked">
                  <Button size="lg" variant="accent">
                    {primaryCtaLabel}
                    <ArrowRight className="size-4" />
                  </Button>
                </ActivationLink>
              )}
              <Link href={user ? "/app/settings" : "/contact?intent=contact_sales&plan=team"}>
                <Button size="lg" variant="secondary">
                  {user ? "Open pricing" : "Talk to sales"}
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap gap-4 text-sm text-zinc-400">
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/contact?intent=contact_sales&plan=team" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
