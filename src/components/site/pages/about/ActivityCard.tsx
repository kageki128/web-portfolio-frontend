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

const ACTIVITY_BLOCK_START_INDEX = 6;
const ABOUT_SEQUENCE_COLUMNS = Number.MAX_SAFE_INTEGER;

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
  const linkedWork = activity.work;
  const mediaClassName = `w-full lg:w-1/2 aspect-video rounded-card overflow-hidden bg-media relative border ${isActive ? "border-white/20" : "border-line"}`;

  return (
    <div
      ref={ref}
      className={`activity-card ${isEvenIndex ? "activity-card-even" : "activity-card-odd"} ${index > 0 ? "activity-card-overlap" : ""} relative w-full transition-colors duration-standard`}
    >
      <div
        className="absolute inset-0 z-0 transition-transform duration-standard ease-enter"
        style={{
          backgroundColor: activity.accentColor,
          transformOrigin: getAccentTransformOrigin(isEvenIndex, isActive),
          transform: isActive ? "scaleX(1)" : "scaleX(0)",
        }}
      />

      <div className={`${PAGE_CONTAINER_CLASS} relative z-10 py-20 sm:py-28 lg:py-40`}>
        <motion.div
          custom={{ index: ACTIVITY_BLOCK_START_INDEX + index, columns: ABOUT_SEQUENCE_COLUMNS }}
          variants={cardItemMotionVariants}
          initial="hidden"
          animate={shouldForceVisibleOnRestore ? "visibleInstant" : "visible"}
          className={`flex flex-col ${isEvenIndex ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-6 sm:gap-10`}
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
                  metadataLink={linkedWork.link}
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

          <div className="w-full lg:w-1/2">
            <div
              className={`mb-2 text-4xl font-black transition-colors duration-standard sm:text-5xl ${isActive ? "text-white/30" : "text-pale"}`}
            >
              0{index + 1}
            </div>
            <h3
              className={`mb-4 text-2xl font-black transition-colors duration-standard sm:text-3xl ${isActive ? "text-white" : "text-ink"}`}
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
