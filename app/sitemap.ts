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

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = resolveAppUrl();

  return [
    {
      url: `${appUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${appUrl}/contact`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${appUrl}/privacy`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${appUrl}/terms`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${appUrl}/status`,
      changeFrequency: "daily",
      priority: 0.2,
    },
  ];
}
