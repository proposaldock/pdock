import { NextResponse } from "next/server";
import {
  createMarketingEvent,
  getOrCreateVisitorId,
  shouldTrackPageVisit,
} from "@/lib/marketing-analytics";
import { applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rateLimit = applyRateLimit(request, {
      key: "marketing-track",
      limit: 30,
      windowMs: 60_000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: true, skipped: "rate_limited" });
    }

    const body = (await request.json()) as {
      page?: "landing" | "contact";
      path?: string;
      plan?: "free" | "pro" | "team" | null;
    };

    if (body.page !== "landing" && body.page !== "contact") {
      return NextResponse.json({ error: "Invalid page." }, { status: 400 });
    }

    const shouldTrack = await shouldTrackPageVisit(body.page);
    const visitorId = await getOrCreateVisitorId();

    if (shouldTrack) {
      await createMarketingEvent({
        eventType: body.page === "landing" ? "landing_visit" : "contact_visit",
        page: body.page,
        path: body.path ?? null,
        visitorId,
        plan: body.plan ?? null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to track event." },
      { status: 500 },
    );
  }
}
