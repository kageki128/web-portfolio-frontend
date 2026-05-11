import type { ReactNode } from "react";
import SiteRootLayout from "@/components/site/RootLayout";

const lastUpdated = process.env.NEXT_PUBLIC_LAST_UPDATED!;

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteRootLayout lastUpdated={lastUpdated}>{children}</SiteRootLayout>;
}
