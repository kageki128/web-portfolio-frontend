import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";

export function GlobalScrollIndicator() {
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(true);

  useMotionValueEvent(scrollY, "change", (scrollPosition) => {
    setIsVisible(scrollPosition < 400);
  });

  return (
    <motion.div
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center gap-1 text-ink"
      aria-hidden
    >
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
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
