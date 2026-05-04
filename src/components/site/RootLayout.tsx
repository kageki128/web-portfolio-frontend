"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import {
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
import { SOCIAL_LINK_URLS, type SocialLinkLabel } from "@/constants/socialLinks";

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
  label: SocialLinkLabel;
  href: string;
  className: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { label: "TOP", href: "/" },
  { label: "ABOUT", href: "/about" },
  { label: "WORKS", href: "/works" },
  { label: "ARTICLES", href: "/articles" },
  { label: "FAVORITES", href: "/favorites" },
];

const SOCIAL_BUTTON_BASE_CLASS =
  "w-14 h-14 rounded-full text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg";

function XBrandIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
    </svg>
  );
}

function GitHubBrandIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function QiitaBrandIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M12 0C5.3726 0 0 5.3726 0 12s5.3726 12 12 12c3.3984 0 6.4665-1.413 8.6498-3.6832-.383-.0574-.7746-.2062-1.1466-.4542-.7145-.4763-1.3486-.9263-1.6817-1.674-1.2945 1.3807-3.0532 1.835-5.1822 2.0503-4.311.4359-8.0456-1.4893-8.4979-6.2996-.1922-2.045.2628-3.989 1.1804-5.582l-.5342-2.1009c-.0862-.3652.2498-.7126.6057-.6262l1.8456.448c1.0974-.9012 2.4249-1.49 3.8892-1.638 1.2526-.1267 2.467.0834 3.571.5624l1.7348-1.0494c.3265-.1974.7399.0257.7711.4164l.1 2.4747v.0002c1.334 1.4084 2.2424 3.3319 2.4478 5.516.116 1.2339-.012 2.1776-.339 3.078-.1531.4215-.1992.7778.0776 1.1305.2674.3408.6915 1.0026 1.1644.8917.7107-.1666 1.4718-.1223 1.9422.1715C23.4925 15.9525 24 14.0358 24 12c0-6.6274-5.3726-12-12-12Zm-.0727 5.727a5.2731 5.2731 0 0 0-.6146.0273c-2.2084.2233-3.9572 1.8135-4.4937 3.8484l-1.3176-.1996-.014.2589 1.2972.1407c-.0352.1497-.0643.2384-.086.3923l-1.1319.0902.0103.2025 1.1032-.088c-.0194.1713-.031.2814-.0332.4565l-1.0078.412.0495.2499.9598-.4492c.002.1339.008.2053.0207.3407.2667 2.8371 2.6364 3.3981 5.4677 3.1118 2.8312-.2863 5.0517-1.3114 4.785-4.1486-.013-.1361-.0324-.2068-.0553-.3392l1.0397.2257.0242-.229-1.0906-.207c-.0342-.1687-.0765-.271-.1264-.4327l1.1208-.1374-.0158-.2019-1.1499.1409a5.1093 5.1093 0 0 0-.1665-.4259l1.2665-.4042-.0397-.2536-1.3471.4667c-.819-1.7168-2.5002-2.8224-4.4546-2.8482Z" />
    </svg>
  );
}

function ZennBrandIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M.264 23.771h4.984c.264 0 .498-.147.645-.352L19.614.874c.176-.293-.029-.645-.381-.645h-4.72c-.235 0-.44.117-.557.323L.03 23.361c-.088.176.029.41.234.41zM17.445 23.419l6.479-10.408c.205-.323-.029-.733-.41-.733h-4.691c-.176 0-.352.088-.44.235l-6.655 10.643c-.176.264.029.616.352.616h4.779c.234-.001.468-.118.586-.353z" />
    </svg>
  );
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "X",
    href: SOCIAL_LINK_URLS.X,
    className: `${SOCIAL_BUTTON_BASE_CLASS} bg-black`,
    icon: <XBrandIcon />,
  },
  {
    label: "GitHub",
    href: SOCIAL_LINK_URLS.GitHub,
    className: `${SOCIAL_BUTTON_BASE_CLASS} bg-[#181717]`,
    icon: <GitHubBrandIcon />,
  },
  {
    label: "Qiita",
    href: SOCIAL_LINK_URLS.Qiita,
    className: `${SOCIAL_BUTTON_BASE_CLASS} bg-[#55C500]`,
    icon: <QiitaBrandIcon />,
  },
  {
    label: "Zenn",
    href: SOCIAL_LINK_URLS.Zenn,
    className: `${SOCIAL_BUTTON_BASE_CLASS} bg-[#3EA8FF]`,
    icon: <ZennBrandIcon />,
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
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={link.className}
      aria-label={link.label}
      title={link.label}
    >
      {link.icon}
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
              className="flex items-center justify-center gap-2 bg-cyan-500 text-white px-4 py-3 rounded-lg font-bold text-sm hover:bg-cyan-600 transition-colors w-full shadow-lg shadow-cyan-500/20"
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

export default function SiteRootLayout({
  children,
  lastUpdated,
}: {
  children: ReactNode;
  lastUpdated: string;
}) {
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
          <p className="text-slate-400 text-sm font-medium">Last Updated: {lastUpdated}</p>
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
