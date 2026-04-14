import { NextResponse } from "next/server";
import { createUserSession, hashPassword } from "@/lib/auth";
import { createMarketingEvent } from "@/lib/marketing-analytics";
import { applyRateLimit } from "@/lib/rate-limit";
import {
  adoptOrphanedResources,
  countUsers,
  createUser,
  ensureUserOrganization,
  getUserByEmail,
} from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      plan?: "free" | "pro" | "team" | null;
    };
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password?.trim() ?? "";
    const rateLimit = applyRateLimit(request, {
      key: "auth-register",
      identifier: email || null,
      limit: 6,
      windowMs: 5 * 60_000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many signup attempts. Please wait about ${rateLimit.retryAfterSeconds} seconds and try again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, passwordHash });

    if ((await countUsers()) === 1) {
      await adoptOrphanedResources(user.id);
    }

    await ensureUserOrganization(user.id, name);
    await createMarketingEvent({
      eventType: "signup_completed",
      email,
      plan: body.plan ?? null,
    });
    await createUserSession(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create account." },
      { status: 500 },
    );
  }
}
