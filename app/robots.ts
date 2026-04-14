import type { MetadataRoute } from "next";

function resolveAppUrl() {
  return (
    process.env.APP_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`
      : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : "") ||
    "http://localhost:3000"
  );
}

export default function robots(): MetadataRoute.Robots {
  const appUrl = resolveAppUrl();
  const isProduction =
    appUrl.startsWith("https://") && !appUrl.includes("vercel.app") && !appUrl.includes("localhost");

  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/contact", "/privacy", "/terms"],
      disallow: ["/app", "/api"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
