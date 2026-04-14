import { NextResponse } from "next/server";
import { getHealthChecks } from "@/lib/production-readiness";

export const runtime = "nodejs";

export async function GET() {
  const checks = getHealthChecks();

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
