"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  cardItemMotionVariants,
  cardItemViewport,
  useCardGridColumns,
  useForceCardVisibleOnRestore,
} from "../motion/cardItemMotion";
import { SectionTitle } from "../SectionTitle";
import { PAGE_SECTION_HEADING_CLASS, SUBSECTION_HEADING_BAR_CLASS } from "@/constants/siteStyles";
import { hasText } from "@/lib/text";
import type { WorkItem, WorksYearGroup } from "@/types/works";
import { WorkCard } from "./works/WorkCard";
import { WorkModal } from "./works/WorkModal";
import { useSelectedWork } from "./works/useSelectedWork";

type WorksPageProps = {
  featuredWorks: WorkItem[];
  allWorksByYear: WorksYearGroup[];
};

type WorksMetadataResponse = {
  workImagesById: Record<string, string>;
  articleTitlesByLink: Record<string, string>;
};

export default function WorksPage({ featuredWorks, allWorksByYear }: WorksPageProps) {
  const [displayFeaturedWorks, setDisplayFeaturedWorks] = useState(featuredWorks);
  const [displayAllWorksByYear, setDisplayAllWorksByYear] = useState(allWorksByYear);
  const cardColumns = useCardGridColumns();
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();
  const { selectedWork, setSelectedWork, closeWorkModal } = useSelectedWork(
    displayFeaturedWorks,
    displayAllWorksByYear,
  );

  useEffect(() => {
    let cancelled = false;

    const enrichWorks = async () => {
      try {
        const response = await fetch("/api/works/metadata");
        if (!response.ok) {
          return;
        }

        const metadata = (await response.json()) as WorksMetadataResponse;
        if (cancelled) {
          return;
        }

        const enrichWork = (work: WorkItem): WorkItem => {
          const resolvedImage = metadata.workImagesById[work.id];
          const nextArticles = work.articles.map((article) => {
            const resolvedTitle = metadata.articleTitlesByLink[article.link] ?? "";
            if (hasText(article.title) || !hasText(resolvedTitle)) {
              return article;
            }

            return {
              ...article,
              title: resolvedTitle,
            };
          });

          return {
            ...work,
            image: hasText(work.image) ? work.image : (resolvedImage ?? ""),
            articles: nextArticles,
          };
        };

        setDisplayFeaturedWorks((prev) => prev.map(enrichWork));
        setDisplayAllWorksByYear((prev) =>
          prev.map((group) => ({
            ...group,
            items: group.items.map(enrichWork),
          })),
        );
      } catch {
        // 補完に失敗しても初期データで表示を継続する
      }
    };

    void enrichWorks();
    return () => {
      cancelled = true;
    };
  }, []);

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
                    className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3"
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
