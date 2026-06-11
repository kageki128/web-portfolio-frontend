"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AchievementProvider } from "./achievements/AchievementProvider";
import { GlobalScrollIndicator } from "./layout/GlobalScrollIndicator";
import { HeaderNav } from "./layout/HeaderNav";
import { ParallaxBackground } from "./layout/ParallaxBackground";
import { SiteFooter } from "./layout/SiteFooter";
import { SocialLinksRail } from "./layout/SocialLinksRail";

export default function SiteRootLayout({
  children,
  lastUpdated,
}: {
  children: ReactNode;
  lastUpdated: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    scrollToTop();
    const rafId = window.requestAnimationFrame(scrollToTop);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-white relative">
      <AchievementProvider>
        <ParallaxBackground />
        <HeaderNav pathname={pathname} />
        <SocialLinksRail />

        <main className="w-full relative min-h-screen">{children}</main>

        {pathname === "/" ? <GlobalScrollIndicator /> : null}

        <SiteFooter lastUpdated={lastUpdated} />
      </AchievementProvider>
    </div>
  );
}
