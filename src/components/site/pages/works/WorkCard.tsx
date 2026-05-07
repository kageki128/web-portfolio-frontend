/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import {
  cardItemMotionVariants,
  cardItemViewport,
} from "@/components/site/motion/cardItemMotion";
import { getWorkTagThemeColor } from "@/constants/colors";
import { META_BADGE_CLASS, SURFACE_CARD_CLASS } from "@/constants/siteStyles";
import { cn } from "@/lib/cn";
import { hasText } from "@/lib/text";
import type { WorkItem } from "@/types/works";

const WORK_IMAGE_ASPECT_CLASS = "aspect-[16/9]";

type WorkCardProps = {
  work: WorkItem;
  index: number;
  columns: number;
  forceVisible: boolean;
  onOpen: (work: WorkItem) => void;
};

export function WorkCard({ work, index, columns, forceVisible, onOpen }: WorkCardProps) {
  return (
    <motion.button
      type="button"
      custom={{ index, columns }}
      variants={cardItemMotionVariants}
      initial="hidden"
      animate={forceVisible ? "visibleInstant" : undefined}
      whileInView="visible"
      viewport={cardItemViewport}
      whileHover="hover"
      className={cn(SURFACE_CARD_CLASS, "w-full text-left cursor-pointer")}
      onClick={() => onOpen(work)}
    >
      <div className={`${WORK_IMAGE_ASPECT_CLASS} w-full overflow-hidden relative`}>
        {hasText(work.image) ? (
          <img src={work.image} alt={work.title} className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="text-slate-400 font-bold text-xs">{work.date}</div>
          {work.tags.map((tag) => (
            <span
              key={tag}
              className={META_BADGE_CLASS}
              style={{ backgroundColor: getWorkTagThemeColor(tag) ?? undefined }}
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-bold text-slate-800 leading-normal group-hover:text-cyan-600 transition-colors line-clamp-2 min-h-[3em] mb-3">
          {work.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 min-h-[4.5em]">{work.desc}</p>
      </div>
    </motion.button>
  );
}
