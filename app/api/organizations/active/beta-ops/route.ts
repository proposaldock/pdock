import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { updateActiveOrganizationBetaOpsNotes } from "@/lib/store";

export async function PATCH(request: Request) {
  const user = await requireCurrentUser();

  try {
    const body = (await request.json()) as {
      notes?: string;
    };

    const updated = await updateActiveOrganizationBetaOpsNotes({
      userId: user.id,
      notes: body.notes ?? "",
    });

    return NextResponse.json({
      betaOpsNotes: updated.betaOpsNotes,
      betaOpsTimeline: updated.betaOpsTimeline,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update beta ops notes.",
      },
      { status: 400 },
    );
  }
}
