import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: {
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
};

export default function ArticlesLayout({ children }: { children: ReactNode }) {
  return children;
}
