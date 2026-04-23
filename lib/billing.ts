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

function isMissingStripeResource(error: unknown) {
  return (
    error instanceof Stripe.errors.StripeInvalidRequestError &&
    error.code === "resource_missing"
  );
}

async function createFreshStripeCustomer(user: {
  id: string;
  email: string;
  name: string;
}) {
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

async function canUseExistingCustomerForCurrentStripeMode(customerId: string) {
  const stripe = getStripeClient();

  try {
    const customer = await stripe.customers.retrieve(customerId);
    return !("deleted" in customer && customer.deleted === true);
  } catch (error) {
    if (isMissingStripeResource(error)) {
      return false;
    }

    throw error;
  }
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

async function getPriceProductId(stripe: Stripe, priceId: string) {
  const price = await stripe.prices.retrieve(priceId);
  const product = price.product;

  if (typeof product === "string") {
    return product;
  }

  if ("deleted" in product && product.deleted) {
    throw new BillingError("Stripe product for the selected plan was deleted.", 503);
  }

  return product.id;
}

async function getPlanUpdatePortalConfigurationId(stripe: Stripe, origin: string) {
  const proPriceId = getPlanPriceId("pro");
  const teamPriceId = getPlanPriceId("team");
  const configurations = await stripe.billingPortal.configurations.list({
    active: true,
    limit: 100,
  });
  const existing = configurations.data.find(
    (configuration) =>
      configuration.metadata?.managedBy === "proposaldock" &&
      configuration.metadata?.purpose === "plan_updates" &&
      configuration.metadata?.proPriceId === proPriceId &&
      configuration.metadata?.teamPriceId === teamPriceId,
  );

  if (existing) {
    return existing.id;
  }

  const [proProductId, teamProductId] = await Promise.all([
    getPriceProductId(stripe, proPriceId),
    getPriceProductId(stripe, teamPriceId),
  ]);
  const pricesByProduct = new Map<string, string[]>();

  for (const [productId, priceId] of [
    [proProductId, proPriceId],
    [teamProductId, teamPriceId],
  ] as const) {
    pricesByProduct.set(productId, [
      ...(pricesByProduct.get(productId) ?? []),
      priceId,
    ]);
  }

  const configuration = await stripe.billingPortal.configurations.create({
    name: "ProposalDock plan updates",
    default_return_url: `${origin}/app/settings`,
    business_profile: {
      privacy_policy_url: `${origin}/privacy`,
      terms_of_service_url: `${origin}/terms`,
    },
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ["email", "name", "address"],
      },
      invoice_history: {
        enabled: true,
      },
      payment_method_update: {
        enabled: true,
      },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        proration_behavior: "always_invoice",
        products: Array.from(pricesByProduct.entries()).map(([product, prices]) => ({
          product,
          prices,
        })),
      },
    },
    metadata: {
      managedBy: "proposaldock",
      purpose: "plan_updates",
      proPriceId,
      teamPriceId,
    },
  });

  return configuration.id;
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
    const isUsable = await canUseExistingCustomerForCurrentStripeMode(
      user.stripeCustomerId,
    );
    if (isUsable) {
      return user.stripeCustomerId;
    }
  }

  return createFreshStripeCustomer(user);
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
  const hasUsableCustomer = input.user.billing.stripeCustomerId
    ? await canUseExistingCustomerForCurrentStripeMode(input.user.billing.stripeCustomerId)
    : false;

  if (
    hasUsableCustomer &&
    input.user.billing.stripeSubscriptionId &&
    input.user.billing.plan !== "free" &&
    hasPaidBillingAccess(input.user.billing.status)
  ) {
    if (input.user.billing.plan === input.plan) {
      return createBillingPortalSession({
        origin: input.origin,
        customerId: input.user.billing.stripeCustomerId,
      });
    }

    if (input.user.billing.plan === "pro" && input.plan === "team") {
      return createSubscriptionUpgradeConfirmationSession({
        origin: input.origin,
        customerId: input.user.billing.stripeCustomerId,
        subscriptionId: input.user.billing.stripeSubscriptionId,
        nextPlan: input.plan,
      });
    }

    return createBillingPortalSession({
      origin: input.origin,
      customerId: input.user.billing.stripeCustomerId,
    });
  }

  const stripe = getStripeClient();
  const customerId = await ensureStripeCustomer(input.user);
  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: getPlanPriceId(input.plan),
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: `${input.origin}/app/settings?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${input.origin}/app/settings?billing=cancel`,
      metadata: {
        plan: input.plan,
        userId: input.user.id,
      },
    });
  } catch (error) {
    if (!isMissingStripeResource(error)) {
      throw error;
    }

    const freshCustomerId = await createFreshStripeCustomer(input.user);
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: freshCustomerId,
      line_items: [
        {
          price: getPlanPriceId(input.plan),
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: `${input.origin}/app/settings?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${input.origin}/app/settings?billing=cancel`,
      metadata: {
        plan: input.plan,
        userId: input.user.id,
      },
    });
  }

  if (!session.url) {
    throw new BillingError("Stripe checkout session did not return a redirect URL.", 500);
  }

  return session.url;
}

async function createSubscriptionUpgradeConfirmationSession(input: {
  origin: string;
  customerId: string | null;
  subscriptionId: string;
  nextPlan: Exclude<BillingPlan, "free">;
}) {
  if (!input.customerId) {
    throw new BillingError("This account does not have a Stripe customer yet.", 400);
  }

  const stripe = getStripeClient();
  const configurationId = await getPlanUpdatePortalConfigurationId(
    stripe,
    input.origin,
  );
  const subscription = await stripe.subscriptions.retrieve(input.subscriptionId);
  const item = subscription.items.data[0];

  if (!item) {
    throw new BillingError("Active subscription could not be updated.", 500);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: input.customerId,
    configuration: configurationId,
    return_url: `${input.origin}/app/settings`,
    flow_data: {
      type: "subscription_update_confirm",
      after_completion: {
        type: "redirect",
        redirect: {
          return_url: `${input.origin}/app/settings?billing=success&upgraded=${input.nextPlan}`,
        },
      },
      subscription_update_confirm: {
        subscription: input.subscriptionId,
        items: [
          {
            id: item.id,
            price: getPlanPriceId(input.nextPlan),
            quantity: 1,
          },
        ],
      },
    },
  });

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

export async function syncStripeCheckoutSessionById(sessionId: string) {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  await syncStripeCheckoutSession(session);
  return session;
}

export async function syncStripeCustomerBilling(customerId: string) {
  const stripe = getStripeClient();
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
  });

  const preferredStatuses = new Set([
    "active",
    "trialing",
    "past_due",
    "unpaid",
    "incomplete",
  ]);

  const currentSubscription =
    subscriptions.data.find((subscription) => preferredStatuses.has(subscription.status)) ??
    subscriptions.data[0] ??
    null;

  if (!currentSubscription) {
    return null;
  }

  await syncStripeSubscription(currentSubscription);
  return currentSubscription;
}
