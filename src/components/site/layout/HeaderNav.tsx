import Link from "next/link";
import { Trophy } from "lucide-react";
import { useAchievements } from "@/components/site/achievements/AchievementProvider";
import { EXTERNAL_LINKS } from "@/constants/externalLinks";
import { NAV_ITEMS, isPathActive } from "./navigation";

type HeaderNavProps = {
  pathname: string;
};

export function HeaderNav({ pathname }: HeaderNavProps) {
  const { unlockAchievement } = useAchievements();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-b from-black/80 to-transparent">
      <div className="w-full px-6 md:px-12 flex items-center justify-between h-16">
        <Link href="/" className="text-2xl font-black font-heading tracking-tighter text-white">
          kageki128
        </Link>

        <div className="hidden md:flex items-center h-full">
          {NAV_ITEMS.map((item) => {
            const isActive = isPathActive(pathname, item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex items-center h-full px-4 text-sm font-bold font-heading tracking-widest text-white transition-colors hover:text-cyan-400"
              >
                {isActive ? <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400" /> : null}
                {item.label}
              </Link>
            );
          })}

          <a
            href={EXTERNAL_LINKS.otoge}
            onClick={() => unlockAchievement("otoge_link")}
            className="ml-4 px-4 py-1.5 border-2 rounded-sm font-bold font-heading tracking-widest text-sm transition-all border-current text-white hover:text-cyan-400 hover:bg-cyan-400/10"
            aria-label="OTOGE RUSH を unityroom で開く"
          >
            OTOGE
          </a>

          <div className="w-px h-6 bg-white/20 mx-4" />

          <Link
            href="/achievement"
            className={`relative flex items-center h-full px-4 text-white/50 transition-colors ${
              pathname === "/achievement" ? "text-cyan-400" : ""
            }`}
            title="Achievements"
            aria-label="実績ページを開く"
          >
            {pathname === "/achievement" ? (
              <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400" />
            ) : null}
            <Trophy size={20} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
