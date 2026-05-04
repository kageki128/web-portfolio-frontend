/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { cardItemMotionVariants } from "../motion/cardItemMotion";
import { SectionTitle } from "../SectionTitle";
import type { ArticleItem, ArticlePlatformFilter } from "@/types/articles";

const platformColors: Record<ArticlePlatformFilter, string> = {
  All: "bg-slate-800",
  Zenn: "bg-blue-500",
  Qiita: "bg-green-500",
  traP: "bg-purple-600",
  Blog: "bg-cyan-500",
};

const platformFilters: ArticlePlatformFilter[] = ["All", "Blog", "Qiita", "Zenn", "traP"];

type ArticleCardProps = {
  article: ArticleItem;
  index: number;
};

function ArticleCard({ article, index }: ArticleCardProps) {
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
      <div className="aspect-[16/9] w-full overflow-hidden relative">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-slate-400 font-bold text-xs">{article.date}</div>
          <span className={`${platformColors[article.platform]} text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-md`}>
            {article.platform}
          </span>
          <div className="ml-auto text-slate-300 group-hover:text-cyan-500 transition-colors">
            <ExternalLink size={18} />
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-800 leading-[1.5] group-hover:text-cyan-600 transition-colors line-clamp-2 min-h-[3em]">
          {article.title}
        </h3>
      </div>
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
            {platformFilters.map((platform) => (
              <button
                key={platform}
                onClick={() => setFilter(platform)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                  filter === platform
                    ? `${platformColors[platform]} text-white shadow-lg`
                    : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {platform}
              </button>
            ))}
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
