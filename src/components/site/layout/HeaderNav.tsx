import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Menu, Trophy, X } from "lucide-react";
import {
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  shouldDeferAchievementNotificationForExternalClick,
  useAchievements,
} from "@/components/site/achievements/AchievementProvider";
import { EXTERNAL_LINKS } from "@/constants/externalLinks";
import { MOTION_DURATION, MOTION_EASING } from "@/constants/motion";
import { ACTION_BASE_CLASS } from "@/constants/siteStyles";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isPathActive } from "./navigation";
import { SOCIAL_LINKS } from "./socialLinks";

type HeaderNavProps = {
  pathname: string;
};

const MOBILE_MENU_TRANSITION = {
  duration: MOTION_DURATION.standard,
  ease: MOTION_EASING.enter,
} as const;

const MOBILE_MENU_BACKDROP_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    transition: MOBILE_MENU_TRANSITION,
  },
  visible: {
    opacity: 1,
    transition: MOBILE_MENU_TRANSITION,
  },
};

const MOBILE_MENU_DRAWER_VARIANTS: Variants = {
  hidden: {
    x: "100%",
    transition: MOBILE_MENU_TRANSITION,
  },
  visible: {
    x: 0,
    transition: MOBILE_MENU_TRANSITION,
  },
};

const MOBILE_FEATURE_LINK_CLASS =
  "inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-control border border-white/25 px-5 py-3 font-heading font-bold tracking-widest transition-colors hover:border-brand-400 hover:text-brand-400";

export function HeaderNav({ pathname }: HeaderNavProps) {
  const { unlockAchievement } = useAchievements();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;
    const menuButton = menuButtonRef.current;

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    const getFocusableElements = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => {
      getFocusableElements()[0]?.focus();
    });

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      menuButton?.focus();
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleOtogeClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
  ) => {
    unlockAchievement("otoge_link", {
      deferNotificationUntilFocus:
        shouldDeferAchievementNotificationForExternalClick(event),
    });
    closeMobileMenu();
  };

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 bg-gradient-to-b from-black/80 to-transparent transition-all duration-standard">
      <div className="flex h-16 w-full items-center justify-between px-6 lg:px-12">
        <Link href="/" className="text-2xl font-black font-heading tracking-tighter text-white">
          kageki128
        </Link>

        <div className="hidden h-full items-center lg:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = isPathActive(pathname, item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex items-center h-full px-4 text-sm font-bold font-heading tracking-widest text-white transition-colors hover:text-brand-400"
              >
                {isActive ? <div className="absolute top-0 left-0 right-0 h-1 bg-brand-400" /> : null}
                {item.label}
              </Link>
            );
          })}

          <a
            href={EXTERNAL_LINKS.otoge}
            target="_blank"
            rel="noreferrer"
            onClick={handleOtogeClick}
            className={cn(
              ACTION_BASE_CLASS,
              "ml-4 rounded-control border-2 border-current px-4 py-1.5 font-heading text-sm text-white hover:bg-brand-400/10 hover:text-brand-400",
            )}
            aria-label="OTOGE RUSH を unityroom で開く"
          >
            OTOGE
          </a>

          <div className="w-px h-6 bg-surface/20 mx-4" />

          <Link
            href="/achievement"
            className={cn(
              "relative flex h-full items-center px-4 text-white transition-colors duration-fast hover:text-brand-400",
              pathname === "/achievement" && "text-brand-400",
            )}
            title="Achievements"
            aria-label="実績ページを開く"
          >
            {pathname === "/achievement" ? (
              <div className="absolute top-0 left-0 right-0 h-1 bg-brand-400" />
            ) : null}
            <Trophy size={20} />
          </Link>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          aria-label="ナビゲーションメニューを開く"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
          onClick={() => setIsMobileMenuOpen(true)}
          className="-mr-2 inline-flex h-12 w-12 cursor-pointer items-center justify-center text-white transition-colors hover:text-brand-400 lg:hidden"
        >
          <Menu size={24} />
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <div className="fixed inset-0 z-60 lg:hidden">
            <motion.button
              type="button"
              aria-label="ナビゲーションメニューを閉じる"
              onClick={closeMobileMenu}
              variants={MOBILE_MENU_BACKDROP_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute inset-0 h-full w-full cursor-pointer bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              id="mobile-navigation-drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="サイトナビゲーション"
              variants={MOBILE_MENU_DRAWER_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute top-0 right-0 flex h-dvh w-[min(88vw,24rem)] flex-col overflow-y-auto border-l border-white/15 bg-media/95 px-6 py-5 text-white shadow-modal"
            >
              <div className="flex items-center justify-between">
                <div className="font-heading text-xl font-black tracking-tight">
                  MENU
                </div>
                <button
                  type="button"
                  aria-label="ナビゲーションメニューを閉じる"
                  onClick={closeMobileMenu}
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-brand-400 hover:text-brand-400"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="mt-8 flex flex-col">
                {NAV_ITEMS.map((item) => {
                  const isActive = isPathActive(pathname, item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={cn(
                        "flex min-h-12 cursor-pointer items-center border-b border-white/10 py-3 font-heading text-lg font-bold tracking-widest transition-colors hover:text-brand-400",
                        isActive && "text-brand-400",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                <a
                  href={EXTERNAL_LINKS.otoge}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleOtogeClick}
                  className={cn("mt-5", MOBILE_FEATURE_LINK_CLASS)}
                >
                  OTOGE
                </a>

                <Link
                  href="/achievement"
                  onClick={closeMobileMenu}
                  className={cn(
                    "mt-3",
                    MOBILE_FEATURE_LINK_CLASS,
                    pathname === "/achievement" && "border-brand-400 text-brand-400",
                  )}
                >
                  <Trophy size={20} />
                  ACHIEVE
                </Link>
              </div>

              <div className="mt-auto pt-8">
                <div className="mb-4 text-xs font-black tracking-widest text-white/55">
                  SOCIAL LINKS
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {SOCIAL_LINKS.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMobileMenu}
                      className="inline-flex min-h-16 cursor-pointer items-center justify-center rounded-panel text-white shadow-panel transition-transform hover:scale-105"
                      style={{ backgroundColor: link.backgroundColor }}
                      aria-label={link.label}
                      title={link.title ?? link.label}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
