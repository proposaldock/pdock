"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Database,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app#workspaces", label: "Workspaces", icon: BriefcaseBusiness },
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
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const updateHash = () => {
      setHash(window.location.hash.replace("#", ""));
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);

    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const activeHref = useMemo(() => {
    if (pathname.startsWith("/app/workspaces/")) return "/app#workspaces";
    if (pathname === "/app" && hash === "workspaces") return "/app#workspaces";
    if (pathname.startsWith("/app/knowledge-base")) return "/app/knowledge-base";
    if (pathname.startsWith("/app/settings")) return "/app/settings";
    return "/app";
  }, [hash, pathname]);

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-zinc-950">
      <div className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-500 font-black text-zinc-950">
              PD
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold tracking-tight">ProposalDock</p>
              <p className="truncate text-xs text-zinc-500">Proposal operating system</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen((current) => !current)}
            className="grid size-10 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700"
            aria-expanded={isMobileNavOpen}
            aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
          >
            {isMobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        <div className="overflow-x-auto border-t border-zinc-100 px-4 py-3">
          <div className="flex min-w-max gap-2">
            {nav.map((item) => {
              const isActive = activeHref === item.href;

              return (
                <Link
                  key={`mobile-${item.href}`}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium whitespace-nowrap transition",
                    isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-zinc-200 bg-white text-zinc-700",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {isMobileNavOpen ? (
          <div className="border-t border-zinc-200 px-4 py-4">
            <OrganizationSwitcher
              organizations={user.organizations}
              activeOrganizationId={user.activeOrganizationId}
              compact
            />

            <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="font-semibold text-zinc-950">{user.name}</p>
              <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
              <form action="/api/auth/logout" method="post" className="mt-4">
                <button className="text-sm font-semibold text-emerald-700">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-zinc-200 bg-white p-5 lg:block">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-emerald-500 font-black text-zinc-950">
            PD
          </div>
          <div>
            <p className="font-bold tracking-tight">ProposalDock</p>
            <p className="text-xs text-zinc-500">Proposal operating system</p>
          </div>
        </Link>

        <nav className="mt-10 space-y-1">
          {nav.map((item, index) => {
            const isActive = activeHref === item.href;

            return (
            <Link
              key={`${item.label}-${index}`}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm"
                  : "border-transparent text-zinc-700 hover:border-zinc-200 hover:bg-zinc-100",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )})}
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
