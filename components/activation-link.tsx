"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function ActivationLink({
  href,
  eventType,
  children,
}: {
  href: string;
  eventType: "start_free_clicked";
  children: ReactNode;
}) {
  function trackClick() {
    const body = JSON.stringify({ eventType });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/marketing/activation",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }

    void fetch("/api/marketing/activation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  }

  return (
    <Link href={href} onClick={trackClick}>
      {children}
    </Link>
  );
}
