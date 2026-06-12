import { useState } from "react";
import { ArrowDown } from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  type Variants,
} from "framer-motion";
import { MOTION_DURATION, MOTION_EASING } from "@/constants/motion";

const INDICATOR_VISIBILITY_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASING.exit },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION.standard, ease: MOTION_EASING.enter },
  },
};

export function GlobalScrollIndicator() {
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(true);

  useMotionValueEvent(scrollY, "change", (scrollPosition) => {
    setIsVisible(scrollPosition < 400);
  });

  return (
    <motion.div
      variants={INDICATOR_VISIBILITY_VARIANTS}
      initial={false}
      animate={isVisible ? "visible" : "hidden"}
      className="fixed bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center gap-1 text-ink"
      aria-hidden
    >
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center gap-1"
      >
        <span
          className="text-base md:text-lg font-black tracking-[0.3em] text-white"
          style={{
            textShadow:
              "0 2px 8px color-mix(in srgb, var(--color-black) 85%, transparent)",
          }}
        >
          SCROLL
        </span>
        <ArrowDown size={34} className="text-brand-500 drop-shadow-sm" />
      </motion.div>
    </motion.div>
  );
}
