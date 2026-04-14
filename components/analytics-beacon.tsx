"use client";

import { useEffect } from "react";

export function AnalyticsBeacon({
  page,
  path,
  plan,
}: {
  page: "landing" | "contact";
  path: string;
  plan?: "free" | "pro" | "team" | null;
}) {
  useEffect(() => {
    void fetch("/api/marketing/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, path, plan }),
    });
  }, [page, path, plan]);

  return null;
}
