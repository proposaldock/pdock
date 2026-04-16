import { getCurrentUser } from "@/lib/auth";
import { isPlatformAdminEmail } from "@/lib/platform-admin";
import { getHealthChecks } from "@/lib/production-readiness";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const checks = getHealthChecks();
  const user = await getCurrentUser();
  const canSeeDetails = isPlatformAdminEmail(user?.email);
  const health = {
    ok: checks.authSecret && checks.anthropic && checks.appUrl,
    app: "ProposalDock",
    timestamp: new Date().toISOString(),
    checks,
  };

  return (
    <main className="min-h-screen bg-[#f4f6f7] px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-lg border border-zinc-200 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Status
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950">
          ProposalDock system status
        </h1>
        <div className="mt-6 flex flex-wrap gap-2">
          <span
            className={`rounded-lg px-3 py-1 text-sm font-semibold ${
              health.ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {health.ok ? "Core services configured" : "Launch checks still open"}
          </span>
          <span className="rounded-lg bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
            Updated {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(health.timestamp))}
          </span>
        </div>
        {canSeeDetails ? (
          <div className="mt-8 grid gap-3">
            {Object.entries(health.checks).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3"
              >
                <p className="text-sm font-medium text-zinc-900">{labelForCheck(key)}</p>
                <span
                  className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                    value ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"
                  }`}
                >
                  {value ? "Ready" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
            Detailed launch checks are only visible to ProposalDock admins.
          </p>
        )}
      </div>
    </main>
  );
}

function labelForCheck(key: string) {
  switch (key) {
    case "authSecret":
      return "Session secret";
    case "anthropic":
      return "Anthropic API";
    case "billing":
      return "Stripe billing";
    case "blobStorage":
      return "Cloud file storage";
    case "databaseIsHosted":
      return "Hosted database";
    case "appUrl":
      return "Public app URL";
    default:
      return key;
  }
}
