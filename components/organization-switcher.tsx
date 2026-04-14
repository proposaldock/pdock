"use client";

import { useRouter } from "next/navigation";

type OrganizationOption = {
  organizationId: string;
  organizationName: string;
  role: "owner" | "admin" | "member";
};

export function OrganizationSwitcher({
  organizations,
  activeOrganizationId,
}: {
  organizations: OrganizationOption[];
  activeOrganizationId: string;
}) {
  const router = useRouter();

  async function handleChange(nextOrganizationId: string) {
    if (!nextOrganizationId || nextOrganizationId === activeOrganizationId) return;

    const response = await fetch("/api/organizations/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: nextOrganizationId }),
    });

    if (!response.ok) {
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Active team</p>
      <select
        value={activeOrganizationId}
        onChange={(event) => void handleChange(event.target.value)}
        className="mt-3 h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-500"
      >
        {organizations.map((organization) => (
          <option key={organization.organizationId} value={organization.organizationId}>
            {organization.organizationName} ({organization.role})
          </option>
        ))}
      </select>
    </div>
  );
}
