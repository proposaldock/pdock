import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import { BillingError, createBillingPortalSession } from "@/lib/billing";
import { getUserAccountById } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const account = await getUserAccountById(user.id);
    if (!account) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const origin = new URL(request.url).origin;
    const url = await createBillingPortalSession({
      origin,
      customerId: account.billing.stripeCustomerId,
    });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to open billing portal.",
      },
      { status: error instanceof BillingError ? error.status : 500 },
    );
  }
}
