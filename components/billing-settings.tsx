"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BILLING_PLAN_COPY } from "@/lib/billing-plans";
import type { BillingPlan, UserBillingSummary } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";

type BillingSettingsProps = {
  billing: UserBillingSummary;
  isConfigured: boolean;
  memberSince: string;
};

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
}: BillingSettingsProps) {
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  async function redirectToBilling(
    action: "checkout" | "portal",
    plan?: Exclude<BillingPlan, "free">,
  ) {
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
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="teal">{billing.plan.toUpperCase()}</Badge>
            <Badge tone={statusTone(billing.status)}>{billing.status.replaceAll("_", " ")}</Badge>
          </div>
          <div className="grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="font-semibold text-zinc-900">Current plan</p>
              <p className="mt-2">{BILLING_PLAN_COPY[billing.plan].label}</p>
              <p className="mt-1 text-xs text-zinc-500">
                Member since {formatDate(memberSince)}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="font-semibold text-zinc-900">Renewal</p>
              <p className="mt-2">
                {billing.currentPeriodEnd
                  ? formatDateTime(billing.currentPeriodEnd)
                  : "No paid renewal date yet"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Customer {billing.stripeCustomerId ? "connected to Stripe" : "not connected yet"}
              </p>
            </div>
          </div>

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
              disabled={!isConfigured || busyAction !== null}
            >
              {busyAction === "checkout:pro" ? "Opening checkout..." : "Upgrade to Pro"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => redirectToBilling("checkout", "team")}
              disabled={!isConfigured || busyAction !== null}
            >
              {busyAction === "checkout:team" ? "Opening checkout..." : "Upgrade to Team"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => redirectToBilling("portal")}
              disabled={!isConfigured || !billing.stripeCustomerId || busyAction !== null}
            >
              {busyAction === "portal" ? "Opening portal..." : "Manage billing"}
            </Button>
          </div>
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
            <p className="mt-3 text-sm text-zinc-600">
              Single-user beta access and the core proposal workflow.
            </p>
          </div>
          {(["pro", "team"] as const).map((plan) => (
            <div
              key={plan}
              className={`rounded-lg border p-4 ${
                billing.plan === plan ? "border-emerald-400 bg-emerald-50" : "border-zinc-200"
              }`}
            >
              <p className="font-semibold text-zinc-900">{BILLING_PLAN_COPY[plan].label}</p>
              <p className="mt-2 text-3xl font-black">{BILLING_PLAN_COPY[plan].monthlyPriceLabel}</p>
              <p className="mt-3 text-sm text-zinc-600">
                {plan === "pro"
                  ? "Unlimited proposal workspaces with billing enabled for solo operators."
                  : "Shared proposal operations with room for a growing delivery team."}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

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
    </div>
  );
}
