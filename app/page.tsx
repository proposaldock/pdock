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
      "Upload the RFP or paste the brief, add client context, and pull in approved knowledge assets from your team library.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Review the evidence",
    body:
      "See requirements, risks, and source-linked suggestions in one workspace so review moves faster and with less guesswork.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Assemble the response",
    body:
      "Refine sections, collect signoff, and export a clean proposal pack when the team is ready to ship.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  },
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
] as const;

const useCases = [
  {
    title: "Consultants",
    body:
      "Analyze client briefs, reuse approved expertise, and move into a grounded proposal draft without rebuilding the process from scratch.",
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
    href: "/ai-proposal-software",
  },
] as const;

const plans = [
  {
    name: "Free",
    price: "$0",
    detail: "For solo testing and early evaluation.",
    points: [
      "Core proposal workflow",
      "Local workspace history",
      "Try the AI proposal analysis flow",
    ],
    href: "/register?plan=free",
    cta: "Start free",
    tone: "zinc" as const,
  },
  {
    name: "Pro",
    price: "$49",
    detail: "For individual consultants and bid leads.",
    points: [
      "Unlimited proposal workspaces",
      "Knowledge base and export flow",
      "Faster reuse of approved knowledge",
    ],
    href: "/register?plan=pro",
    cta: "Choose Pro",
    tone: "green" as const,
  },
  {
    name: "Team",
    price: "$149",
    detail: "For shared proposal operations across a delivery team.",
    points: [
      "Organization workspaces",
      "Selected teammate sharing",
      "Review, signoff, and workload visibility",
    ],
    href: "/contact?intent=contact_sales&plan=team",
    cta: "Contact sales",
    tone: "teal" as const,
  },
] as const;

const faqs = [
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
  title: "AI Proposal Software for RFP Responses and Client Briefs",
  description:
    "ProposalDock is AI proposal software for B2B service teams. Analyze RFPs and client briefs, review requirements and risks, reuse approved knowledge, and build grounded proposal drafts faster.",
  alternates: {
    canonical: buildCanonical("/"),
  },
};

export default async function LandingPage() {
  const user = await getCurrentUser();
  const primaryCtaHref = user ? "/app" : "/register?plan=free";
  const primaryCtaLabel = user ? "Open dashboard" : "Start free";
  const secondaryCtaHref = user ? "/app/new" : "/contact?intent=contact_sales&plan=team";
  const secondaryCtaLabel = user ? "Create workspace" : "Talk to us";
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
          <header className="flex flex-wrap items-center justify-between gap-4">
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
            </nav>
          </header>

          <div className="flex flex-1 items-center py-16 sm:py-20">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-md bg-white/12 px-3 py-1 text-sm font-semibold text-emerald-200 ring-1 ring-white/15 backdrop-blur">
                AI proposal software, with evidence and review built in
              </p>
              <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                Turn RFPs and client briefs into proposal-ready drafts without the usual scramble.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-100">
                ProposalDock helps B2B service teams run a cleaner RFP response workflow with
                AI requirement extraction, risk review, grounded draft content, and a real
                workspace for human signoff.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={primaryCtaHref}>
                  <Button size="lg" variant="accent">
                    {primaryCtaLabel}
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href={secondaryCtaHref}>
                  <Button size="lg" variant="secondary">
                    {secondaryCtaLabel}
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                <Badge tone="green">Source-linked analysis</Badge>
                <Badge tone="teal">Review and signoff</Badge>
                <Badge tone="yellow">Export-ready proposal packs</Badge>
              </div>
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

      <section className="border-b border-zinc-200 bg-[#f4f6f7]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Why teams switch
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Built for proposal work and RFP response, not generic prompting.
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

      <section id="workflow" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Workflow
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">
            A cleaner path from RFP intake to final response pack.
          </h2>
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
                <Image
                  src={step.image}
                  alt={step.title}
                  width={1200}
                  height={800}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="h-[280px] w-full object-cover sm:h-[340px]"
                />
              </div>
            </div>
          ))}
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
                    <Badge tone={plan.tone}>{plan.name === "Pro" ? "Most popular" : "Beta"}</Badge>
                  </div>
                  <p className="text-4xl font-black">{plan.price}</p>
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
                Beta access
              </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Need a team rollout or just want updates while ProposalDock opens up?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
                Use contact sales for team rollout conversations, or join the waitlist if you want updates on AI proposal workflow improvements without starting a workspace yet.
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
                  <CardTitle>Join waitlist</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <p className="text-sm leading-6 text-zinc-600">
                    Best if you want rollout updates before bringing ProposalDock into your process.
                  </p>
                  <Link href="/contact?intent=waitlist">
                    <Button className="w-full" variant="secondary">
                      Join waitlist
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
              <Link href={primaryCtaHref}>
                <Button size="lg" variant="accent">
                  {primaryCtaLabel}
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
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
