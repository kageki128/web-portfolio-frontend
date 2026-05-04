/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { SectionTitle } from "../SectionTitle";
import type { ArticleItem, ArticlePlatformFilter } from "@/types/articles";

const platformColors: Record<ArticlePlatformFilter, string> = {
  All: "bg-slate-800",
  Zenn: "bg-blue-500",
  Qiita: "bg-green-500",
  traP: "bg-purple-600",
  Own: "bg-cyan-500",
};

async function fetchArticles(signal?: AbortSignal) {
  const response = await fetch("/api/articles", { cache: "no-store", signal });
  if (!response.ok) throw new Error("Failed to fetch articles");
  return (await response.json()) as ArticleItem[];
}

export default function ArticlesPage() {
  const [filter, setFilter] = useState<ArticlePlatformFilter>("All");
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadArticles = async () => {
      try {
        const data = await fetchArticles(controller.signal);
        setArticles(data);
        setHasError(false);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setHasError(true);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadArticles();
    return () => controller.abort();
  }, []);

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
          {(["All", "Own", "Qiita", "Zenn", "traP"] as ArticlePlatformFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                filter === p 
                  ? `${platformColors[p]} text-white shadow-lg` 
                  : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="mt-12 text-center text-slate-500 font-semibold">記事を読み込んでいます...</div>
        )}
        {hasError && (
          <div className="mt-12 text-center text-red-500 font-semibold">記事の取得に失敗しました。</div>
        )}

        {/* Grid */}
        <motion.div layout className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredArticles.map((article) => (
              <motion.a
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={article.id}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-100 transition-all hover:-translate-y-2"
              >
                <div className="aspect-[16/9] w-full overflow-hidden relative">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6 relative">
                  <div className="absolute bottom-6 right-6 text-slate-300 group-hover:text-cyan-500 transition-colors">
                    <ExternalLink size={18} />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-slate-400 font-bold text-xs">{article.date}</div>
                    <span className={`${platformColors[article.platform]} text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-md`}>
                      {article.platform}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 leading-[1.5] group-hover:text-cyan-600 transition-colors line-clamp-2 min-h-[3em]">
                    {article.title}
                  </h3>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>
        {!isLoading && !hasError && filteredArticles.length === 0 && (
          <div className="mt-12 text-center text-slate-500 font-semibold">記事がまだありません。</div>
        )}
        </section>
      </div>
    </div>
  );
}
