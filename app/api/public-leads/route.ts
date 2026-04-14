import { NextResponse } from "next/server";
import { createMarketingEvent } from "@/lib/marketing-analytics";
import { createPublicLead } from "@/lib/public-leads";
import { applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rateLimit = applyRateLimit(request, {
      key: "public-leads",
      limit: 10,
      windowMs: 60_000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many lead submissions. Please wait about ${rateLimit.retryAfterSeconds} seconds and try again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const body = (await request.json()) as {
      type?: "waitlist" | "contact_sales";
      name?: string;
      email?: string;
      company?: string;
      teamSize?: string;
      plan?: string;
      source?: string;
      message?: string;
    };

    const type = body.type;
    const name = body.name?.trim();
    const email = body.email?.trim();
    const company = body.company?.trim();

    if (type !== "waitlist" && type !== "contact_sales") {
      return NextResponse.json({ error: "Invalid lead type." }, { status: 400 });
    }

    if (!name || !email || !company) {
      return NextResponse.json(
        { error: "Name, email, and company are required." },
        { status: 400 },
      );
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailIsValid) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const lead = await createPublicLead({
      type,
      name,
      email,
      company,
      teamSize: body.teamSize,
      plan: body.plan,
      source: body.source,
      message: body.message,
    });

    await createMarketingEvent({
      eventType: "lead_submitted",
      email,
      page: type,
      path: "/contact",
      plan: body.plan ?? null,
    });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save lead." },
      { status: 500 },
    );
  }
}
