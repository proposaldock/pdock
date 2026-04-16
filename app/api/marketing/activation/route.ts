import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createMarketingEvent,
  getOrCreateVisitorId,
  shouldTrackActivationEvent,
} from "@/lib/marketing-analytics";
import { applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const PUBLIC_EVENTS = new Set(["start_free_clicked"]);
const AUTH_EVENTS = new Set(["first_workspace_started"]);

type ActivationEventType = "start_free_clicked" | "first_workspace_started";

export async function POST(request: Request) {
  try {
    const rateLimit = applyRateLimit(request, {
      key: "marketing-activation",
      limit: 40,
      windowMs: 60_000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: true, skipped: "rate_limited" });
    }

    const body = (await request.json()) as {
      eventType?: ActivationEventType;
    };

    if (
      body.eventType !== "start_free_clicked" &&
      body.eventType !== "first_workspace_started"
    ) {
      return NextResponse.json({ error: "Invalid activation event." }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (AUTH_EVENTS.has(body.eventType) && !user) {
      return NextResponse.json({ success: true, skipped: "unauthenticated" });
    }

    if (!PUBLIC_EVENTS.has(body.eventType) && !AUTH_EVENTS.has(body.eventType)) {
      return NextResponse.json({ error: "Invalid activation event." }, { status: 400 });
    }

    const visitorId = await getOrCreateVisitorId();
    const shouldTrack = await shouldTrackActivationEvent(body.eventType);

    if (shouldTrack) {
      await createMarketingEvent({
        eventType: body.eventType,
        page: "activation",
        path: null,
        visitorId,
        email: user?.email ?? null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to track activation." },
      { status: 500 },
    );
  }
}
