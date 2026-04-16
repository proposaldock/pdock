import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MarketingAnalyticsSettings({
  summary,
}: {
  summary: {
    totalLandingVisits: number;
    totalContactVisits: number;
    totalLeadSubmissions: number;
    totalSignups: number;
    recentLandingVisits: number;
    recentContactVisits: number;
    recentLeadSubmissions: number;
    recentSignups: number;
    convertedLeadUsers: number;
    leadToSignupConversionRate: number;
    totalProLeadSubmissions: number;
    totalTeamLeadSubmissions: number;
    totalProSignups: number;
    totalTeamSignups: number;
    totalStartFreeClicks: number;
    totalFirstWorkspaceStarts: number;
    totalFirstAnalysisCompleted: number;
    recentStartFreeClicks: number;
    recentFirstWorkspaceStarts: number;
    recentFirstAnalysisCompleted: number;
    trends: Array<{
      date: string;
      landingVisits: number;
      leadSubmissions: number;
      signups: number;
    }>;
  };
}) {
  const funnelSteps = [
    {
      label: "Landing visit",
      value: summary.totalLandingVisits,
      conversionFromPrevious: null,
    },
    {
      label: "Contact visit",
      value: summary.totalContactVisits,
      conversionFromPrevious: rate(summary.totalContactVisits, summary.totalLandingVisits),
    },
    {
      label: "Lead submission",
      value: summary.totalLeadSubmissions,
      conversionFromPrevious: rate(summary.totalLeadSubmissions, summary.totalContactVisits),
    },
    {
      label: "Signup",
      value: summary.totalSignups,
      conversionFromPrevious: rate(summary.totalSignups, summary.totalLeadSubmissions),
    },
  ] as const;

  const activationSteps = [
    {
      label: "Landing visit",
      value: summary.totalLandingVisits,
      recent: summary.recentLandingVisits,
      conversionFromPrevious: null,
    },
    {
      label: "Start free click",
      value: summary.totalStartFreeClicks,
      recent: summary.recentStartFreeClicks,
      conversionFromPrevious: rate(summary.totalStartFreeClicks, summary.totalLandingVisits),
    },
    {
      label: "Signup completed",
      value: summary.totalSignups,
      recent: summary.recentSignups,
      conversionFromPrevious: rate(summary.totalSignups, summary.totalStartFreeClicks),
    },
    {
      label: "First workspace started",
      value: summary.totalFirstWorkspaceStarts,
      recent: summary.recentFirstWorkspaceStarts,
      conversionFromPrevious: rate(summary.totalFirstWorkspaceStarts, summary.totalSignups),
    },
    {
      label: "First analysis completed",
      value: summary.totalFirstAnalysisCompleted,
      recent: summary.recentFirstAnalysisCompleted,
      conversionFromPrevious: rate(
        summary.totalFirstAnalysisCompleted,
        summary.totalFirstWorkspaceStarts,
      ),
    },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing analytics</CardTitle>
        <p className="text-sm text-zinc-600">
          A simple first-party view of public-site visits, lead capture, and signup conversion.
        </p>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <div>
            <p className="text-sm font-semibold text-emerald-950">Activation funnel</p>
            <p className="mt-1 text-sm leading-6 text-emerald-900">
              Platform-admin only. Tracks the first user journey from public visit to first
              completed analysis.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {activationSteps.map((step) => (
              <div key={step.label} className="rounded-lg border border-emerald-200 bg-white p-4">
                <p className="text-sm text-zinc-500">{step.label}</p>
                <p className="mt-2 text-2xl font-black text-zinc-950">{step.value}</p>
                <p className="mt-2 text-xs text-zinc-500">{step.recent} last 30d</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {step.conversionFromPrevious === null
                    ? "Top of activation funnel"
                    : `${step.conversionFromPrevious}% from previous step`}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Conversion funnel</p>
            <p className="mt-1 text-sm text-zinc-600">
              See where public-site visitors are dropping off between visit, contact, lead, and signup.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            {funnelSteps.map((step) => (
              <div key={step.label} className="rounded-lg border border-zinc-200 bg-white p-4">
                <p className="text-sm text-zinc-500">{step.label}</p>
                <p className="mt-2 text-2xl font-black text-zinc-950">{step.value}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  {step.conversionFromPrevious === null
                    ? "Top of funnel"
                    : `${step.conversionFromPrevious}% from previous step`}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <MetricCard label="Landing visits" value={summary.totalLandingVisits} secondary={`${summary.recentLandingVisits} last 30d`} />
          <MetricCard label="Contact visits" value={summary.totalContactVisits} secondary={`${summary.recentContactVisits} last 30d`} />
          <MetricCard label="Lead submissions" value={summary.totalLeadSubmissions} secondary={`${summary.recentLeadSubmissions} last 30d`} />
          <MetricCard label="Signups" value={summary.totalSignups} secondary={`${summary.recentSignups} last 30d`} />
          <MetricCard label="Lead conversion" value={`${summary.leadToSignupConversionRate}%`} secondary={`${summary.convertedLeadUsers} lead emails became users`} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Pro lead intent" value={summary.totalProLeadSubmissions} secondary="Lead submissions tagged Pro" />
          <MetricCard label="Team lead intent" value={summary.totalTeamLeadSubmissions} secondary="Lead submissions tagged Team" />
          <MetricCard label="Pro signups" value={summary.totalProSignups} secondary="Signup intent from Pro" />
          <MetricCard label="Team signups" value={summary.totalTeamSignups} secondary="Signup intent from Team" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <TrendCard
            label="Landing visits"
            tone="teal"
            series={summary.trends.map((item) => item.landingVisits)}
          />
          <TrendCard
            label="Lead submissions"
            tone="yellow"
            series={summary.trends.map((item) => item.leadSubmissions)}
          />
          <TrendCard
            label="Signups"
            tone="green"
            series={summary.trends.map((item) => item.signups)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="teal">First-party tracking only</Badge>
          <Badge tone="zinc">Daily deduped page visits</Badge>
          <Badge tone="yellow">Lead-to-signup conversion by email match</Badge>
          <Badge tone="green">Plan intent captured on lead and signup flows</Badge>
          <Badge tone="zinc">30-day daily trend view</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function rate(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function MetricCard({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string | number;
  secondary: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-zinc-950">{value}</p>
      <p className="mt-2 text-xs text-zinc-500">{secondary}</p>
    </div>
  );
}

function TrendCard({
  label,
  tone,
  series,
}: {
  label: string;
  tone: "teal" | "yellow" | "green";
  series: number[];
}) {
  const max = Math.max(...series, 1);
  const latest = series[series.length - 1] ?? 0;
  const previous = series[series.length - 2] ?? 0;
  const delta = latest - previous;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-900">{label}</p>
        <Badge tone={tone}>
          {latest} today
        </Badge>
      </div>
      <div className="mt-4 flex h-28 items-end gap-1">
        {series.map((value, index) => (
          <div
            key={`${label}-${index}`}
            className={`min-w-0 flex-1 rounded-sm ${
              tone === "teal"
                ? "bg-teal-300"
                : tone === "yellow"
                  ? "bg-yellow-300"
                  : "bg-emerald-300"
            }`}
            style={{ height: `${Math.max((value / max) * 100, value > 0 ? 10 : 4)}%` }}
            title={`${value}`}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        {delta === 0
          ? "Flat vs yesterday"
          : delta > 0
            ? `Up ${delta} vs yesterday`
            : `Down ${Math.abs(delta)} vs yesterday`}
      </p>
    </div>
  );
}
