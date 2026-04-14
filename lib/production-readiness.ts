import { isBillingConfigured } from "@/lib/billing";

type ReadinessCheck = {
  id: string;
  label: string;
  status: "ready" | "attention";
  detail: string;
  critical: boolean;
};

export function getProductionReadinessSummary() {
  const appUrl = process.env.APP_URL?.trim() ?? "";
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  const checks: ReadinessCheck[] = [
    {
      id: "app_url",
      label: "Public app URL",
      status: appUrl ? "ready" : "attention",
      detail: appUrl
        ? `Using ${appUrl}`
        : "Set APP_URL before launch so redirects, billing, and metadata use the production domain.",
      critical: true,
    },
    {
      id: "auth_secret",
      label: "Session secret",
      status: process.env.AUTH_SECRET ? "ready" : "attention",
      detail: process.env.AUTH_SECRET
        ? "AUTH_SECRET is present."
        : "Add a long AUTH_SECRET for production sessions.",
      critical: true,
    },
    {
      id: "anthropic",
      label: "Anthropic analysis",
      status: process.env.ANTHROPIC_API_KEY ? "ready" : "attention",
      detail: process.env.ANTHROPIC_API_KEY
        ? "Anthropic API key is configured."
        : "Add ANTHROPIC_API_KEY before opening analysis to users.",
      critical: true,
    },
    {
      id: "database",
      label: "Managed database",
      status:
        databaseUrl && !databaseUrl.startsWith("file:") ? "ready" : "attention",
      detail:
        databaseUrl && !databaseUrl.startsWith("file:")
          ? "Database URL points to a non-local database."
          : "DATABASE_URL still points at local SQLite. Move to hosted Postgres before public traffic.",
      critical: true,
    },
    {
      id: "storage",
      label: "Cloud file storage",
      status: process.env.BLOB_READ_WRITE_TOKEN ? "ready" : "attention",
      detail: process.env.BLOB_READ_WRITE_TOKEN
        ? "Cloud storage token is configured."
        : "BLOB_READ_WRITE_TOKEN is missing, so uploads still fall back to local disk.",
      critical: true,
    },
    {
      id: "billing",
      label: "Stripe billing",
      status: isBillingConfigured() ? "ready" : "attention",
      detail: isBillingConfigured()
        ? "Stripe secret key and plan price IDs are configured."
        : "Finish Stripe env setup before opening paid plans.",
      critical: false,
    },
    {
      id: "monitoring",
      label: "Error monitoring",
      status: process.env.SENTRY_DSN ? "ready" : "attention",
      detail: process.env.SENTRY_DSN
        ? "SENTRY_DSN is configured."
        : "Add SENTRY_DSN or another monitoring destination before launch.",
      critical: false,
    },
  ];

  const criticalReady = checks.filter((check) => check.critical && check.status === "ready").length;
  const criticalTotal = checks.filter((check) => check.critical).length;
  const readyCount = checks.filter((check) => check.status === "ready").length;

  return {
    checks,
    readyCount,
    totalCount: checks.length,
    criticalReady,
    criticalTotal,
    publicLaunchReady: criticalReady === criticalTotal,
  };
}
