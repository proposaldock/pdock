import Stripe from "stripe";
import { BILLING_PLAN_COPY } from "@/lib/billing-plans";
import { hasPaidBillingAccess } from "@/lib/entitlements";
import {
  updateUserBillingFromStripe,
  updateUserStripeCustomerId,
} from "@/lib/store";
import type { BillingPlan, UserBillingSummary } from "@/lib/types";

type BillingPlanConfig = {
  label: string;
  monthlyPriceLabel: string;
  priceId: string | null;
};

export class BillingError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "BillingError";
    this.status = status;
  }
}

export const BILLING_PLANS: Record<Exclude<BillingPlan, "free">, BillingPlanConfig> = {
  pro: {
    ...BILLING_PLAN_COPY.pro,
    priceId: process.env.STRIPE_PRICE_PRO ?? null,
  },
  team: {
    ...BILLING_PLAN_COPY.team,
    priceId: process.env.STRIPE_PRICE_TEAM ?? null,
  },
};

function getStripeSecretKey() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new BillingError(
      "Stripe is not configured yet. Add STRIPE_SECRET_KEY and pricing env vars first.",
      503,
    );
  }

  return secret;
}

export function isBillingConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_PRO &&
      process.env.STRIPE_PRICE_TEAM,
  );
}

export function getStripeClient() {
  return new Stripe(getStripeSecretKey());
}

function getPlanPriceId(plan: Exclude<BillingPlan, "free">) {
  const priceId = BILLING_PLANS[plan].priceId;
  if (!priceId) {
    throw new BillingError(
      `Stripe price for ${BILLING_PLANS[plan].label} is not configured.`,
      503,
    );
  }

  return priceId;
}

export function summarizeBillingPlan(billing: UserBillingSummary) {
  if (billing.plan === "team") return BILLING_PLANS.team;
  if (billing.plan === "pro") return BILLING_PLANS.pro;
  return {
    ...BILLING_PLAN_COPY.free,
    priceId: null,
  };
}

export async function ensureStripeCustomer(user: {
  id: string;
  email: string;
  name: string;
  stripeCustomerId: string | null;
}) {
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user.id,
    },
  });

  await updateUserStripeCustomerId(user.id, customer.id);
  return customer.id;
}

export async function createCheckoutSession(input: {
  plan: Exclude<BillingPlan, "free">;
  origin: string;
  user: {
    id: string;
    email: string;
    name: string;
    stripeCustomerId: string | null;
    billing: UserBillingSummary;
  };
}) {
  if (
    input.user.billing.stripeCustomerId &&
    input.user.billing.stripeSubscriptionId &&
    hasPaidBillingAccess(input.user.billing.status)
  ) {
    return createBillingPortalSession({
      origin: input.origin,
      customerId: input.user.billing.stripeCustomerId,
    });
  }

  const stripe = getStripeClient();
  const customerId = await ensureStripeCustomer(input.user);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: getPlanPriceId(input.plan),
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    success_url: `${input.origin}/app/settings?billing=success`,
    cancel_url: `${input.origin}/app/settings?billing=cancel`,
    metadata: {
      plan: input.plan,
      userId: input.user.id,
    },
  });

  if (!session.url) {
    throw new BillingError("Stripe checkout session did not return a redirect URL.", 500);
  }

  return session.url;
}

export async function createBillingPortalSession(input: {
  origin: string;
  customerId: string | null;
}) {
  if (!input.customerId) {
    throw new BillingError("This account does not have a Stripe customer yet.", 400);
  }

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: input.customerId,
    return_url: `${input.origin}/app/settings`,
  });

  return session.url;
}

export function getStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new BillingError("Stripe webhook secret is missing.", 503);
  }

  return secret;
}

export async function syncStripeSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const periodEnd =
    (subscription as Stripe.Subscription & { current_period_end?: number })
      .current_period_end ?? null;

  const priceId = subscription.items.data[0]?.price.id ?? null;
  await updateUserBillingFromStripe({
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    stripeSubscriptionStatus: subscription.status,
    stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
  });
}

export async function clearStripeSubscription(customerId: string, subscriptionId: string) {
  await updateUserBillingFromStripe({
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: null,
    stripeSubscriptionStatus: "canceled",
    stripeCurrentPeriodEnd: null,
  });
}

export async function syncStripeCheckoutSession(session: Stripe.Checkout.Session) {
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId) {
    return;
  }

  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncStripeSubscription(subscription);
}
