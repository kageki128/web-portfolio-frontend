import { forwardRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  cardItemMotionVariants,
} from "@/components/site/motion/cardItemMotion";
import { MediaPreview } from "@/components/site/MediaPreview";
import { ThumbnailOverlay } from "@/components/site/ThumbnailOverlay";
import { getWorkTagThemeColor } from "@/constants/colors";
import {
  BODY_COPY_CLASS,
  PAGE_CONTAINER_CLASS,
} from "@/constants/siteStyles";
import { createWorkDetailHref } from "@/lib/workLink";
import type { AboutActivity } from "@/types/about";

const ACTIVITY_DIAGONAL_OFFSET = "8vw";
const ACTIVITY_BLOCK_START_INDEX = 6;
const ABOUT_SEQUENCE_COLUMNS = Number.MAX_SAFE_INTEGER;

function getActivityClipPath(isEvenIndex: boolean) {
  return isEvenIndex
    ? `polygon(0 0, 100% ${ACTIVITY_DIAGONAL_OFFSET}, 100% calc(100% - ${ACTIVITY_DIAGONAL_OFFSET}), 0 100%)`
    : `polygon(0 ${ACTIVITY_DIAGONAL_OFFSET}, 100% 0, 100% 100%, 0 calc(100% - ${ACTIVITY_DIAGONAL_OFFSET}))`;
}

function getAccentTransformOrigin(isEvenIndex: boolean, isActive: boolean) {
  if (isEvenIndex) {
    return isActive ? "left" : "right";
  }

  return isActive ? "right" : "left";
}

type ActivityCardProps = {
  activity: AboutActivity;
  index: number;
  isActive: boolean;
  shouldForceVisibleOnRestore: boolean;
};

export const ActivityCard = forwardRef<HTMLDivElement, ActivityCardProps>(function ActivityCard(
  { activity, index, isActive, shouldForceVisibleOnRestore },
  ref,
) {
  const isEvenIndex = index % 2 === 0;
  const clipPath = getActivityClipPath(isEvenIndex);
  const linkedWork = activity.work;
  const mediaClassName = `w-full md:w-1/2 aspect-video rounded-card overflow-hidden bg-media relative border ${isActive ? "border-white/20" : "border-line"}`;

  return (
    <div
      ref={ref}
      className="w-full relative transition-colors duration-standard"
      style={{
        clipPath,
        marginTop: index > 0 ? `calc(${ACTIVITY_DIAGONAL_OFFSET} * -1)` : undefined,
      }}
    >
      <div
        className="absolute inset-0 z-0 transition-transform duration-standard ease-enter"
        style={{
          backgroundColor: activity.accentColor,
          transformOrigin: getAccentTransformOrigin(isEvenIndex, isActive),
          transform: isActive ? "scaleX(1)" : "scaleX(0)",
        }}
      />

      <div className={`${PAGE_CONTAINER_CLASS} relative z-10 py-32 md:py-40`}>
        <motion.div
          custom={{ index: ACTIVITY_BLOCK_START_INDEX + index, columns: ABOUT_SEQUENCE_COLUMNS }}
          variants={cardItemMotionVariants}
          initial="hidden"
          animate={shouldForceVisibleOnRestore ? "visibleInstant" : "visible"}
          className={`flex flex-col ${isEvenIndex ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-10`}
        >
          {linkedWork ? (
            <motion.div
              variants={cardItemMotionVariants}
              whileHover="hover"
              className={`${mediaClassName} shadow-card transition-shadow hover:shadow-card-hover`}
            >
              <Link
                href={createWorkDetailHref(linkedWork.id)}
                className="block w-full h-full cursor-pointer"
              >
                <MediaPreview
                  src={activity.imageUrl}
                  alt={linkedWork.title}
                  placeholderLabel="No Image"
                />
                <ThumbnailOverlay
                  title={linkedWork.title}
                  date={linkedWork.date}
                  variant="about"
                  badges={linkedWork.tags.map((tag) => ({
                    key: tag,
                    label: tag,
                    backgroundColor: getWorkTagThemeColor(tag),
                  }))}
                />
              </Link>
            </motion.div>
          ) : (
            <div
              className={`${mediaClassName} shadow-floating transition-colors duration-standard`}
            >
              <MediaPreview
                src={activity.imageUrl}
                alt={activity.title}
                placeholderLabel="No Image"
                imageClassName="opacity-90"
              />
            </div>
          )}

          <div className="w-full md:w-1/2">
            <div
              className={`text-5xl font-black mb-2 transition-colors duration-standard ${isActive ? "text-white/30" : "text-pale"}`}
            >
              0{index + 1}
            </div>
            <h3
              className={`text-3xl font-black mb-4 transition-colors duration-standard ${isActive ? "text-white" : "text-ink"}`}
            >
              {activity.title}
            </h3>
            <p
              className={`${BODY_COPY_CLASS} max-w-lg transition-colors duration-standard ${isActive ? "text-white/90" : "text-body"}`}
            >
              {activity.description}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
});
