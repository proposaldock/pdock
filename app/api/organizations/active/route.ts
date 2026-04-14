import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import { setActiveOrganizationForUser } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const body = (await request.json()) as { organizationId?: string };
    const organizationId = body.organizationId?.trim() ?? "";

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization id is required." },
        { status: 400 },
      );
    }

    const organizationContext = await setActiveOrganizationForUser(
      user.id,
      organizationId,
    );

    return NextResponse.json({ organizationContext });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to switch organization.",
      },
      { status: 500 },
    );
  }
}
