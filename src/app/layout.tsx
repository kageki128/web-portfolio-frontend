import type { Metadata } from "next";
import { execSync } from "node:child_process";
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

const lastUpdated = execSync("git log -1 --date=format:%Y-%m-%d --format=%cd", {
  encoding: "utf-8",
}).trim();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full">
        <SiteRootLayout lastUpdated={lastUpdated}>{children}</SiteRootLayout>
      </body>
    </html>
  );
}
