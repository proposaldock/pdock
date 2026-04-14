import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import { BillingError, createCheckoutSession } from "@/lib/billing";
import { getUserAccountById } from "@/lib/store";
import type { BillingPlan } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const body = (await request.json()) as { plan?: BillingPlan };
    if (body.plan !== "pro" && body.plan !== "team") {
      return NextResponse.json({ error: "Choose a paid plan first." }, { status: 400 });
    }

    const account = await getUserAccountById(user.id);
    if (!account) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const origin = new URL(request.url).origin;
    const url = await createCheckoutSession({
      plan: body.plan,
      origin,
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
        stripeCustomerId: account.billing.stripeCustomerId,
      },
    });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create checkout session.",
      },
      { status: error instanceof BillingError ? error.status : 500 },
    );
  }
}
