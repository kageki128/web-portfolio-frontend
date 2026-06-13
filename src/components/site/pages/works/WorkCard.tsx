import { motion } from "framer-motion";
import { MediaPreview } from "@/components/site/MediaPreview";
import {
  cardItemMotionVariants,
  cardItemViewport,
} from "@/components/site/motion/cardItemMotion";
import { SiteBadge } from "@/components/site/SiteBadge";
import { getWorkTagThemeColor } from "@/constants/colors";
import {
  CARD_META_CLASS,
  CARD_TITLE_CLASS,
  SURFACE_CARD_CLASS,
} from "@/constants/siteStyles";
import { cn } from "@/lib/cn";
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
        <MediaPreview
          src={work.image}
          alt={work.title}
          metadataLink={work.link}
          placeholderLabel="No Image"
        />
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className={CARD_META_CLASS}>{work.date}</div>
          {work.tags.map((tag) => (
            <SiteBadge
              key={tag}
              label={tag}
              backgroundColor={getWorkTagThemeColor(tag)}
              variant="meta"
            />
          ))}
        </div>
        <h3 className={cn(CARD_TITLE_CLASS, "mb-3 line-clamp-2")}>
          {work.title}
        </h3>
        <p className="text-sm text-body leading-relaxed line-clamp-3 min-h-[4.5em]">{work.desc}</p>
      </div>
    </motion.button>
  );
}
