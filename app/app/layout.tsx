import { AppShell } from "@/components/app-shell";
import { requireCurrentUser } from "@/lib/auth";
import { getUserAccountById } from "@/lib/store";

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await requireCurrentUser();
  const user = await getUserAccountById(sessionUser.id);

  if (!user) {
    return null;
  }

  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
        activeOrganizationId: user.organization.organizationId,
        organizations: user.organizations,
      }}
    >
      {children}
    </AppShell>
  );
}
