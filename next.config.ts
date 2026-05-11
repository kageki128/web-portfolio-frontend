import { execSync } from "node:child_process";
import type { NextConfig } from "next";

const lastUpdated = execSync("git log -1 --date=format:%Y-%m-%d --format=%cd", {
  encoding: "utf-8",
}).trim();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_LAST_UPDATED: lastUpdated,
  },
  outputFileTracingIncludes: {
    "/*": ["./src/content/**/*"],
    "/api/*": ["./src/content/**/*"],
    "/articles/*": ["./src/content/**/*"],
  },
};

export default nextConfig;
