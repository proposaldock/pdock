import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import { getWorkspace, updateWorkspaceReviewState } from "@/lib/store";
import type { WorkspaceReviewState } from "@/lib/types";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const { id } = await params;
    const workspace = await getWorkspace(id, user.id);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const body = (await request.json()) as {
      reviewState?: WorkspaceReviewState;
    };

    if (!body.reviewState) {
      return NextResponse.json(
        { error: "Review state is required." },
        { status: 400 },
      );
    }

    const updated = await updateWorkspaceReviewState(id, body.reviewState, user.id);
    return NextResponse.json({ workspace: updated });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save review state.",
      },
      { status: 500 },
    );
  }
}
