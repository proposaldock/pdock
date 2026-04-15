import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import { getPlanEntitlements, getPlanGuardMessage } from "@/lib/entitlements";
import { getUserAccountById, removeOrganizationInvite } from "@/lib/store";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ inviteId: string }> },
) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const account = await getUserAccountById(user.id);
    if (!account) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (!getPlanEntitlements(account.billing).canUseTeamFeatures) {
      return NextResponse.json({ error: getPlanGuardMessage("team") }, { status: 403 });
    }

    const { inviteId } = await params;
    const team = await removeOrganizationInvite({
      currentUserId: user.id,
      inviteId,
    });

    return NextResponse.json({ team });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel invite." },
      { status: 500 },
    );
  }
}
