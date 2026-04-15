const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "dispostable.com",
  "fakeinbox.com",
  "getnada.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "maildrop.cc",
  "mailinator.com",
  "sharklasers.com",
  "temp-mail.org",
  "tempail.com",
  "tempmail.email",
  "tempmailo.com",
  "throwawaymail.com",
  "yopmail.com",
]);

const DISPOSABLE_EMAIL_SUFFIXES = [
  ".yopmail.com",
  ".guerrillamail.com",
  ".guerrillamail.net",
];

const SIMPLE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getConfiguredBlockedDomains() {
  return new Set(
    (process.env.BLOCKED_EMAIL_DOMAINS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isValidEmailFormat(email: string) {
  return SIMPLE_EMAIL_PATTERN.test(email);
}

export function isBlockedRegistrationEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1] ?? "";
  if (!domain) return false;

  const configuredBlockedDomains = getConfiguredBlockedDomains();
  if (configuredBlockedDomains.has(domain)) {
    return true;
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return true;
  }

  return DISPOSABLE_EMAIL_SUFFIXES.some((suffix) => domain.endsWith(suffix));
}
