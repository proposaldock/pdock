import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { resolveAppUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const appUrl = resolveAppUrl();
const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();

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
      <body>
        {googleAdsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-ads-tag" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAdsId}');
              `}
            </Script>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
