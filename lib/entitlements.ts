import type { BillingPlan, BillingStatus, UserBillingSummary } from "@/lib/types";

export type PlanEntitlements = {
  effectivePlan: BillingPlan;
  workspaceLimit: number;
  canUseKnowledgeBase: boolean;
  canExport: boolean;
  canUseTeamFeatures: boolean;
};

const BILLING_ACCESS_STATUSES = new Set<BillingStatus>([
  "active",
  "trialing",
  "past_due",
  "unpaid",
]);

function getForcedPlanOverride(): BillingPlan | null {
  const value = process.env.BETA_UNLOCK_PLAN?.trim().toLowerCase();

  if (value === "pro" || value === "team") {
    return value;
  }

  return null;
}

export function hasPaidBillingAccess(status: BillingStatus) {
  return BILLING_ACCESS_STATUSES.has(status);
}

export function getEffectivePlan(plan: BillingPlan, status: BillingStatus): BillingPlan {
  const forcedPlan = getForcedPlanOverride();
  if (forcedPlan) return forcedPlan;

  if (plan === "free") return "free";
  return hasPaidBillingAccess(status) ? plan : "free";
}

export function getPlanEntitlements(billing: UserBillingSummary): PlanEntitlements {
  const effectivePlan = getEffectivePlan(billing.plan, billing.status);

  switch (effectivePlan) {
    case "team":
      return {
        effectivePlan,
        workspaceLimit: Number.POSITIVE_INFINITY,
        canUseKnowledgeBase: true,
        canExport: true,
        canUseTeamFeatures: true,
      };
    case "pro":
      return {
        effectivePlan,
        workspaceLimit: Number.POSITIVE_INFINITY,
        canUseKnowledgeBase: true,
        canExport: true,
        canUseTeamFeatures: false,
      };
    default:
      return {
        effectivePlan: "free",
        workspaceLimit: 1,
        canUseKnowledgeBase: false,
        canExport: false,
        canUseTeamFeatures: false,
      };
  }
}

export function getPlanGuardMessage(feature: "knowledge_base" | "exports" | "team" | "workspace_limit") {
  switch (feature) {
    case "knowledge_base":
      return "Knowledge Base is available on Pro and Team plans.";
    case "exports":
      return "DOCX exports are available on Pro and Team plans.";
    case "team":
      return "Shared team features are available on the Team plan.";
    case "workspace_limit":
      return "Free accounts can keep one workspace. Upgrade to Pro for unlimited workspaces.";
    default:
      return "Upgrade your plan to use this feature.";
  }
}
