import { NextResponse } from "next/server";
import { createUserSession, verifyPassword } from "@/lib/auth";
import { applyRateLimit } from "@/lib/rate-limit";
import { getUserByEmail } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password?.trim() ?? "";
    const rateLimit = applyRateLimit(request, {
      key: "auth-login",
      identifier: email || null,
      limit: 10,
      windowMs: 5 * 60_000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many sign-in attempts. Please wait about ${rateLimit.retryAfterSeconds} seconds and try again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createUserSession(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sign in." },
      { status: 500 },
    );
  }
}
