import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { assertUploadFileAllowed } from "@/lib/upload-policy";

type StoredFile = {
  fileSize: number;
  storagePath: string;
  storageProvider: "local" | "vercel_blob";
  storageUrl: string | null;
};

function sanitizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function storeUploadedFile(
  file: File,
  options: { folder: "workspace-documents" | "knowledge-assets" },
): Promise<StoredFile> {
  assertUploadFileAllowed(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = sanitizeFilename(file.name || "upload.bin") || "upload.bin";
  const datedPrefix = `${options.folder}/${new Date().toISOString().slice(0, 10)}`;
  const objectKey = `${datedPrefix}/${crypto.randomUUID()}-${safeName}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(objectKey, buffer, {
      access: "private",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type || "application/octet-stream",
    });

    return {
      fileSize: buffer.byteLength,
      storagePath: objectKey,
      storageProvider: "vercel_blob",
      storageUrl: blob.url,
    };
  }

  const absolutePath = path.join(process.cwd(), "data", "uploads", ...objectKey.split("/"));
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);

  return {
    fileSize: buffer.byteLength,
    storagePath: objectKey,
    storageProvider: "local",
    storageUrl: null,
  };
}
