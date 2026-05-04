import type { Metadata } from "next";
import "./globals.css";
import SiteRootLayout from "@/components/site/RootLayout";

export const metadata: Metadata = {
  title: "Web Portfolio",
  description: "Interactive portfolio frontend",
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
