import Link from "next/link";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReadinessSummary = ReturnType<typeof import("@/lib/production-readiness").getProductionReadinessSummary>;

export function ProductionReadinessSettings({
  summary,
}: {
  summary: ReadinessSummary;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Production readiness</CardTitle>
            <p className="mt-2 text-sm text-zinc-600">
              A simple launch checklist for deploy, storage, billing, monitoring, and legal basics.
            </p>
          </div>
          <Badge tone={summary.publicLaunchReady ? "green" : "yellow"}>
            {summary.publicLaunchReady ? "Public launch ready" : "Needs final setup"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Checks ready"
            value={`${summary.readyCount}/${summary.totalCount}`}
            tone="teal"
          />
          <MetricCard
            label="Critical launch checks"
            value={`${summary.criticalReady}/${summary.criticalTotal}`}
            tone={summary.criticalReady === summary.criticalTotal ? "green" : "yellow"}
          />
          <MetricCard
            label="Launch risk"
            value={summary.publicLaunchReady ? "Low" : "Open"}
            tone={summary.publicLaunchReady ? "green" : "red"}
          />
        </div>

        <div className="grid gap-3">
          {summary.checks.map((check) => (
            <div
              key={check.id}
              className="rounded-lg border border-zinc-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-zinc-950">{check.label}</p>
                <Badge tone={check.status === "ready" ? "green" : "yellow"}>
                  {check.status === "ready" ? "Ready" : "Needs setup"}
                </Badge>
                {check.critical ? <Badge tone="zinc">Critical</Badge> : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{check.detail}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-zinc-900">Launch guidance</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                For a public beta, finish the critical checks first, then verify the public journey end to end:
                landing, signup, billing, first workspace, upload, analysis, and export.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/privacy" target="_blank">
              <LaunchLink label="Privacy policy" />
            </Link>
            <Link href="/terms" target="_blank">
              <LaunchLink label="Terms of service" />
            </Link>
            <Link href="/launch-checklist" target="_blank">
              <LaunchLink label="Launch checklist" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "teal" | "green" | "yellow" | "red";
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-zinc-950">{value}</p>
      <Badge tone={tone} className="mt-3">
        {tone === "green"
          ? "Ready"
          : tone === "teal"
            ? "In motion"
            : tone === "yellow"
              ? "Pending"
              : "Attention"}
      </Badge>
    </div>
  );
}

function LaunchLink({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700">
      {label}
      <ExternalLink className="size-4" />
    </span>
  );
}
