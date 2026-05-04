import type { Variants } from "framer-motion";

const STAGGER_SECONDS = 0.08;

export const cardItemMotionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      opacity: {
        duration: 0.35,
        ease: "linear",
        delay: index * STAGGER_SECONDS,
      },
      y: {
        duration: 0.35,
        ease: "easeOut",
        delay: index * STAGGER_SECONDS,
      },
    },
  }),
  exit: {
    opacity: 0,
    y: 12,
    transition: { duration: 0.2, ease: "easeIn" },
  },
  hover: {
    scale: 1.015,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};
