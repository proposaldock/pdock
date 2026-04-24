export function resolveAppUrl() {
  const explicit = process.env.APP_URL?.trim();
  if (explicit) return explicit;

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl) return `https://${productionUrl}`;

  const fallbackUrl = process.env.VERCEL_URL?.trim();
  if (fallbackUrl) return `https://${fallbackUrl}`;

  return "http://localhost:3000";
}

export const SITE_NAME = "ProposalDock";

export const SITE_DESCRIPTION =
  "AI-assisted proposal software for consultants and B2B service teams that helps analyze client briefs and RFPs, extract requirements, identify risks, reuse approved knowledge, review drafts, and export proposals.";

export function buildCanonical(path = "/") {
  const base = resolveAppUrl().replace(/\/+$/, "");
  return `${base}${path === "/" ? "" : path}`;
}

export function getOrganizationJsonLd() {
  const url = buildCanonical("/");

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url,
    logo: `${url}/icon.png`,
    sameAs: [],
  };
}

export function getSoftwareApplicationJsonLd() {
  const url = buildCanonical("/");

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url,
    description: SITE_DESCRIPTION,
  };
}

export function getFaqPageJsonLd(
  items: ReadonlyArray<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
