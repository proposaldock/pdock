import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import { parseUploadedDocument } from "@/lib/document-parser";
import { getPlanEntitlements, getPlanGuardMessage } from "@/lib/entitlements";
import { storeUploadedFile } from "@/lib/file-storage";
import {
  createKnowledgeAsset,
  getUserAccountById,
  listKnowledgeAssetsForUser,
} from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const account = await getUserAccountById(user.id);
  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const entitlements = getPlanEntitlements(account.billing);
  if (!entitlements.canUseKnowledgeBase) {
    return NextResponse.json({ assets: [] });
  }

  const assets = await listKnowledgeAssetsForUser(user.id);
  return NextResponse.json({ assets });
}

export async function POST(request: Request) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const account = await getUserAccountById(user.id);
    if (!account) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const entitlements = getPlanEntitlements(account.billing);
    if (!entitlements.canUseKnowledgeBase) {
      return NextResponse.json(
        { error: getPlanGuardMessage("knowledge_base") },
        { status: 403 },
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let title = "";
    let category = "";
    let content = "";
    let fileSize: number | null = null;
    let sourceFilename: string | null = null;
    let sourceMimeType: string | null = null;
    let sourceKind: "manual" | "upload" = "manual";
    let storageProvider: "local" | "vercel_blob" | null = null;
    let storagePath: string | null = null;
    let storageUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = String(formData.get("title") ?? "").trim();
      category = String(formData.get("category") ?? "").trim();
      content = String(formData.get("content") ?? "").trim();
      const file = formData.get("file");

      if (file instanceof File && file.size > 0) {
        const parsed = await parseUploadedDocument(file);
        const stored = await storeUploadedFile(file, {
          folder: "knowledge-assets",
        });
        content = parsed.content;
        fileSize = stored.fileSize;
        sourceFilename = parsed.filename;
        sourceMimeType = parsed.mimeType;
        sourceKind = "upload";
        storageProvider = stored.storageProvider;
        storagePath = stored.storagePath;
        storageUrl = stored.storageUrl;
        if (!title) title = parsed.filename.replace(/\.[^.]+$/, "");
      }
    } else {
      const body = (await request.json()) as {
        title?: string;
        category?: string;
        content?: string;
      };

      title = body.title?.trim() ?? "";
      category = body.category?.trim() ?? "";
      content = body.content?.trim() ?? "";
    }

    if (!title || !category || !content) {
      return NextResponse.json(
        { error: "Title, category, and content are required." },
        { status: 400 },
      );
    }

    const asset = await createKnowledgeAsset({
      title,
      category,
      content,
      fileSize,
      sourceFilename,
      sourceMimeType,
      sourceKind,
      storageProvider,
      storagePath,
      storageUrl,
    }, user.id);
    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create asset.",
      },
      { status: 500 },
    );
  }
}
