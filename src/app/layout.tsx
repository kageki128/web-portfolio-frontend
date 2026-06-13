import type { Metadata } from "next";
import "./globals.css";
import { SITE_ICON_PATH } from "@/constants/assets";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  getSiteUrl,
} from "@/constants/siteMetadata";
import { MOTION_CSS_VARIABLES } from "@/constants/motion";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  icons: {
    icon: SITE_ICON_PATH,
    shortcut: SITE_ICON_PATH,
    apple: SITE_ICON_PATH,
  },
  openGraph: {
    type: "website",
    url: "/",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [SITE_ICON_PATH],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [SITE_ICON_PATH],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className="h-full antialiased"
      style={MOTION_CSS_VARIABLES}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
