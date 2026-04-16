import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isPlatformAdminEmail } from "@/lib/platform-admin";
import { getHealthChecks } from "@/lib/production-readiness";

export const runtime = "nodejs";

export async function GET() {
  const checks = getHealthChecks();
  const user = await getCurrentUser();
  const includeDetails = isPlatformAdminEmail(user?.email);

  const ok = checks.authSecret && checks.anthropic && checks.appUrl;

  return NextResponse.json(
    {
      ok,
      app: "ProposalDock",
      timestamp: new Date().toISOString(),
      ...(includeDetails ? { checks } : {}),
    },
    { status: ok ? 200 : 503 },
  );
}
