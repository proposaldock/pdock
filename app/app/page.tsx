import Link from "next/link";
import { ArrowRight, Plus, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardOverview } from "@/components/dashboard-overview";
import { requireCurrentUser } from "@/lib/auth";
import { listPublicLeadsForUser, listWorkspacesForUser } from "@/lib/store";

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const [workspaces, leads] = await Promise.all([
    listWorkspacesForUser(user.id),
    listPublicLeadsForUser(user.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Dashboard</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">
            Proposal workspaces
          </h1>
        </div>
        <Link href="/app/new">
          <Button variant="accent">
            <Plus className="size-4" />
            New workspace
          </Button>
        </Link>
      </div>

      <Card className="mt-8 border-zinc-200">
        <CardHeader>
          <CardTitle>Create new proposal workspace</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <p className="max-w-2xl text-sm leading-6 text-zinc-600">
            Add the RFP or client brief, paste approved company knowledge, and
            generate the first proposal analysis package.
          </p>
          <Link href="/app/new">
            <Button>
              Start analysis <ArrowRight className="size-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {workspaces.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center">
          <RotateCw className="mx-auto size-8 text-zinc-400" />
          <p className="mt-3 font-semibold">No workspaces yet</p>
          <p className="mt-1 text-sm text-zinc-600">
            Your analyzed proposal workspaces will appear here.
          </p>
        </div>
      ) : (
        <DashboardOverview workspaces={workspaces} leads={leads} />
      )}
    </div>
  );
}
