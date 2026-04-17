import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import { getPlanEntitlements, getPlanGuardMessage } from "@/lib/entitlements";
import {
  deleteWorkspaceForUser,
  getUserAccountById,
  getWorkspace,
  updateWorkspaceMetadataForUser,
} from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const { id } = await params;
  const workspace = await getWorkspace(id, user.id);

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
  }

  return NextResponse.json({ workspace });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const account = await getUserAccountById(user.id);
    if (!account) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const { id } = await params;
    const body = (await request.json()) as {
      workspaceName?: string;
      clientName?: string;
      companyKnowledge?: string;
      instructions?: string;
      visibility?: "private" | "organization" | "selected";
      sharedUserIds?: string[];
    };
    const workspaceName = body.workspaceName?.trim();
    const clientName = body.clientName?.trim();
    const companyKnowledge = body.companyKnowledge?.trim();
    const instructions =
      typeof body.instructions === "string" ? body.instructions.trim() : undefined;
    const visibility = body.visibility;

    if (!workspaceName && !clientName && !companyKnowledge && instructions === undefined && !visibility) {
      return NextResponse.json(
        { error: "Workspace details or visibility are required." },
        { status: 400 },
      );
    }

    if (body.clientName !== undefined && !clientName) {
      return NextResponse.json({ error: "Client name is required." }, { status: 400 });
    }

    if (body.companyKnowledge !== undefined && !companyKnowledge) {
      return NextResponse.json(
        { error: "Approved company knowledge is required." },
        { status: 400 },
      );
    }

    if (
      visibility &&
      visibility !== "private" &&
      visibility !== "organization" &&
      visibility !== "selected"
    ) {
      return NextResponse.json({ error: "Invalid visibility." }, { status: 400 });
    }

    if (
      visibility &&
      visibility !== "private" &&
      !getPlanEntitlements(account.billing).canUseTeamFeatures
    ) {
      return NextResponse.json({ error: getPlanGuardMessage("team") }, { status: 403 });
    }

    const workspace = await updateWorkspaceMetadataForUser(
      id,
      {
        workspaceName,
        clientName,
        companyKnowledge,
        instructions,
        visibility,
        sharedUserIds: body.sharedUserIds,
      },
      user.id,
    );
    return NextResponse.json({ workspace });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to rename workspace.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const { id } = await params;
    await deleteWorkspaceForUser(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete workspace.",
      },
      { status: 500 },
    );
  }
}
