import type { Metadata } from "next";
import "./globals.css";

function resolveAppUrl() {
  const explicit = process.env.APP_URL?.trim();
  if (explicit) return explicit;

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`;

  const fallbackVercelUrl = process.env.VERCEL_URL?.trim();
  if (fallbackVercelUrl) return `https://${fallbackVercelUrl}`;

  return undefined;
}

const appUrl = resolveAppUrl();

export const metadata: Metadata = {
  title: "ProposalDock",
  description:
    "ProposalDock helps B2B service teams turn briefs and RFPs into grounded proposal drafts, review workflows, and export-ready response packs.",
  metadataBase: appUrl ? new URL(appUrl) : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
