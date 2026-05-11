/* eslint-disable @next/next/no-img-element */

import { forwardRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  cardItemMotionVariants,
} from "@/components/site/motion/cardItemMotion";
import { ThumbnailOverlay } from "@/components/site/ThumbnailOverlay";
import { getWorkTagThemeColor } from "@/constants/colors";
import { hasText } from "@/lib/text";
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
  const mediaClassName = `w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden bg-slate-900 relative border ${isActive ? "border-white/20" : "border-slate-200"}`;
  const activityImage = (className = "w-full h-full object-cover") =>
    hasText(activity.imageUrl) ? (
      <img
        src={activity.imageUrl}
        alt={linkedWork?.title ?? activity.title}
        loading="lazy"
        decoding="async"
        className={className}
      />
    ) : null;

  return (
    <div
      ref={ref}
      className="w-full relative transition-colors duration-300 ease-in-out"
      style={{
        clipPath,
        marginTop: index > 0 ? `calc(${ACTIVITY_DIAGONAL_OFFSET} * -1)` : undefined,
      }}
    >
      <div
        className="absolute inset-0 z-0 transition-transform duration-300 ease-out"
        style={{
          backgroundColor: activity.accentColor,
          transformOrigin: getAccentTransformOrigin(isEvenIndex, isActive),
          transform: isActive ? "scaleX(1)" : "scaleX(0)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-32 md:py-40 relative z-10">
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
              className={`${mediaClassName} shadow-md hover:shadow-2xl transition-shadow`}
            >
              <Link
                href={createWorkDetailHref(linkedWork.id)}
                className="block w-full h-full cursor-pointer"
              >
                {activityImage("w-full h-full object-cover")}
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
              className={`${mediaClassName} shadow-xl transition-colors duration-300`}
            >
              {activityImage("w-full h-full object-cover opacity-90")}
            </div>
          )}

          <div className="w-full md:w-1/2">
            <div
              className={`text-5xl font-black mb-2 transition-colors duration-300 ${isActive ? "text-white/30" : "text-slate-200"}`}
            >
              0{index + 1}
            </div>
            <h3
              className={`text-3xl font-black mb-4 transition-colors duration-300 ${isActive ? "text-white" : "text-slate-800"}`}
            >
              {activity.title}
            </h3>
            <p
              className={`leading-loose font-medium max-w-lg transition-colors duration-300 ${isActive ? "text-white/90" : "text-slate-600"}`}
            >
              {activity.description}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
});
