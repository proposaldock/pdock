import { NextResponse } from "next/server";
import { isBillingConfigured } from "@/lib/billing";

export const runtime = "nodejs";

function resolveAppUrl() {
  return (
    process.env.APP_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`
      : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : "") ||
    null
  );
}

export async function GET() {
  const checks = {
    authSecret: Boolean(process.env.AUTH_SECRET),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    billing: isBillingConfigured(),
    blobStorage: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    databaseIsHosted: Boolean(
      process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:"),
    ),
    appUrl: Boolean(resolveAppUrl()),
  };

  const ok = checks.authSecret && checks.anthropic && checks.appUrl;

  return NextResponse.json(
    {
      ok,
      app: "ProposalDock",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: ok ? 200 : 503 },
  );
}
