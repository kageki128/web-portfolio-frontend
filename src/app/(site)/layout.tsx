import { execSync } from "node:child_process";
import type { ReactNode } from "react";
import SiteRootLayout from "@/components/site/RootLayout";

const lastUpdated = execSync("git log -1 --date=format:%Y-%m-%d --format=%cd", {
  encoding: "utf-8",
}).trim();

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteRootLayout lastUpdated={lastUpdated}>{children}</SiteRootLayout>;
}
