import type { MetadataRoute } from "next";
import { resolveAppUrl } from "@/lib/site";

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
      url: `${appUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${appUrl}/ai-proposal-software`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${appUrl}/rfp-response-software`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${appUrl}/proposal-software-for-consultants`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${appUrl}/proposal-workflow-software`,
      changeFrequency: "monthly",
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
