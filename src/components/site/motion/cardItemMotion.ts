import { useEffect, useState, useSyncExternalStore } from "react";
import type { Variants } from "framer-motion";
import { MOTION_EASING } from "@/constants/motion";

const STAGGER_SECONDS = 0.08;
const MD_BREAKPOINT = 768;
const LG_BREAKPOINT = 1024;

export const cardItemViewport = { once: true, margin: "-50px" } as const;

type CardItemMotionCustom = {
  index: number;
  columns: number;
};

function shouldSkipCardInitialHidden() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigationEntry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;

  if (!navigationEntry) {
    return false;
  }

  if (window.scrollY <= 0) {
    return false;
  }

  return navigationEntry.type === "reload" || navigationEntry.type === "back_forward";
}

function getCardGridColumns(width: number) {
  if (width >= LG_BREAKPOINT) {
    return 3;
  }

  if (width >= MD_BREAKPOINT) {
    return 2;
  }

  return 1;
}

function getDelaySteps({ index, columns }: CardItemMotionCustom) {
  if (columns <= 1) {
    return 0;
  }

  return index % columns;
}

export function useCardGridColumns() {
  const [columns, setColumns] = useState(() =>
    typeof window === "undefined" ? 3 : getCardGridColumns(window.innerWidth),
  );

  useEffect(() => {
    const updateColumns = () => {
      setColumns(getCardGridColumns(window.innerWidth));
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => {
      window.removeEventListener("resize", updateColumns);
    };
  }, []);

  return columns;
}

export function useForceCardVisibleOnRestore() {
  return useSyncExternalStore(
    () => () => {},
    shouldSkipCardInitialHidden,
    () => false,
  );
}

export const cardItemMotionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: CardItemMotionCustom = { index: 0, columns: 1 }) => {
    const delay = getDelaySteps(custom) * STAGGER_SECONDS;

    return {
      opacity: 1,
      y: 0,
      transition: {
        opacity: {
          duration: 0.35,
          ease: MOTION_EASING.enter,
          delay,
        },
        y: {
          duration: 0.35,
          ease: MOTION_EASING.enter,
          delay,
        },
      },
    };
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: { duration: 0.2, ease: MOTION_EASING.exit },
  },
  visibleInstant: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
  hover: {
    scale: 1.015,
    transition: { duration: 0.2, ease: MOTION_EASING.standard },
  },
};
