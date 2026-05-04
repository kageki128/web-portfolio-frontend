"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import {
  type LucideIcon,
  AtSign,
  GitBranch,
  MonitorPlay,
  Sprout,
  Trophy,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  type MotionValue,
  useScroll,
  useTransform,
} from "framer-motion";

type ShapeKind = "circle" | "square" | "cross" | "triangle";

type FloatingShape = {
  id: number;
  kind: ShapeKind;
  top: string;
  left: string;
  size: number;
  colorIndex: number;
  rotation: number;
  isFilled: boolean;
  isSlowLayer: boolean;
};

type NavItem = {
  label: string;
  href: string;
};

type SocialLink = {
  label: string;
  href: string;
  className: string;
  icon?: LucideIcon;
  text?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "TOP", href: "/" },
  { label: "ABOUT", href: "/about" },
  { label: "WORKS", href: "/works" },
  { label: "ARTICLES", href: "/articles" },
  { label: "FAVORITES", href: "/favorites" },
];

const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "X",
    href: "#",
    className:
      "w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg",
    icon: AtSign,
  },
  {
    label: "GitHub",
    href: "#",
    className:
      "w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg",
    icon: GitBranch,
  },
  {
    label: "Qiita",
    href: "#",
    className:
      "w-14 h-14 rounded-full bg-[#55C500] text-white flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform shadow-lg",
    text: "Q",
  },
  {
    label: "Zenn",
    href: "#",
    className:
      "w-14 h-14 rounded-full bg-[#3EA8FF] text-white flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform shadow-lg",
    text: "Z",
  },
];

const SHAPE_TEXT_COLORS = [
  "text-cyan-400/40",
  "text-indigo-400/40",
  "text-fuchsia-400/40",
  "text-emerald-400/40",
  "text-slate-400/50",
  "text-blue-400/40",
] as const;

const FLOATING_SHAPES: FloatingShape[] = Array.from({ length: 120 }).map((_, index) => ({
  id: index,
  kind: (["circle", "square", "cross", "triangle"] as const)[index % 4],
  top: `${index * 8.5 + (index % 5) * 4}vh`,
  left: `${(index * 37) % 90}%`,
  size: 30 + (index % 5) * 20,
  colorIndex: index % SHAPE_TEXT_COLORS.length,
  rotation: (index * 47) % 360,
  isFilled: index % 3 !== 0,
  isSlowLayer: index % 2 === 0,
}));

const SLOW_LAYER_SHAPES = FLOATING_SHAPES.filter((shape) => shape.isSlowLayer);
const FAST_LAYER_SHAPES = FLOATING_SHAPES.filter((shape) => !shape.isSlowLayer);

function isPathActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function ShapeIcon({ shape, isFastLayer }: { shape: FloatingShape; isFastLayer: boolean }) {
  const size = isFastLayer ? shape.size * 1.5 : shape.size;
  const strokeWidth = isFastLayer ? "4" : "6";
  const commonProps = {
    fill: shape.isFilled ? "currentColor" : "none",
    stroke: shape.isFilled ? "none" : "currentColor",
    strokeWidth: shape.isFilled ? "0" : strokeWidth,
    strokeLinejoin: "round" as const,
    className: SHAPE_TEXT_COLORS[shape.colorIndex],
  };

  if (shape.kind === "circle") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
        <circle cx="50" cy="50" r="40" {...commonProps} />
      </svg>
    );
  }

  if (shape.kind === "square") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
        <rect x="15" y="15" width="70" height="70" {...commonProps} />
      </svg>
    );
  }

  if (shape.kind === "cross") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
        <path
          d="M40,15 h20 v25 h25 v20 h-25 v25 h-20 v-25 h-25 v-20 h25 z"
          {...commonProps}
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
      <polygon points="50,15 85,80 15,80" {...commonProps} />
    </svg>
  );
}

function FloatingShapeLayer({
  shapes,
  isFastLayer,
  y,
  opacityClassName,
}: {
  shapes: FloatingShape[];
  isFastLayer: boolean;
  y: MotionValue<number>;
  opacityClassName: string;
}) {
  return (
    <motion.div
      style={{ y }}
      className={`absolute top-0 left-0 w-full h-[1000vh] ${opacityClassName}`}
    >
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={`absolute flex items-center justify-center ${isFastLayer ? "" : "blur-[2px]"}`}
          style={{
            top: shape.top,
            left: shape.left,
            transform: `rotate(${shape.rotation}deg)`,
          }}
        >
          <ShapeIcon shape={shape} isFastLayer={isFastLayer} />
        </div>
      ))}
    </motion.div>
  );
}

function ParallaxBackground() {
  const { scrollY } = useScroll();
  const ySlow = useTransform(scrollY, (scrollPosition) => scrollPosition * -0.5);
  const yFast = useTransform(scrollY, (scrollPosition) => scrollPosition * -1.2);

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatingShapeLayer
          shapes={SLOW_LAYER_SHAPES}
          isFastLayer={false}
          y={ySlow}
          opacityClassName="opacity-50"
        />
        <FloatingShapeLayer
          shapes={FAST_LAYER_SHAPES}
          isFastLayer
          y={yFast}
          opacityClassName="opacity-70"
        />
      </div>
    </>
  );
}

function SocialLinkButton({ link }: { link: SocialLink }) {
  const Icon = link.icon;

  return (
    <a href={link.href} className={link.className} aria-label={link.label} title={link.label}>
      {Icon ? <Icon size={24} /> : link.text}
    </a>
  );
}

function ExperienceBanner({
  isOpen,
  onClose,
  onOpen,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <div className="bg-white rounded-xl shadow-2xl shadow-cyan-500/10 border-2 border-cyan-500 p-6 pr-12 relative overflow-hidden group w-72">
            <div className="absolute top-0 right-0 p-3">
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-800 transition-colors"
                aria-label="体験バナーを閉じる"
              >
                <X size={20} />
              </button>
            </div>

            <h3 className="text-lg font-black mb-1 text-slate-800">初めてですか？</h3>
            <p className="text-sm text-slate-500 mb-4 font-medium">私を「体験」してみませんか？</p>

            <Link
              href="/otoge"
              className="flex items-center justify-center gap-2 bg-cyan-500 text-white px-4 py-3 rounded-lg font-bold font-heading text-sm hover:bg-cyan-600 transition-colors w-full shadow-lg shadow-cyan-500/20"
            >
              <MonitorPlay size={16} />
              EXPERIENCE NOW
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-cyan-500 rounded-full flex items-center justify-center shadow-xl shadow-cyan-500/20 hover:scale-110 transition-transform text-white"
          onClick={onOpen}
          title="Experience"
          aria-label="体験バナーを開く"
        >
          <Sprout size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function SiteRootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isExperienceBannerOpen, setIsExperienceBannerOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-white relative">
      <ParallaxBackground />

      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-b from-black/80 to-transparent">
        <div className="w-full px-6 md:px-12 flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-black font-heading tracking-tighter text-white">
            PORTFOLIO
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
                  {isActive && <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400" />}
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/otoge"
              className={`ml-4 px-4 py-1.5 border-2 rounded-sm font-bold font-heading tracking-widest text-sm transition-all ${
                pathname === "/otoge"
                  ? "border-cyan-400 text-cyan-400 bg-cyan-400/10"
                  : "border-white/40 text-white hover:border-cyan-400 hover:text-cyan-400"
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
              {pathname === "/achievement" && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400" />
              )}
              <Trophy size={20} />
            </Link>
          </div>
        </div>
      </nav>

      <div className="fixed left-6 bottom-8 z-40 flex-col gap-4 hidden lg:flex">
        {SOCIAL_LINKS.map((link) => (
          <SocialLinkButton key={link.label} link={link} />
        ))}
      </div>

      <main className="w-full relative min-h-screen">{children}</main>

      <footer className="bg-white py-12 border-t border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="text-2xl font-black font-heading tracking-tighter text-slate-800 mb-4 md:mb-0">
            PORTFOLIO
          </div>
          <p className="text-slate-400 text-sm font-medium font-heading">Last Updated: May 3, 2026</p>
        </div>
      </footer>

      <ExperienceBanner
        isOpen={isExperienceBannerOpen}
        onClose={() => setIsExperienceBannerOpen(false)}
        onOpen={() => setIsExperienceBannerOpen(true)}
      />
    </div>
  );
}
