/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { SectionTitle } from "../SectionTitle";
import {
  cardItemMotionVariants,
  useForceCardVisibleOnRestore,
} from "../motion/cardItemMotion";
import { fetchLinkMetadata } from "@/lib/linkMetadataClient";
import { hasText } from "@/lib/text";
import { runWithConcurrency } from "@/lib/runWithConcurrency";
import { PROFILE_ICON_PATH } from "@/constants/assets";
import { PAGE_SECTION_HEADING_CLASS } from "@/constants/siteStyles";
import type { AboutActivity, AboutOverview } from "@/types/about";
import { ActivityCard } from "./about/ActivityCard";
import { SubsectionTitle } from "./about/SubsectionTitle";
import { useActiveActivityHighlight } from "./about/useActiveActivityHighlight";

type AboutPageProps = {
  overview: AboutOverview;
  activities: AboutActivity[];
};

const ABOUT_SEQUENCE_COLUMNS = Number.MAX_SAFE_INTEGER;
const OVERVIEW_TITLE_BLOCK_INDEX = 0;
const PROFILE_BLOCK_INDEX = 1;
const INTRODUCTION_BLOCK_INDEX = 2;
const PHILOSOPHY_BLOCK_INDEX = 3;
const TECH_STACK_BLOCK_INDEX = 4;
const ACTIVITIES_TITLE_BLOCK_INDEX = 5;
const METADATA_FETCH_CONCURRENCY = 8;
const METADATA_FETCH_TIMEOUT_MS = 12_000;

export default function AboutPage({ overview, activities }: AboutPageProps) {
  const { activeIndex, setActivityRef } = useActiveActivityHighlight();
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();
  const [resolvedWorkImageById, setResolvedWorkImageById] = useState<Record<string, string>>({});

  const displayActivities = useMemo(
    () =>
      activities.map((activity) => {
        if (hasText(activity.imageUrl) || !activity.work) {
          return activity;
        }

        const resolvedImage = resolvedWorkImageById[activity.work.id] ?? "";
        if (!hasText(resolvedImage)) {
          return activity;
        }

        return {
          ...activity,
          imageUrl: resolvedImage,
        };
      }),
    [activities, resolvedWorkImageById],
  );

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const targets = activities.flatMap((activity) => {
      if (!activity.work || hasText(activity.imageUrl) || !hasText(activity.work.link)) {
        return [];
      }
      return [{ workId: activity.work.id, link: activity.work.link }];
    });

    const enrichActivities = async () => {
      await runWithConcurrency(targets, METADATA_FETCH_CONCURRENCY, async ({ workId, link }) => {
        const metadata = await fetchLinkMetadata(link, {
          includeTitle: false,
          includeImage: true,
          timeoutMs: METADATA_FETCH_TIMEOUT_MS,
          waitForCompleteImageFetch: true,
          signal: controller.signal,
        });
        if (cancelled || !hasText(metadata.image)) return;

        setResolvedWorkImageById((prev) => {
          if (hasText(prev[workId] ?? "")) return prev;
          return {
            ...prev,
            [workId]: metadata.image,
          };
        });
      });
    };

    void enrichActivities();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [activities]);

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
            className={`${PAGE_SECTION_HEADING_CLASS} mb-12`}
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
                <span className="text-slate-400">Affiliations:</span>
                {overview.affiliations.map((affiliation) => (
                  <span
                    key={affiliation}
                    className="rounded-full border border-slate-200 bg-white/80 px-3 py-1"
                  >
                    {affiliation}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
                <span className="text-slate-400">Contact:</span>
                <a
                  href={`mailto:${overview.contact.email}`}
                  className="text-cyan-600 visited:text-cyan-600 hover:text-cyan-600 hover:underline underline-offset-2"
                >
                  {overview.contact.email}
                </a>
                <span>
                  {overview.contact.name}
                </span>
              </div>
            </motion.div>

            <motion.div
              custom={{ index: INTRODUCTION_BLOCK_INDEX, columns: ABOUT_SEQUENCE_COLUMNS }}
              variants={cardItemMotionVariants}
              initial="hidden"
              animate={forceCardVisibleOnRestore ? "visibleInstant" : "visible"}
            >
              <p className="text-slate-600 leading-loose font-medium text-left whitespace-pre-line">
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
              <p className="text-slate-600 leading-loose font-medium text-left whitespace-pre-line">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
                {overview.techStackGroups.map((stackGroup) => (
                  <div key={stackGroup.category}>
                    <div className="text-cyan-500 font-black text-sm mb-3">
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
            className={PAGE_SECTION_HEADING_CLASS}
          >
            ACTIVITIES
          </motion.h2>
        </div>

        <div className="flex flex-col">
          {displayActivities.map((activity, index) => (
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
