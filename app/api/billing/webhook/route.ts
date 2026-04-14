import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  clearStripeSubscription,
  getStripeClient,
  getStripeWebhookSecret,
  syncStripeCheckoutSession,
  syncStripeSubscription,
} from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  try {
    const body = await request.text();
    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret(),
    );

    switch (event.type) {
      case "checkout.session.completed":
        await syncStripeCheckoutSession(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await syncStripeSubscription(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;
        await clearStripeSubscription(customerId, subscription.id);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process Stripe webhook.",
      },
      { status: 400 },
    );
  }
}
