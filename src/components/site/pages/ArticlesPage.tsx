/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { cardItemMotionVariants } from "../motion/cardItemMotion";
import { SectionTitle } from "../SectionTitle";
import type { ArticleItem, ArticlePlatformFilter } from "@/types/articles";

const platformThemeColors: Record<ArticlePlatformFilter, string> = {
  All: "#1E293B",
  Zenn: "#3EA8FF",
  Qiita: "#55C500",
  traP: "#005BAC",
  Blog: "#06B6D4",
};

const platformFilters: ArticlePlatformFilter[] = ["All", "Blog", "Qiita", "Zenn", "traP"];

type ArticleCardProps = {
  article: ArticleItem;
  index: number;
};

function ArticleCard({ article, index }: ArticleCardProps) {
  const isExternalLink = article.link.startsWith("http://") || article.link.startsWith("https://");
  const isLocalBlog = article.platform === "Blog";

  const content = (
    <>
      <div className="aspect-[16/9] w-full overflow-hidden relative bg-white">
        {!isLocalBlog && article.image && (
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-slate-400 font-bold text-xs">{article.date}</div>
          <span
            style={{ backgroundColor: platformThemeColors[article.platform] }}
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
        custom={index}
        variants={cardItemMotionVariants}
        initial="hidden"
        animate="visible"
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
      custom={index}
      variants={cardItemMotionVariants}
      initial="hidden"
      animate="visible"
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

  const filteredArticles = useMemo(
    () => (filter === "All" ? articles : articles.filter((article) => article.platform === filter)),
    [articles, filter],
  );

  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle title="ARTICLES" subtitle="記事一覧" />
        
        <section className="mt-20 mb-32">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {platformFilters.map((platform) => {
              const isActive = filter === platform;
              const color = platformThemeColors[platform];

              return (
                <button
                  key={platform}
                  onClick={() => setFilter(platform)}
                  style={isActive ? { backgroundColor: color, borderColor: color } : { color, borderColor: `${color}66` }}
                  className={`px-6 py-2.5 rounded-full border font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg ${
                    isActive ? "text-white shadow-lg" : "bg-white hover:opacity-90"
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
                <ArticleCard key={article.id} article={article} index={index} />
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
