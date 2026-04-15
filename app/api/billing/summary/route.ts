import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import {
  BillingError,
  syncStripeCustomerBilling,
  syncStripeCheckoutSessionById,
} from "@/lib/billing";
import { getUserAccountById } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");
    const refresh = url.searchParams.get("refresh");

    let account = await getUserAccountById(user.id);
    if (!account) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (sessionId) {
      const session = await syncStripeCheckoutSessionById(sessionId);
      const sessionUserId =
        typeof session.metadata?.userId === "string" ? session.metadata.userId : null;
      const sessionCustomerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

      if (
        sessionUserId !== user.id &&
        (!account.billing.stripeCustomerId ||
          account.billing.stripeCustomerId !== sessionCustomerId)
      ) {
        return NextResponse.json({ error: "Billing session mismatch." }, { status: 403 });
      }

      account = await getUserAccountById(user.id);
      if (!account) {
        return NextResponse.json({ error: "Account not found." }, { status: 404 });
      }
    }

    if (!sessionId && refresh === "1" && account.billing.stripeCustomerId) {
      await syncStripeCustomerBilling(account.billing.stripeCustomerId);
      account = await getUserAccountById(user.id);
      if (!account) {
        return NextResponse.json({ error: "Account not found." }, { status: 404 });
      }
    }

    return NextResponse.json({
      billing: account.billing,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to load billing summary.",
      },
      { status: error instanceof BillingError ? error.status : 500 },
    );
  }
}
