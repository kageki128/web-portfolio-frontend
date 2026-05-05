import type { Metadata } from "next";
import "./globals.css";
import SiteRootLayout from "@/components/site/RootLayout";
import { SITE_ICON_PATH } from "@/constants/assets";

export const metadata: Metadata = {
  title: "kageki128.dev",
  description: "Interactive portfolio frontend",
  icons: {
    icon: SITE_ICON_PATH,
    shortcut: SITE_ICON_PATH,
    apple: SITE_ICON_PATH,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const now = new Date();
  const lastUpdated = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(
    now.getDate(),
  ).padStart(2, "0")}`;

  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full">
        <SiteRootLayout lastUpdated={lastUpdated}>{children}</SiteRootLayout>
      </body>
    </html>
  );
}
