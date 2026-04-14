import type { BillingPlan } from "@/lib/types";

type BillingPlanConfig = {
  label: string;
  monthlyPriceLabel: string;
};

export const BILLING_PLAN_COPY: Record<BillingPlan, BillingPlanConfig> = {
  free: {
    label: "Free",
    monthlyPriceLabel: "$0",
  },
  pro: {
    label: "Pro",
    monthlyPriceLabel: "$49",
  },
  team: {
    label: "Team",
    monthlyPriceLabel: "$149",
  },
};
