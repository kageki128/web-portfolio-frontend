import type { Metadata } from "next";
import "./globals.css";
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
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
