import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import { appendWorkspaceActivity, createActivityEntry, getWorkspace } from "@/lib/store";
import { buildWorkspaceExportDocx, getExportFilename } from "@/lib/workspace-export";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

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
