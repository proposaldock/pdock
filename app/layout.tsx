import type { Metadata } from "next";
import "./globals.css";
import { resolveAppUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const appUrl = resolveAppUrl();

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: appUrl ? new URL(appUrl) : undefined,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: appUrl,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
