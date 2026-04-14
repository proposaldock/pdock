import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const root = process.cwd();

loadEnvFile(path.join(root, ".env"));
loadEnvFile(path.join(root, ".env.local"));

const checks = [
  {
    id: "app_url",
    label: "Public app URL",
    critical: true,
    isReady: () => Boolean(process.env.APP_URL?.trim()),
    detail: () =>
      process.env.APP_URL?.trim()
        ? `Using ${process.env.APP_URL.trim()}`
        : "Missing APP_URL",
    nextStep: "Set APP_URL to your real ProposalDock domain in Vercel.",
  },
  {
    id: "database",
    label: "Hosted database",
    critical: true,
    isReady: () =>
      Boolean(
        process.env.DATABASE_URL?.trim() &&
          !process.env.DATABASE_URL.startsWith("file:"),
      ),
    detail: () =>
      process.env.DATABASE_URL?.trim() &&
      !process.env.DATABASE_URL.startsWith("file:")
        ? "DATABASE_URL points to a non-local database."
        : "DATABASE_URL still points to local SQLite.",
    nextStep: "Set DATABASE_URL to your hosted Postgres connection string.",
  },
  {
    id: "anthropic",
    label: "Anthropic API",
    critical: true,
    isReady: () => Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
    detail: () =>
      process.env.ANTHROPIC_API_KEY?.trim()
        ? "Anthropic API key is present."
        : "Missing ANTHROPIC_API_KEY",
    nextStep: "Create a production Anthropic key and add ANTHROPIC_API_KEY.",
  },
  {
    id: "auth_secret",
    label: "Session secret",
    critical: true,
    isReady: () => Boolean(process.env.AUTH_SECRET?.trim()),
    detail: () =>
      process.env.AUTH_SECRET?.trim()
        ? "AUTH_SECRET is present."
        : "Missing AUTH_SECRET",
    nextStep: "Generate and store a long random AUTH_SECRET.",
  },
  {
    id: "storage",
    label: "Cloud file storage",
    critical: true,
    isReady: () => Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim()),
    detail: () =>
      process.env.BLOB_READ_WRITE_TOKEN?.trim()
        ? "Blob storage token is present."
        : "Missing BLOB_READ_WRITE_TOKEN",
    nextStep: "Create a Vercel Blob store and add BLOB_READ_WRITE_TOKEN.",
  },
  {
    id: "stripe",
    label: "Stripe billing",
    critical: false,
    isReady: () =>
      Boolean(
        process.env.STRIPE_SECRET_KEY?.trim() &&
          process.env.STRIPE_PRICE_PRO?.trim() &&
          process.env.STRIPE_PRICE_TEAM?.trim() &&
          process.env.STRIPE_WEBHOOK_SECRET?.trim(),
      ),
    detail: () =>
      process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_PRICE_PRO?.trim() &&
      process.env.STRIPE_PRICE_TEAM?.trim() &&
      process.env.STRIPE_WEBHOOK_SECRET?.trim()
        ? "Stripe keys, prices, and webhook secret are present."
        : "Stripe env configuration is incomplete.",
    nextStep:
      "Add STRIPE_SECRET_KEY, STRIPE_PRICE_PRO, STRIPE_PRICE_TEAM, and STRIPE_WEBHOOK_SECRET.",
  },
  {
    id: "monitoring",
    label: "Error monitoring",
    critical: false,
    isReady: () => Boolean(process.env.SENTRY_DSN?.trim()),
    detail: () =>
      process.env.SENTRY_DSN?.trim()
        ? "SENTRY_DSN is present."
        : "Missing SENTRY_DSN",
    nextStep: "Set SENTRY_DSN or decide on another monitoring destination.",
  },
];

const results = checks.map((check) => ({
  ...check,
  ready: check.isReady(),
  message: check.detail(),
}));

const criticalTotal = results.filter((item) => item.critical).length;
const criticalReady = results.filter((item) => item.critical && item.ready).length;
const totalReady = results.filter((item) => item.ready).length;
const productionReady = criticalReady === criticalTotal;

console.log("");
console.log("ProposalDock launch preflight");
console.log("============================");
console.log("");
console.log(
  `Critical checks: ${criticalReady}/${criticalTotal} | All checks: ${totalReady}/${results.length}`,
);
console.log(
  `Status: ${productionReady ? "READY FOR FINAL VALIDATION" : "NOT READY FOR PUBLIC LAUNCH"}`,
);
console.log("");

for (const result of results) {
  console.log(
    `${result.ready ? "[ready]" : "[open] "} ${result.label}${result.critical ? " (critical)" : ""}`,
  );
  console.log(`  ${result.message}`);
  if (!result.ready) {
    console.log(`  Next: ${result.nextStep}`);
  }
}

const remaining = results.filter((item) => !item.ready);
if (remaining.length) {
  console.log("");
  console.log("Open manual actions");
  console.log("-------------------");
  remaining.forEach((item, index) => {
    console.log(`${index + 1}. ${item.nextStep}`);
  });
}

console.log("");

function loadEnvFile(filepath) {
  if (!fs.existsSync(filepath)) return;
  dotenv.config({ path: filepath, override: false });
}
