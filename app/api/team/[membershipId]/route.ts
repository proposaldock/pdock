import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import { removeOrganizationMember, updateOrganizationMemberRole } from "@/lib/store";
import type { TeamRole } from "@/lib/types";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ membershipId: string }> },
) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const { membershipId } = await params;
    const body = (await request.json()) as { role?: TeamRole };

    if (body.role !== "admin" && body.role !== "member" && body.role !== "owner") {
      return NextResponse.json({ error: "Role is required." }, { status: 400 });
    }

    const team = await updateOrganizationMemberRole({
      currentUserId: user.id,
      membershipId,
      role: body.role,
    });

    return NextResponse.json({ team });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update member." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ membershipId: string }> },
) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const { membershipId } = await params;
    const team = await removeOrganizationMember({
      currentUserId: user.id,
      membershipId,
    });

    return NextResponse.json({ team });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove member." },
      { status: 500 },
    );
  }
}
