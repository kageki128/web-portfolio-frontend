"use client";

import { AnimatePresence, motion } from "framer-motion";
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
import { PAGE_SECTION_HEADING_CLASS, SUBSECTION_HEADING_BAR_CLASS } from "@/constants/siteStyles";
import type { WorkItem, WorksYearGroup } from "@/types/works";
import { WorkCard } from "./works/WorkCard";
import { WorkModal } from "./works/WorkModal";
import { useSelectedWork } from "./works/useSelectedWork";

type WorksPageProps = {
  featuredWorks: WorkItem[];
  allWorksByYear: WorksYearGroup[];
};

const METADATA_FETCH_CONCURRENCY = 8;
const METADATA_FETCH_TIMEOUT_MS = 12_000;

function isUnresolvedArticleTitle(title: string, link: string): boolean {
  return !hasText(title) || title === link;
}

function applyResolvedMetadataToWork(
  work: WorkItem,
  resolvedWorkImageById: Record<string, string>,
  resolvedArticleTitleByLink: Record<string, string>,
): WorkItem {
  const resolvedImage = hasText(work.image) ? work.image : (resolvedWorkImageById[work.id] ?? "");
  const imageChanged = resolvedImage !== work.image;

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

  if (!imageChanged && !articlesChanged) {
    return work;
  }

  return {
    ...work,
    image: resolvedImage,
    articles: articlesChanged ? nextArticles : work.articles,
  };
}

export default function WorksPage({ featuredWorks, allWorksByYear }: WorksPageProps) {
  const [resolvedWorkImageById, setResolvedWorkImageById] = useState<Record<string, string>>({});
  const [resolvedArticleTitleByLink, setResolvedArticleTitleByLink] = useState<Record<string, string>>({});
  const cardColumns = useCardGridColumns();
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();
  const { recordViewedWork } = useAchievements();

  const displayFeaturedWorks = useMemo(
    () =>
      featuredWorks.map((work) =>
        applyResolvedMetadataToWork(work, resolvedWorkImageById, resolvedArticleTitleByLink),
      ),
    [featuredWorks, resolvedArticleTitleByLink, resolvedWorkImageById],
  );
  const displayAllWorksByYear = useMemo(
    () =>
      allWorksByYear.map((group) => ({
        ...group,
        items: group.items.map((work) =>
          applyResolvedMetadataToWork(work, resolvedWorkImageById, resolvedArticleTitleByLink),
        ),
      })),
    [allWorksByYear, resolvedArticleTitleByLink, resolvedWorkImageById],
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
    const controller = new AbortController();
    let cancelled = false;

    const worksById = new Map<string, WorkItem>();
    featuredWorks.forEach((work) => worksById.set(work.id, work));
    allWorksByYear.forEach((group) => {
      group.items.forEach((work) => worksById.set(work.id, work));
    });

    const workImageTargets = Array.from(worksById.values())
      .filter((work) => !hasText(work.image) && hasText(work.link))
      .map((work) => ({ workId: work.id, link: work.link }));

    const articleTitleTargets = Array.from(
      new Set(
        Array.from(worksById.values()).flatMap((work) =>
          work.articles
            .filter((article) => hasText(article.link) && isUnresolvedArticleTitle(article.title, article.link))
            .map((article) => article.link),
        ),
      ),
    );

    const enrichWorks = async () => {
      await Promise.all([
        runWithConcurrency(workImageTargets, METADATA_FETCH_CONCURRENCY, async ({ workId, link }) => {
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
        }),
        runWithConcurrency(articleTitleTargets, METADATA_FETCH_CONCURRENCY, async (link) => {
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
        }),
      ]);
    };

    void enrichWorks();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [featuredWorks, allWorksByYear]);

  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle title="WORKS" subtitle="作品" />

        <section className="mt-20 mb-32">
          <motion.h2
            custom={{ index: 0, columns: 1 }}
            variants={cardItemMotionVariants}
            initial="hidden"
            animate={forceCardVisibleOnRestore ? "visibleInstant" : undefined}
            whileInView="visible"
            viewport={cardItemViewport}
            className={`${PAGE_SECTION_HEADING_CLASS} mb-12`}
          >
            FEATURED
          </motion.h2>
          {displayFeaturedWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

        <section className="mt-20 mb-32">
          <motion.h2
            custom={{ index: 0, columns: 1 }}
            variants={cardItemMotionVariants}
            initial="hidden"
            animate={forceCardVisibleOnRestore ? "visibleInstant" : undefined}
            whileInView="visible"
            viewport={cardItemViewport}
            className={`${PAGE_SECTION_HEADING_CLASS} mb-16`}
          >
            ALL
          </motion.h2>

          {displayAllWorksByYear.length > 0 ? (
            <div className="flex flex-col space-y-20">
              {displayAllWorksByYear.map((group) => (
                <div key={group.year}>
                  <motion.h3
                    custom={{ index: 0, columns: 1 }}
                    variants={cardItemMotionVariants}
                    initial="hidden"
                    animate={forceCardVisibleOnRestore ? "visibleInstant" : undefined}
                    whileInView="visible"
                    viewport={cardItemViewport}
                    className="text-xl font-black text-ink mb-6 flex items-center gap-3"
                  >
                    <span className={SUBSECTION_HEADING_BAR_CLASS} />
                    {group.year}
                  </motion.h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        {selectedWork ? <WorkModal work={selectedWork} onClose={closeWorkModal} /> : null}
      </AnimatePresence>
    </div>
  );
}
