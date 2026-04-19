function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function getPlatformAdminEmails() {
  const configured =
    process.env.PLATFORM_ADMIN_EMAILS ??
    process.env.ADMIN_EMAILS ??
    process.env.ADMIN_EMAIL ??
    "";

  return configured
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeEmail);
}

export function isPlatformAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return getPlatformAdminEmails().includes(normalizeEmail(email));
}
