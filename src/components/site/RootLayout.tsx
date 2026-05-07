"use client";

import { type ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ExperienceBanner } from "./layout/ExperienceBanner";
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
  const [isExperienceBannerOpen, setIsExperienceBannerOpen] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-white relative">
      <ParallaxBackground />
      <HeaderNav pathname={pathname} />
      <SocialLinksRail />

      <main className="w-full relative min-h-screen">{children}</main>

      {pathname === "/" ? <GlobalScrollIndicator /> : null}

      <SiteFooter lastUpdated={lastUpdated} />

      <ExperienceBanner
        isOpen={isExperienceBannerOpen}
        onClose={() => setIsExperienceBannerOpen(false)}
        onExpand={() => setIsExperienceBannerOpen(true)}
      />
    </div>
  );
}
