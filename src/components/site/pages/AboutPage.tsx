/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SectionTitle } from "../SectionTitle";
import { ThumbnailOverlay } from "../ThumbnailOverlay";
import {
  cardItemMotionVariants,
  useForceCardVisibleOnRestore,
} from "../motion/cardItemMotion";
import { PROFILE_ICON_PATH } from "@/constants/assets";
import type { AboutActivity, AboutOverview } from "@/types/about";

type ActivityCardProps = {
  activity: AboutActivity;
  index: number;
  isActive: boolean;
  shouldForceVisibleOnRestore: boolean;
};

type AboutPageProps = {
  overview: AboutOverview;
  activities: AboutActivity[];
};

const MIN_HIGHLIGHT_VISIBLE_RATIO = 0.25;
const ACTIVITY_DIAGONAL_OFFSET = "8vw";
const ABOUT_SEQUENCE_COLUMNS = Number.MAX_SAFE_INTEGER;
const OVERVIEW_TITLE_BLOCK_INDEX = 0;
const PROFILE_BLOCK_INDEX = 1;
const INTRODUCTION_BLOCK_INDEX = 2;
const PHILOSOPHY_BLOCK_INDEX = 3;
const TECH_STACK_BLOCK_INDEX = 4;
const ACTIVITIES_TITLE_BLOCK_INDEX = 5;
const ACTIVITY_BLOCK_START_INDEX = 6;

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function calculateVisibleHeight(elementRect: DOMRect, viewportHeight: number): number {
  const visibleTop = Math.max(elementRect.top, 0);
  const visibleBottom = Math.min(elementRect.bottom, viewportHeight);
  return Math.max(0, visibleBottom - visibleTop);
}

function getMostVisibleActivity(elements: Array<HTMLDivElement | null>, viewportHeight: number) {
  let mostVisibleIndex: number | null = null;
  let maxVisibleHeight = 0;

  elements.forEach((element, index) => {
    if (!element) {
      return;
    }

    const visibleHeight = calculateVisibleHeight(element.getBoundingClientRect(), viewportHeight);
    if (visibleHeight > maxVisibleHeight) {
      maxVisibleHeight = visibleHeight;
      mostVisibleIndex = index;
    }
  });

  return { mostVisibleIndex, maxVisibleHeight };
}

function useActiveActivityHighlight() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activityRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    let rafId = 0;

    const updateActiveActivity = () => {
      const viewportHeight = window.innerHeight;
      const { mostVisibleIndex, maxVisibleHeight } = getMostVisibleActivity(
        activityRefs.current,
        viewportHeight,
      );

      if (maxVisibleHeight <= viewportHeight * MIN_HIGHLIGHT_VISIBLE_RATIO) {
        setActiveIndex(null);
        return;
      }

      setActiveIndex(mostVisibleIndex);
    };

    const handleViewportChange = () => {
      // scroll/resizeイベントをrAFで束ねて、連続計算を抑える。
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveActivity);
    };

    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);
    updateActiveActivity();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, []);

  const setActivityRef = useCallback((index: number, element: HTMLDivElement | null) => {
    activityRefs.current[index] = element;
  }, []);

  return { activeIndex, setActivityRef };
}

function SubsectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
      <span className="w-1.5 h-6 bg-cyan-500 inline-block" />
      {title}
    </h3>
  );
}

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

const ActivityCard = forwardRef<HTMLDivElement, ActivityCardProps>(function ActivityCard(
  { activity, index, isActive, shouldForceVisibleOnRestore },
  ref,
) {
  const isEvenIndex = index % 2 === 0;
  const clipPath = getActivityClipPath(isEvenIndex);
  const linkedWork = activity.work;
  const mediaClassName = `w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden bg-slate-900 relative border ${isActive ? "border-white/20" : "border-slate-200"}`;
  const activityImage = (className = "w-full h-full object-cover") =>
    hasText(activity.imageUrl) ? (
      <img src={activity.imageUrl} alt={linkedWork?.title ?? activity.title} className={className} />
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
                href={`/works#work=${encodeURIComponent(linkedWork.id)}`}
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
                    className: "bg-cyan-500",
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

export default function AboutPage({ overview, activities }: AboutPageProps) {
  const { activeIndex, setActivityRef } = useActiveActivityHighlight();
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();

  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle title="ABOUT" subtitle="自己紹介" />

        <section className="mt-20 mb-32">
          <motion.h2
            custom={{ index: OVERVIEW_TITLE_BLOCK_INDEX, columns: ABOUT_SEQUENCE_COLUMNS }}
            variants={cardItemMotionVariants}
            initial="hidden"
            animate={forceCardVisibleOnRestore ? "visibleInstant" : "visible"}
            className="text-3xl md:text-4xl font-black text-slate-800 mb-12 inline-block border-b-4 border-cyan-500 pb-2"
          >
            OVERVIEW
          </motion.h2>

          <div className="flex flex-col gap-12">
            <motion.div
              custom={{ index: PROFILE_BLOCK_INDEX, columns: ABOUT_SEQUENCE_COLUMNS }}
              variants={cardItemMotionVariants}
              initial="hidden"
              animate={forceCardVisibleOnRestore ? "visibleInstant" : "visible"}
            >
              <div className="flex flex-col md:flex-row gap-8 items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl bg-cyan-50 shrink-0">
                  <img src={PROFILE_ICON_PATH} alt={overview.profile.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                    {overview.profile.name}
                  </h1>
                  <p className="text-cyan-600 font-bold tracking-wider text-sm mt-1">
                    {overview.profile.id}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
                <span className="text-slate-400">所属:</span>
                {overview.affiliations.map((affiliation) => (
                  <span
                    key={affiliation}
                    className="rounded-full border border-slate-200 bg-white/80 px-3 py-1"
                  >
                    {affiliation}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              custom={{ index: INTRODUCTION_BLOCK_INDEX, columns: ABOUT_SEQUENCE_COLUMNS }}
              variants={cardItemMotionVariants}
              initial="hidden"
              animate={forceCardVisibleOnRestore ? "visibleInstant" : "visible"}
            >
              <p className="text-slate-600 leading-loose font-medium text-left">
                {overview.introduction}
              </p>
            </motion.div>

            <motion.div
              custom={{ index: PHILOSOPHY_BLOCK_INDEX, columns: ABOUT_SEQUENCE_COLUMNS }}
              variants={cardItemMotionVariants}
              initial="hidden"
              animate={forceCardVisibleOnRestore ? "visibleInstant" : "visible"}
            >
              <SubsectionTitle title="PHILOSOPHY" />
              <p className="text-slate-600 leading-loose font-medium text-left">
                {overview.philosophy}
              </p>
            </motion.div>

            <motion.div
              custom={{ index: TECH_STACK_BLOCK_INDEX, columns: ABOUT_SEQUENCE_COLUMNS }}
              variants={cardItemMotionVariants}
              initial="hidden"
              animate={forceCardVisibleOnRestore ? "visibleInstant" : "visible"}
            >
              <SubsectionTitle title="TECH STACK" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {overview.techStackGroups.map((stackGroup) => (
                  <div key={stackGroup.category}>
                    <div className="text-cyan-500 font-black text-sm mb-3 border-b-2 border-slate-100 pb-2 inline-block pr-8">
                      {stackGroup.category}
                    </div>
                    <ul className="text-slate-600 font-medium text-sm leading-loose">
                      {stackGroup.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <section className="mb-32 w-full">
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <motion.h2
            custom={{ index: ACTIVITIES_TITLE_BLOCK_INDEX, columns: ABOUT_SEQUENCE_COLUMNS }}
            variants={cardItemMotionVariants}
            initial="hidden"
            animate={forceCardVisibleOnRestore ? "visibleInstant" : "visible"}
            className="text-3xl md:text-4xl font-black text-slate-800 inline-block border-b-4 border-cyan-500 pb-2"
          >
            ACTIVITIES
          </motion.h2>
        </div>

        <div className="flex flex-col">
          {activities.map((activity, index) => (
            <ActivityCard
              key={activity.title}
              ref={(element) => setActivityRef(index, element)}
              activity={activity}
              index={index}
              isActive={activeIndex === index}
              shouldForceVisibleOnRestore={forceCardVisibleOnRestore}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
