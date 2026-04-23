"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BILLING_PLAN_COPY } from "@/lib/billing-plans";
import { getEffectivePlan, hasPaidBillingAccess } from "@/lib/entitlements";
import type { BillingPlan, UserBillingSummary } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: "conversion",
      params: {
        send_to: string;
        value?: number;
        currency?: string;
        transaction_id?: string;
      },
    ) => void;
  }
}

type BillingSettingsProps = {
  billing: UserBillingSummary;
  isConfigured: boolean;
  memberSince: string;
  showStorageAndData?: boolean;
};

const googleAdsSubscribeSendTo =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_SUBSCRIBE_SEND_TO?.trim();

function statusTone(status: UserBillingSummary["status"]) {
  switch (status) {
    case "active":
    case "trialing":
      return "green";
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "yellow";
    case "canceled":
    case "incomplete_expired":
      return "red";
    default:
      return "zinc";
  }
}

export function BillingSettings({
  billing,
  isConfigured,
  memberSince,
  showStorageAndData = false,
}: BillingSettingsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [billingState, setBillingState] = useState(billing);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const hasAutoOpened = useRef(false);
  const hasSyncedSuccess = useRef(false);
  const hasTrackedSubscribeConversion = useRef(false);
  const conversionRetryTimer = useRef<number | null>(null);
  const billingIntent = searchParams.get("plan");
  const billingResult = searchParams.get("billing");
  const sessionId = searchParams.get("session_id");
  const upgradedPlan = searchParams.get("upgraded");
  const effectivePlan = useMemo(
    () => getEffectivePlan(billingState.plan, billingState.status),
    [billingState.plan, billingState.status],
  );
  const hasPaidPlan =
    hasPaidBillingAccess(billingState.status) && billingState.plan !== "free";

  const trackSubscribeConversion = useCallback((nextBilling: UserBillingSummary) => {
    if (
      hasTrackedSubscribeConversion.current ||
      !googleAdsSubscribeSendTo ||
      nextBilling.plan === "free" ||
      !hasPaidBillingAccess(nextBilling.status)
    ) {
      return;
    }

    const sendConversion = (attempt = 0) => {
      if (hasTrackedSubscribeConversion.current) return;

      if (!window.gtag) {
        if (attempt < 12) {
          conversionRetryTimer.current = window.setTimeout(
            () => sendConversion(attempt + 1),
            500,
          );
        }
        return;
      }

      hasTrackedSubscribeConversion.current = true;
      window.gtag("event", "conversion", {
        send_to: googleAdsSubscribeSendTo,
        value: nextBilling.plan === "team" ? 149 : 49,
        currency: "USD",
        transaction_id: sessionId ?? undefined,
      });
    };

    sendConversion();
  }, [sessionId]);

  const redirectToBilling = useCallback(async (
    action: "checkout" | "portal",
    plan?: Exclude<BillingPlan, "free">,
  ) => {
    setError("");
    setBusyAction(plan ? `${action}:${plan}` : action);

    try {
      const response = await fetch(
        action === "checkout" ? "/api/billing/checkout" : "/api/billing/portal",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(plan ? { plan } : {}),
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Billing action failed.");
      }

      window.location.href = payload.url;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Billing action failed.");
      setBusyAction(null);
    }
  }, []);

  useEffect(() => {
    setBillingState(billing);
  }, [billing]);

  useEffect(() => {
    return () => {
      if (conversionRetryTimer.current) {
        window.clearTimeout(conversionRetryTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (hasAutoOpened.current || !isConfigured) return;
    if (billingResult === "success" || billingResult === "cancel") return;
    if (billingIntent !== "pro" && billingIntent !== "team") return;
    if (hasPaidPlan && billingState.plan === billingIntent) return;

    hasAutoOpened.current = true;
    void redirectToBilling("checkout", billingIntent);
  }, [billingIntent, billingResult, billingState.plan, hasPaidPlan, isConfigured, redirectToBilling]);

  useEffect(() => {
    if (billingResult !== "success" || hasSyncedSuccess.current) return;

    hasSyncedSuccess.current = true;
    setBusyAction("confirming");
    setError("");

    void (async () => {
      try {
        const query = sessionId
          ? `?session_id=${encodeURIComponent(sessionId)}`
          : upgradedPlan
            ? "?refresh=1"
            : "";
        const response = await fetch(`/api/billing/summary${query}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to confirm billing.");
        }

        setBillingState(payload.billing);
        trackSubscribeConversion(payload.billing);
        setConfirmationMessage(
          payload.billing.plan === "team"
            ? "Team plan confirmed. Shared workspaces and team tools are now unlocked."
            : payload.billing.plan === "pro"
              ? "Pro plan confirmed. Premium solo features are now unlocked."
              : "Payment was received, but the plan has not refreshed yet.",
        );
        router.refresh();
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Unable to confirm billing.",
        );
      } finally {
        setBusyAction(null);
      }
    })();
  }, [billingResult, router, sessionId, trackSubscribeConversion, upgradedPlan]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="teal">{effectivePlan.toUpperCase()}</Badge>
            <Badge tone={statusTone(billingState.status)}>
              {billingState.status.replaceAll("_", " ")}
            </Badge>
          </div>
          <div className="grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="font-semibold text-zinc-900">Current plan</p>
              <p className="mt-2">{BILLING_PLAN_COPY[effectivePlan].label}</p>
              <p className="mt-1 text-xs text-zinc-500">
                Member since {formatDate(memberSince)}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="font-semibold text-zinc-900">Renewal</p>
              <p className="mt-2">
                {billingState.currentPeriodEnd
                  ? formatDateTime(billingState.currentPeriodEnd)
                  : "No paid renewal date yet"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Customer{" "}
                {billingState.stripeCustomerId ? "connected to Stripe" : "not connected yet"}
              </p>
            </div>
          </div>

          {confirmationMessage ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900">
              {confirmationMessage}
            </div>
          ) : null}

          {billingResult === "cancel" ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm font-medium text-yellow-900">
              Checkout was canceled. No plan changes were made.
            </div>
          ) : null}

          {!isConfigured ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
              Stripe is not configured yet. Add `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`,
              `STRIPE_PRICE_TEAM`, and `STRIPE_WEBHOOK_SECRET` to enable checkout and
              subscription sync.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => redirectToBilling("checkout", "pro")}
              disabled={!isConfigured || busyAction !== null || effectivePlan === "pro"}
            >
              {busyAction === "confirming"
                ? "Confirming purchase..."
                : busyAction === "checkout:pro"
                ? "Opening checkout..."
                : effectivePlan === "pro"
                  ? "Current plan"
                  : hasPaidPlan
                    ? "Manage Pro in billing"
                    : "Upgrade to Pro"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => redirectToBilling("checkout", "team")}
              disabled={!isConfigured || busyAction !== null || effectivePlan === "team"}
            >
              {busyAction === "confirming"
                ? "Confirming purchase..."
                : busyAction === "checkout:team"
                ? "Opening checkout..."
                : effectivePlan === "team"
                  ? "Current plan"
                  : "Upgrade to Team"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => redirectToBilling("portal")}
              disabled={
                !isConfigured || !billingState.stripeCustomerId || busyAction !== null
              }
            >
              {busyAction === "portal" ? "Opening portal..." : "Manage or cancel billing"}
            </Button>
          </div>

          {isConfigured ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
              {effectivePlan === "pro" ? (
                <p>
                  You can stay on Pro, upgrade to Team, or open the billing portal to update
                  payment details or cancel the subscription.
                </p>
              ) : effectivePlan === "team" ? (
                <p>
                  Team is your current plan. Open the billing portal to update billing details
                  or cancel the subscription.
                </p>
              ) : (
                <p>
                  Start with Pro for premium solo features, or choose Team if you need shared
                  workspaces and team operations from day one.
                </p>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 p-4">
            <p className="font-semibold text-zinc-900">Free</p>
            <p className="mt-2 text-3xl font-black">$0</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              per month
            </p>
            <p className="mt-3 text-sm text-zinc-600">
              Single-user access and the core proposal workflow.
            </p>
          </div>
          {(["pro", "team"] as const).map((plan) => (
            <div
              key={plan}
              className={`rounded-lg border p-4 ${
                effectivePlan === plan ? "border-emerald-400 bg-emerald-50" : "border-zinc-200"
              }`}
            >
              <p className="font-semibold text-zinc-900">{BILLING_PLAN_COPY[plan].label}</p>
              <p className="mt-2 text-3xl font-black">{BILLING_PLAN_COPY[plan].monthlyPriceLabel}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                per month
              </p>
              <p className="mt-3 text-sm text-zinc-600">
                {plan === "pro"
                  ? "Unlimited proposal workspaces with billing enabled for solo operators."
                  : "Shared proposal operations with room for a growing delivery team."}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {showStorageAndData ? (
        <Card>
          <CardHeader>
            <CardTitle>Storage and data</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-zinc-600">
            <p>
              Uploaded files are stored in Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set.
              Without that token, ProposalDock keeps a local file copy under `data/uploads`.
            </p>
            <p>
              This keeps local development simple while giving us a clean path to production
              cloud storage without rewriting the upload flow.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
