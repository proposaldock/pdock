import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const sections = [
  {
    title: "Infrastructure",
    items: [
      "Set APP_URL to the production domain.",
      "Move DATABASE_URL from local SQLite to hosted Postgres.",
      "Set BLOB_READ_WRITE_TOKEN so uploads no longer rely on local disk.",
      "Confirm AUTH_SECRET is long, unique, and production-only.",
    ],
  },
  {
    title: "AI and billing",
    items: [
      "Verify ANTHROPIC_API_KEY and ANTHROPIC_MODEL.",
      "Configure STRIPE_SECRET_KEY.",
      "Configure STRIPE_WEBHOOK_SECRET.",
      "Configure STRIPE_PRICE_PRO and STRIPE_PRICE_TEAM.",
      "Run one full billing test in Stripe test mode.",
    ],
  },
  {
    title: "Monitoring and support",
    items: [
      "Configure SENTRY_DSN or another monitoring destination.",
      "Test one forced server error and confirm it is visible in monitoring.",
      "Confirm logs are available for auth, uploads, analysis, and export failures.",
    ],
  },
  {
    title: "Product checks",
    items: [
      "Verify signup and login on the production domain.",
      "Verify file upload, analysis, review, proposal assembly, and export.",
      "Verify team invite and workspace sharing behavior.",
      "Verify contact-sales and waitlist forms save successfully.",
      "Verify privacy policy and terms pages are reachable from the marketing site.",
    ],
  },
  {
    title: "Launch pass",
    items: [
      "Review landing page copy and pricing.",
      "Test mobile and desktop.",
      "Confirm rate limiting is active on public routes.",
      "Run a final walkthrough from public landing page to first analyzed workspace.",
    ],
  },
] as const;

export default function LaunchChecklistPage() {
  return (
    <main className="min-h-screen bg-[#f4f6f7] px-6 py-16">
      <div className="mx-auto max-w-4xl rounded-lg border border-zinc-200 bg-white p-8 lg:p-10">
        <Link
          href="/app/settings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-950"
        >
          <ArrowLeft className="size-4" />
          Back to settings
        </Link>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Launch Checklist
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950">
          Production launch checklist for ProposalDock
        </h1>
        <div className="mt-8 grid gap-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-zinc-950">{section.title}</h2>
              <div className="mt-4 grid gap-3">
                {section.items.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <p className="text-sm leading-6 text-zinc-700">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
