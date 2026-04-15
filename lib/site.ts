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
  "ProposalDock helps B2B service teams turn briefs and RFPs into grounded proposal drafts, review workflows, and export-ready response packs.";

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
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        category: "Free",
      },
      {
        "@type": "Offer",
        price: "49",
        priceCurrency: "USD",
        category: "Pro",
      },
      {
        "@type": "Offer",
        price: "149",
        priceCurrency: "USD",
        category: "Team",
      },
    ],
  };
}
