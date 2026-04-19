import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import { getPlanEntitlements, getPlanGuardMessage } from "@/lib/entitlements";
import { isPlatformAdminEmail } from "@/lib/platform-admin";
import {
  appendWorkspaceActivity,
  createActivityEntry,
  getUserAccountById,
  getWorkspace,
} from "@/lib/store";
import { buildWorkspaceExportDocx, getExportFilename } from "@/lib/workspace-export";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireApiUser();
  if (!user) return response;
  const account = await getUserAccountById(user.id);
  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const canExport =
    getPlanEntitlements(account.billing).canExport ||
    isPlatformAdminEmail(account.email);
  if (!canExport) {
    return NextResponse.json({ error: getPlanGuardMessage("exports") }, { status: 403 });
  }

  const { id } = await params;
  const workspace = await getWorkspace(id, user.id);

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (type !== "summary" && type !== "matrix" && type !== "answers" && type !== "pack") {
    return NextResponse.json({ error: "Invalid export type." }, { status: 400 });
  }

  const buffer = await buildWorkspaceExportDocx(workspace, type);
  const filename = getExportFilename(workspace, type);
  await appendWorkspaceActivity(id, [
    createActivityEntry(
      "proposal_exported",
      "DOCX exported",
      `${type.toUpperCase()} export downloaded.`,
    ),
  ], user.id);

  return new NextResponse(buffer as BodyInit, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
