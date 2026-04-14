import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import { addOrganizationMemberByEmail, listOrganizationTeamForUser } from "@/lib/store";
import type { TeamRole } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const team = await listOrganizationTeamForUser(user.id);
  return NextResponse.json({ team });
}

export async function POST(request: Request) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const body = (await request.json()) as {
      email?: string;
      role?: TeamRole;
    };

    const email = body.email?.trim().toLowerCase() ?? "";
    const role = body.role;

    if (!email || (role !== "owner" && role !== "admin" && role !== "member")) {
      return NextResponse.json(
        { error: "Email and role are required." },
        { status: 400 },
      );
    }

    const team = await addOrganizationMemberByEmail({
      currentUserId: user.id,
      email,
      role,
    });

    return NextResponse.json({ team });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update team." },
      { status: 500 },
    );
  }
}
