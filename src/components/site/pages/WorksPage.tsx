/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink, Users, Calendar, Wrench, BadgeCheck, BookOpen } from "lucide-react";
import {
  cardItemMotionVariants,
  cardItemViewport,
  useCardGridColumns,
  useForceCardVisibleOnRestore,
} from "../motion/cardItemMotion";
import { SectionTitle } from "../SectionTitle";
import type { WorkItem, WorksYearGroup } from "@/types/works";

type WorksPageProps = {
  featuredWorks: WorkItem[];
  allWorksByYear: WorksYearGroup[];
};

const WORK_IMAGE_ASPECT_CLASS = "aspect-[16/9]";

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

type WorkCardProps = {
  work: WorkItem;
  index: number;
  columns: number;
  forceVisible: boolean;
  onOpen: (work: WorkItem) => void;
};

function WorkCard({ work, index, columns, forceVisible, onOpen }: WorkCardProps) {
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
      className="group block w-full text-left bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-100 transition-shadow cursor-pointer"
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
            <span key={tag} className="bg-cyan-500 text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-md">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-bold text-slate-800 leading-[1.5] group-hover:text-cyan-600 transition-colors line-clamp-2 min-h-[3em] mb-3">
          {work.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 min-h-[4.5em]">{work.desc}</p>
      </div>
    </motion.button>
  );
}

export default function WorksPage({ featuredWorks, allWorksByYear }: WorksPageProps) {
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const cardColumns = useCardGridColumns();
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();

  const nonEmptyYearGroups = useMemo(
    () => allWorksByYear.filter((group) => group.items.length > 0),
    [allWorksByYear],
  );

  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle title="WORKS" subtitle="作品" />

        <section className="mt-20 mb-32">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-12 inline-block border-b-4 border-cyan-500 pb-2">
            FEATURED
          </h2>
          {featuredWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredWorks.map((work, index) => (
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
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-16 inline-block border-b-4 border-cyan-500 pb-2">
            ALL
          </h2>

          {nonEmptyYearGroups.length > 0 ? (
            <div className="flex flex-col space-y-20">
              {nonEmptyYearGroups.map((group) => (
                <div key={group.year}>
                  <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-cyan-500 inline-block"></span>
                    {group.year}
                  </h3>
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
        {selectedWork && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm cursor-pointer"
              onClick={() => setSelectedWork(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-y-auto flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedWork(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
              >
                <X size={20} />
              </button>

              <div className={`w-full ${WORK_IMAGE_ASPECT_CLASS} bg-slate-900 relative shrink-0 overflow-hidden`}>
                {hasText(selectedWork.image) ? (
                  <img src={selectedWork.image} alt={selectedWork.title} className="w-full h-full object-cover" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <div className="text-slate-200 font-bold text-xs">{selectedWork.date}</div>
                    {selectedWork.tags.map((tag) => (
                      <span key={tag} className="bg-cyan-500 text-white text-xs font-black px-3 py-1 rounded-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight break-words">
                      {selectedWork.title}
                    </h2>
                    {hasText(selectedWork.link) ? (
                      <a
                        href={selectedWork.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 self-end items-center gap-3 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-full font-bold tracking-widest transition-colors shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
                      >
                        VIEW WORK <ExternalLink size={18} />
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="inline-flex shrink-0 self-end items-center gap-3 bg-slate-500 text-white px-6 py-3 rounded-full font-bold tracking-widest cursor-not-allowed opacity-80"
                      >
                        NO LINK
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
                  <h3 className="text-sm font-bold text-slate-400 mb-3 tracking-wider">OVERVIEW</h3>
                  <p className="text-slate-700 leading-relaxed font-medium text-lg">{selectedWork.desc}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <Users className="text-cyan-500 mt-1 shrink-0" size={24} />
                    <div>
                      <div className="text-xs font-bold text-slate-400 mb-1">MEMBERS</div>
                      <div className="font-medium text-slate-800">{selectedWork.members}</div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <BadgeCheck className="text-cyan-500 mt-1 shrink-0" size={24} />
                    <div>
                      <div className="text-xs font-bold text-slate-400 mb-1">ROLE</div>
                      <div className="font-medium text-slate-800">{selectedWork.role}</div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <Wrench className="text-cyan-500 mt-1 shrink-0" size={24} />
                    <div>
                      <div className="text-xs font-bold text-slate-400 mb-1">TECH STACK</div>
                      <div className="font-medium text-slate-800">{selectedWork.tech}</div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <Calendar className="text-cyan-500 mt-1 shrink-0" size={24} />
                    <div>
                      <div className="text-xs font-bold text-slate-400 mb-1">DURATION</div>
                      <div className="font-medium text-slate-800">{selectedWork.duration}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
                  <h3 className="text-sm font-bold text-slate-400 mb-4 tracking-wider flex items-center gap-2">
                    <BookOpen size={16} className="text-cyan-500" />
                    <span>RELATED ARTICLES</span>
                  </h3>
                  {selectedWork.articles.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {selectedWork.articles.map((article) => (
                        <a
                          key={article.link}
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 text-slate-700 hover:text-cyan-600 font-medium transition-colors p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100"
                        >
                          <ExternalLink
                            size={18}
                            className="text-slate-400 group-hover:text-cyan-500 transition-colors shrink-0"
                          />
                          <span className="line-clamp-1">{hasText(article.title) ? article.title : article.link}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 font-medium">関連記事はありません。</p>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
