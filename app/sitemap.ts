import type { MetadataRoute } from "next";
import { buildCanonical } from "@/lib/site";

const lastModified = new Date();

const routes = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/contact", changeFrequency: "weekly" as const, priority: 0.75 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.75 },
  { path: "/use-cases", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/ai-proposal-software", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/rfp-response-software", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/proposal-software-for-consultants", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/proposal-system-for-consultants", changeFrequency: "monthly" as const, priority: 0.85 },
  { path: "/proposal-workflow-software", changeFrequency: "monthly" as const, priority: 0.85 },
  { path: "/consulting-proposal-software", changeFrequency: "monthly" as const, priority: 0.85 },
  { path: "/client-brief-analysis", changeFrequency: "monthly" as const, priority: 0.85 },
  { path: "/proposal-review-checklist", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/proposal-risk-review", changeFrequency: "monthly" as const, priority: 0.85 },
  {
    path: "/proposal-automation-for-consultants",
    changeFrequency: "monthly" as const,
    priority: 0.8,
  },
  { path: "/ai-rfp-analysis", changeFrequency: "monthly" as const, priority: 0.85 },
  { path: "/rfp-requirements-extraction", changeFrequency: "monthly" as const, priority: 0.85 },
  { path: "/rfp-risk-assessment", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/bid-no-bid-analysis", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/rfp-compliance-matrix", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/privacy", changeFrequency: "monthly" as const, priority: 0.3 },
  { path: "/terms", changeFrequency: "monthly" as const, priority: 0.3 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: buildCanonical(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
