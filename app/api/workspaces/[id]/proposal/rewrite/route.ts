import { NextResponse } from "next/server";
import { AIServiceError, rewriteProposalSection } from "@/lib/anthropic";
import { requireApiUser } from "@/lib/authz";
import { getWorkspace } from "@/lib/store";
import type { ProposalRewriteMode } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(
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
      sectionId?: string;
      mode?: ProposalRewriteMode;
    };

    if (!body.sectionId || !body.mode) {
      return NextResponse.json(
        { error: "Section id and rewrite mode are required." },
        { status: 400 },
      );
    }

    const section = workspace.proposalState.sections.find(
      (item) => item.id === body.sectionId,
    );

    if (!section) {
      return NextResponse.json({ error: "Section not found." }, { status: 404 });
    }

    const rewritten = await rewriteProposalSection({
      workspace,
      section,
      mode: body.mode,
    });

    return NextResponse.json({ rewritten });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to rewrite proposal section.",
      },
      { status: error instanceof AIServiceError ? error.status : 500 },
    );
  }
}
