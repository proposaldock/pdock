import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import { updatePublicLeadForUser } from "@/lib/store";
import type { PublicLead } from "@/lib/types";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const { id } = await params;
    const body = (await request.json()) as {
      status?: PublicLead["status"];
      internalNotes?: string;
      assignedUserId?: string | null;
      nextFollowUpAt?: string | null;
    };

    if (
      body.status !== "new" &&
      body.status !== "contacted" &&
      body.status !== "qualified" &&
      body.status !== "closed"
    ) {
      return NextResponse.json({ error: "Invalid lead status." }, { status: 400 });
    }

    const lead = await updatePublicLeadForUser({
      userId: user.id,
      leadId: id,
      status: body.status,
      internalNotes: body.internalNotes ?? "",
      assignedUserId: body.assignedUserId ?? null,
      nextFollowUpAt: body.nextFollowUpAt ?? null,
    });

    return NextResponse.json({ lead });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to update lead.",
      },
      { status: 500 },
    );
  }
}
