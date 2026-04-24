import type { MetadataRoute } from "next";
import { resolveAppUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const appUrl = resolveAppUrl();
  const isProduction =
    appUrl.startsWith("https://") && !appUrl.includes("vercel.app") && !appUrl.includes("localhost");

  if (!isProduction) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app", "/api", "/status", "/login", "/register", "/launch-checklist"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/app", "/api", "/status", "/login", "/register", "/launch-checklist"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
