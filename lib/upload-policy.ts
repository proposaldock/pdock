const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_WORKSPACE_DOCUMENTS = 5;

const SUPPORTED_UPLOAD_EXTENSIONS = [".pdf", ".docx", ".txt", ".md", ".rtf"];

function formatBytes(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

export function getMaxWorkspaceDocuments() {
  return MAX_WORKSPACE_DOCUMENTS;
}

export function assertUploadFileAllowed(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `${file.name}: file is too large. Upload files up to ${formatBytes(MAX_UPLOAD_BYTES)}.`,
    );
  }

  const lowerName = file.name.toLowerCase();
  const hasSupportedExtension = SUPPORTED_UPLOAD_EXTENSIONS.some((extension) =>
    lowerName.endsWith(extension),
  );
  const mimeType = file.type || "";
  const hasSupportedMimeType =
    mimeType === "application/pdf" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType.startsWith("text/");

  if (!hasSupportedExtension && !hasSupportedMimeType) {
    throw new Error(
      `${file.name}: unsupported file type. Upload PDF, DOCX, TXT, MD, or RTF.`,
    );
  }
}
