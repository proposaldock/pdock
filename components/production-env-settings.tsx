import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const productionEnvTemplate = `APP_URL=https://your-domain
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/proposaldock
POSTGRES_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/proposaldock
SQLITE_DATABASE_URL=file:./prisma/dev.db
AUTH_SECRET=replace_with_a_long_random_secret
ANTHROPIC_API_KEY=your_production_anthropic_key
ANTHROPIC_MODEL=claude-sonnet-4-6
BLOB_READ_WRITE_TOKEN=your_blob_token
STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_TEAM=price_...
SENTRY_DSN=https://...`;

export function ProductionEnvSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Production environment checklist</CardTitle>
        <p className="text-sm text-zinc-600">
          These are the exact environment variables ProposalDock expects when you move from local beta to production.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone="red">APP_URL</Badge>
          <Badge tone="red">DATABASE_URL</Badge>
          <Badge tone="red">AUTH_SECRET</Badge>
          <Badge tone="red">ANTHROPIC_API_KEY</Badge>
          <Badge tone="yellow">BLOB_READ_WRITE_TOKEN</Badge>
          <Badge tone="yellow">Stripe envs</Badge>
          <Badge tone="zinc">SENTRY_DSN</Badge>
        </div>
        <div className="flex justify-end">
          <CopyButton text={productionEnvTemplate} />
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-4">
          <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-zinc-100">
            {productionEnvTemplate}
          </pre>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
          Use `db:generate:postgres`, `db:push:postgres`, and `db:migrate:sqlite-to-postgres` when you are ready to move data into hosted Postgres without disturbing your local SQLite setup.
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-600">
          Final launch runbook:
          {" "}
          <a
            href="/launch-checklist"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            open checklist
          </a>
          {" "}
          and
          {" "}
          <span className="font-mono text-zinc-800">docs/production-launch-runbook.md</span>
          {" "}
          for the full manual sequence.
        </div>
      </CardContent>
    </Card>
  );
}
