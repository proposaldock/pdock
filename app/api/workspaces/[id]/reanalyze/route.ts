import { NextResponse } from "next/server";
import { AIServiceError, analyzeProposal } from "@/lib/anthropic";
import { requireApiUser } from "@/lib/authz";
import { createActivityEntry, getWorkspace, saveWorkspace } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
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

    const analysis = await analyzeProposal(workspace);
    const updated = {
      ...workspace,
      analysis,
      activityLog: [
        createActivityEntry(
          "analysis_rerun",
          "Analysis re-run completed",
          "ProposalDock refreshed the workspace analysis.",
        ),
        ...workspace.activityLog,
      ],
      updatedAt: new Date().toISOString(),
    };

    await saveWorkspace(updated, user.id);
    return NextResponse.json({ workspace: updated });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Re-analysis failed. Please retry.",
      },
      { status: error instanceof AIServiceError ? error.status : 500 },
    );
  }
}
