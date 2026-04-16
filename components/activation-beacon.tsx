"use client";

import { useEffect } from "react";

export function ActivationBeacon({
  eventType,
}: {
  eventType: "first_workspace_started";
}) {
  useEffect(() => {
    void fetch("/api/marketing/activation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType }),
    });
  }, [eventType]);

  return null;
}
