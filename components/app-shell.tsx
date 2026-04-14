import Link from "next/link";
import { BarChart3, BriefcaseBusiness, Database, Settings } from "lucide-react";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app", label: "Dashboard", icon: BarChart3 },
  { href: "/app", label: "Workspaces", icon: BriefcaseBusiness },
  { href: "/app/knowledge-base", label: "Knowledge Base", icon: Database },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    activeOrganizationId: string;
    organizations: Array<{
      organizationId: string;
      organizationName: string;
      role: "owner" | "admin" | "member";
    }>;
  };
}) {
  return (
    <div className="min-h-screen bg-[#f6f7f9] text-zinc-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-zinc-200 bg-white p-5 lg:block">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-emerald-500 font-black text-zinc-950">
            PF
          </div>
          <div>
            <p className="font-bold tracking-tight">ProposalDock</p>
            <p className="text-xs text-zinc-500">Proposal operating system</p>
          </div>
        </Link>

        <nav className="mt-10 space-y-1">
          {nav.map((item, index) => (
            <Link
              key={`${item.label}-${index}`}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100",
                index === 0 && "bg-zinc-950 text-white hover:bg-zinc-900",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <OrganizationSwitcher
          organizations={user.organizations}
          activeOrganizationId={user.activeOrganizationId}
        />

        <div className="mt-10 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="font-semibold text-zinc-950">{user.name}</p>
          <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
          <form
            action="/api/auth/logout"
            method="post"
            className="mt-4"
          >
            <button className="text-sm font-semibold text-emerald-700">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="lg:pl-72">{children}</main>
    </div>
  );
}
