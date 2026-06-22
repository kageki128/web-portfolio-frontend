"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  cardItemMotionVariants,
  cardItemViewport,
  useCardGridColumns,
  useForceCardVisibleOnRestore,
} from "../motion/cardItemMotion";
import { useAchievements } from "../achievements/AchievementProvider";
import { SectionTitle } from "../SectionTitle";
import { fetchLinkMetadata } from "@/lib/linkMetadataClient";
import { hasText } from "@/lib/text";
import { runWithConcurrency } from "@/lib/runWithConcurrency";
import {
  PAGE_CONTAINER_CLASS,
  PAGE_SECTION_HEADING_CLASS,
  PAGE_SHELL_CLASS,
  SUBSECTION_HEADING_BAR_CLASS,
  SUBSECTION_HEADING_CLASS,
} from "@/constants/siteStyles";
import type { WorkItem, WorksYearGroup } from "@/types/works";
import { WorkCard } from "./works/WorkCard";
import { useSelectedWork } from "./works/useSelectedWork";

const WorkModal = dynamic(() =>
  import("./works/WorkModal").then((module) => module.WorkModal),
);

type WorksPageProps = {
  featuredWorks: WorkItem[];
  allWorksByYear: WorksYearGroup[];
};

const METADATA_FETCH_CONCURRENCY = 8;
const METADATA_FETCH_TIMEOUT_MS = 12_000;

function isUnresolvedArticleTitle(title: string, link: string): boolean {
  return !hasText(title) || title === link;
}

function applyResolvedArticleTitles(
  work: WorkItem,
  resolvedArticleTitleByLink: Record<string, string>,
): WorkItem {
  let articlesChanged = false;
  const nextArticles = work.articles.map((article) => {
    const resolvedTitle = resolvedArticleTitleByLink[article.link] ?? "";
    if (!isUnresolvedArticleTitle(article.title, article.link) || !hasText(resolvedTitle)) {
      return article;
    }

    articlesChanged = true;
    return {
      ...article,
      title: resolvedTitle,
    };
  });

  if (!articlesChanged) {
    return work;
  }

  return {
    ...work,
    articles: nextArticles,
  };
}

export default function WorksPage({ featuredWorks, allWorksByYear }: WorksPageProps) {
  const [resolvedArticleTitleByLink, setResolvedArticleTitleByLink] = useState<Record<string, string>>({});
  const cardColumns = useCardGridColumns();
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();
  const { recordViewedWork } = useAchievements();

  const displayFeaturedWorks = useMemo(
    () =>
      featuredWorks.map((work) =>
        applyResolvedArticleTitles(work, resolvedArticleTitleByLink),
      ),
    [featuredWorks, resolvedArticleTitleByLink],
  );
  const displayAllWorksByYear = useMemo(
    () =>
      allWorksByYear.map((group) => ({
        ...group,
        items: group.items.map((work) =>
          applyResolvedArticleTitles(work, resolvedArticleTitleByLink),
        ),
      })),
    [allWorksByYear, resolvedArticleTitleByLink],
  );

  const { selectedWork, setSelectedWork, closeWorkModal } = useSelectedWork(
    displayFeaturedWorks,
    displayAllWorksByYear,
  );

  useEffect(() => {
    if (!selectedWork?.id) {
      return;
    }

    recordViewedWork(selectedWork.id);
  }, [recordViewedWork, selectedWork?.id]);

  useEffect(() => {
    if (!selectedWork) return;

    const controller = new AbortController();
    let cancelled = false;
    const articleTitleTargets = selectedWork.articles
      .filter(
        (article) =>
          hasText(article.link) &&
          isUnresolvedArticleTitle(article.title, article.link),
      )
      .map((article) => article.link);

    const enrichWorks = async () => {
      await runWithConcurrency(
        articleTitleTargets,
        METADATA_FETCH_CONCURRENCY,
        async (link) => {
          const metadata = await fetchLinkMetadata(link, {
            includeTitle: true,
            includeImage: false,
            timeoutMs: METADATA_FETCH_TIMEOUT_MS,
            signal: controller.signal,
          });
          if (cancelled || !hasText(metadata.title)) return;

          setResolvedArticleTitleByLink((prev) => {
            if (hasText(prev[link] ?? "")) return prev;
            return {
              ...prev,
              [link]: metadata.title,
            };
          });
        },
      );
    };

    void enrichWorks();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selectedWork]);

  return (
    <div className={PAGE_SHELL_CLASS}>
      <div className={PAGE_CONTAINER_CLASS}>
        <SectionTitle title="WORKS" subtitle="作品" />

        <section className="mt-12 mb-24 sm:mt-20 sm:mb-32">
          <motion.h2
            custom={{ index: 0, columns: 1 }}
            variants={cardItemMotionVariants}
            initial="hidden"
            animate={forceCardVisibleOnRestore ? "visibleInstant" : undefined}
            whileInView="visible"
            viewport={cardItemViewport}
            className={`${PAGE_SECTION_HEADING_CLASS} mb-8 sm:mb-12`}
          >
            FEATURED
          </motion.h2>
          {displayFeaturedWorks.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {displayFeaturedWorks.map((work, index) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  index={index}
                  columns={cardColumns}
                  forceVisible={forceCardVisibleOnRestore}
                  onOpen={setSelectedWork}
                />
              ))}
            </div>
          ) : null}
        </section>

        <section className="mt-16 mb-24 sm:mt-20 sm:mb-32">
          <motion.h2
            custom={{ index: 0, columns: 1 }}
            variants={cardItemMotionVariants}
            initial="hidden"
            animate={forceCardVisibleOnRestore ? "visibleInstant" : undefined}
            whileInView="visible"
            viewport={cardItemViewport}
            className={`${PAGE_SECTION_HEADING_CLASS} mb-10 sm:mb-16`}
          >
            ALL
          </motion.h2>

          {displayAllWorksByYear.length > 0 ? (
            <div className="flex flex-col space-y-14 sm:space-y-20">
              {displayAllWorksByYear.map((group) => (
                <div key={group.year}>
                  <motion.h3
                    custom={{ index: 0, columns: 1 }}
                    variants={cardItemMotionVariants}
                    initial="hidden"
                    animate={forceCardVisibleOnRestore ? "visibleInstant" : undefined}
                    whileInView="visible"
                    viewport={cardItemViewport}
                    className={SUBSECTION_HEADING_CLASS}
                  >
                    <span className={SUBSECTION_HEADING_BAR_CLASS} />
                    {group.year}
                  </motion.h3>
                  <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((work, index) => (
                      <WorkCard
                        key={work.id}
                        work={work}
                        index={index}
                        columns={cardColumns}
                        forceVisible={forceCardVisibleOnRestore}
                        onOpen={setSelectedWork}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      <AnimatePresence>
        {selectedWork ? (
          <WorkModal key={selectedWork.id} work={selectedWork} onClose={closeWorkModal} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
