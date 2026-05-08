import Link from "next/link";
import { Trophy } from "lucide-react";
import { NAV_ITEMS, isPathActive } from "./navigation";

type HeaderNavProps = {
  pathname: string;
};

export function HeaderNav({ pathname }: HeaderNavProps) {
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

          <Link
            href="/otoge"
            className={`ml-4 px-4 py-1.5 border-2 rounded-sm font-bold font-heading tracking-widest text-sm transition-all ${
              pathname === "/otoge"
                ? "border-current text-cyan-400 bg-cyan-400/10"
                : "border-current text-white hover:text-cyan-400"
            }`}
          >
            OTOGE
          </Link>

          <div className="w-px h-6 bg-white/20 mx-4" />

          <Link
            href="/achievement"
            className={`relative flex items-center h-full px-4 text-white hover:text-cyan-400 transition-colors ${
              pathname === "/achievement" ? "text-cyan-400" : ""
            }`}
            title="Achievements"
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
