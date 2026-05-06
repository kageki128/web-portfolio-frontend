/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import {
  cardItemMotionVariants,
  cardItemViewport,
  useCardGridColumns,
  useForceCardVisibleOnRestore,
} from "../motion/cardItemMotion";
import { SectionTitle } from "../SectionTitle";
import { ARTICLE_PLATFORM_COLORS, ARTICLE_PLATFORM_FILTERS } from "@/constants/colors";
import type { ArticleItem, ArticlePlatformFilter } from "@/types/articles";

type ArticleCardProps = {
  article: ArticleItem;
  index: number;
  columns: number;
  forceVisible: boolean;
};

function ArticleCard({ article, index, columns, forceVisible }: ArticleCardProps) {
  const isExternalLink = article.link.startsWith("http://") || article.link.startsWith("https://");

  const content = (
    <>
      <div className="aspect-[16/9] w-full overflow-hidden relative bg-white">
        {article.image && (
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-slate-400 font-bold text-xs">{article.date}</div>
          <span
            style={{ backgroundColor: ARTICLE_PLATFORM_COLORS[article.platform] }}
            className="text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-md"
          >
            {article.platform}
          </span>
          {isExternalLink && (
            <div className="ml-auto text-slate-300 group-hover:text-cyan-500 transition-colors">
              <ExternalLink size={18} />
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-800 leading-[1.5] group-hover:text-cyan-600 transition-colors line-clamp-2 min-h-[3em]">
          {article.title}
        </h3>
      </div>
    </>
  );

  if (!isExternalLink) {
    return (
      <motion.article
        custom={{ index, columns }}
        variants={cardItemMotionVariants}
        initial="hidden"
        animate={forceVisible ? "visibleInstant" : undefined}
        whileInView="visible"
        viewport={cardItemViewport}
        exit="exit"
        whileHover="hover"
        className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-100 transition-shadow"
      >
        <Link href={article.link} className="block">
          {content}
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.a
      custom={{ index, columns }}
      variants={cardItemMotionVariants}
      initial="hidden"
      animate={forceVisible ? "visibleInstant" : undefined}
      whileInView="visible"
      viewport={cardItemViewport}
      exit="exit"
      whileHover="hover"
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-100 transition-shadow"
    >
      {content}
    </motion.a>
  );
}

type ArticlesPageProps = {
  articles: ArticleItem[];
};

export default function ArticlesPage({ articles }: ArticlesPageProps) {
  const [filter, setFilter] = useState<ArticlePlatformFilter>("All");
  const cardColumns = useCardGridColumns();
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();

  const filteredArticles = useMemo(
    () => (filter === "All" ? articles : articles.filter((article) => article.platform === filter)),
    [articles, filter],
  );

  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle title="ARTICLES" subtitle="記事" />
        
        <section className="mt-20 mb-32">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {ARTICLE_PLATFORM_FILTERS.map((platform) => {
              const isActive = filter === platform;
              const color = ARTICLE_PLATFORM_COLORS[platform];
              const buttonStyle: CSSProperties = isActive
                ? {
                    "--filter-color": color,
                    backgroundColor: "var(--filter-color)",
                    borderColor: "var(--filter-color)",
                  }
                : {
                    "--filter-color": color,
                    borderColor: `${color}66`,
                  };

              return (
                <button
                  key={platform}
                  onClick={() => setFilter(platform)}
                  style={buttonStyle}
                  className={`px-6 py-2.5 rounded-full border bg-white font-bold text-sm transition-colors duration-200 hover:bg-[var(--filter-color)] hover:border-[var(--filter-color)] hover:text-white hover:shadow-lg ${
                    isActive ? "text-white shadow-lg" : "text-[var(--filter-color)]"
                  }`}
                >
                  {platform}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence key={filter}>
              {filteredArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                  columns={cardColumns}
                  forceVisible={forceCardVisibleOnRestore}
                />
              ))}
            </AnimatePresence>
          </div>
          {filteredArticles.length === 0 && (
            <div className="mt-12 text-center text-slate-500 font-semibold">記事はまだありません。</div>
          )}
        </section>
      </div>
    </div>
  );
}
