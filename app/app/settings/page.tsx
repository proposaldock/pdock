import { notFound } from "next/navigation";
import { BetaOpsOverview } from "@/components/beta-ops-overview";
import { BillingSettings } from "@/components/billing-settings";
import { MarketingAnalyticsSettings } from "@/components/marketing-analytics-settings";
import { ProductionEnvSettings } from "@/components/production-env-settings";
import { ProductionReadinessSettings } from "@/components/production-readiness-settings";
import { PublicLeadsSettings } from "@/components/public-leads-settings";
import { TeamSettings } from "@/components/team-settings";
import { requireCurrentUser } from "@/lib/auth";
import { isBillingConfigured } from "@/lib/billing";
import { getPlanEntitlements } from "@/lib/entitlements";
import { getMarketingSummary } from "@/lib/marketing-analytics";
import { isPlatformAdminEmail } from "@/lib/platform-admin";
import { getProductionReadinessSummary } from "@/lib/production-readiness";
import {
  getUserAccountById,
  listOrganizationTeamForUser,
  listPublicLeadsForUser,
} from "@/lib/store";

export default async function SettingsPage() {
  const sessionUser = await requireCurrentUser();
  const [user, team, leads, marketingSummary] = await Promise.all([
    getUserAccountById(sessionUser.id),
    listOrganizationTeamForUser(sessionUser.id),
    listPublicLeadsForUser(sessionUser.id),
    getMarketingSummary(),
  ]);
  const readinessSummary = getProductionReadinessSummary();

  if (!user) {
    notFound();
  }

  const entitlements = getPlanEntitlements(user.billing);
  const isPlatformAdmin = isPlatformAdminEmail(user.email);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <p className="text-sm font-semibold text-emerald-700">Settings</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight">Billing, account, and team</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
        Manage your private beta account, Stripe billing, team access, and production-facing storage setup.
      </p>

      {isPlatformAdmin ? (
        <div className="mt-8">
          <BetaOpsOverview
            summary={marketingSummary}
            leads={leads}
            currentUserRole={team.currentUserRole}
            initialNotes={team.betaOpsNotes ?? ""}
            initialTimeline={team.betaOpsTimeline ?? []}
          />
        </div>
      ) : null}

      {isPlatformAdmin ? (
        <>
          <div className="mt-8">
            <ProductionReadinessSettings summary={readinessSummary} />
          </div>

          <div className="mt-8">
            <ProductionEnvSettings />
          </div>
        </>
      ) : null}

      <div className="mt-8" id="billing">
        <BillingSettings
          billing={user.billing}
          isConfigured={isBillingConfigured()}
          memberSince={user.createdAt.toISOString()}
        />
      </div>

      <div className="mt-8" id="team-settings">
        <TeamSettings
          initialTeam={team}
          canUseTeamFeatures={entitlements.canUseTeamFeatures}
          effectivePlan={entitlements.effectivePlan}
        />
      </div>

      {isPlatformAdmin ? (
        <div className="mt-8" id="marketing-analytics">
          <MarketingAnalyticsSettings summary={marketingSummary} />
        </div>
      ) : null}

      {isPlatformAdmin ? (
        <div className="mt-8" id="inbound-leads">
          <PublicLeadsSettings
            initialLeads={leads}
            currentUserRole={team.currentUserRole}
            teamMembers={team.members}
          />
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
          Internal operating panels are only visible to the ProposalDock platform admin.
        </div>
      )}
    </div>
  );
}
