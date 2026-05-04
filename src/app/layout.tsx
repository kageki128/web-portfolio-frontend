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
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full">
        <SiteRootLayout>{children}</SiteRootLayout>
      </body>
    </html>
  );
}
