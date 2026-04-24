import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SeoPageShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f4f6f7] px-6 py-16">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}

export function SeoBackLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-950"
    >
      <ArrowLeft className="size-4" />
      Back to ProposalDock
    </Link>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
      {children}
    </p>
  );
}

export function SeoHero({
  eyebrow,
  title,
  intro,
  detail,
  badges,
  sideTitle,
  sideItems,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  detail?: string;
  badges?: readonly string[];
  sideTitle: string;
  sideItems: readonly string[];
}) {
  return (
    <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <SectionLabel>{eyebrow}</SectionLabel>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-700">{intro}</p>
        {detail ? (
          <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-700">{detail}</p>
        ) : null}
        {badges?.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 bg-teal-50 text-teal-800 ring-teal-200"
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <Card className="border-zinc-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-zinc-950">{sideTitle}</h2>
        </CardHeader>
        <CardContent className="grid gap-3">
          {sideItems.map((item) => (
            <div key={item} className="flex items-start gap-3 text-sm leading-6 text-zinc-700">
              <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
              <span>{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export function RelatedPagesSection({
  title = "Related pages",
  pages,
}: {
  title?: string;
  pages: ReadonlyArray<{ href: string; title: string; body: string }>;
}) {
  return (
    <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
      <SectionLabel>Related pages</SectionLabel>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">{title}</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {pages.map((page) => (
          <Card key={page.href} className="border-zinc-200 bg-[#f4f6f7]">
            <CardHeader>
              <CardTitle>{page.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-sm leading-6 text-zinc-600">{page.body}</p>
              <Link
                href={page.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Read more
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function SeoCtaSection({
  eyebrow,
  title,
  body,
  primaryHref = "/register?plan=free",
  primaryLabel = "Start free",
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow: string;
  title: string;
  body: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8">
      <SectionLabel>{eyebrow}</SectionLabel>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">{title}</h2>
      <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-700">{body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={primaryHref}>
          <Button variant="accent" size="lg">
            {primaryLabel}
          </Button>
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-zinc-950 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
