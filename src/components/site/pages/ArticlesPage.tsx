/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { SectionTitle } from "../SectionTitle";

type Platform = "All" | "Zenn" | "Qiita" | "traP" | "Own";

type Article = {
  id: string;
  title: string;
  platform: Platform;
  image: string;
  date: string;
  link: string;
};

const articlesData: Article[] = [
  {
    id: "a1",
    title: "ReactとFramer Motionで作るリッチなポートフォリオサイト",
    platform: "Zenn",
    image: "https://images.unsplash.com/photo-1570459106810-fa9cb7b0c0e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBibG9nfGVufDF8fHx8MTc3Nzg4NzQ5NHww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "2024.04.15",
    link: "#",
  },
  {
    id: "a2",
    title: "Unityで始めるシェーダープログラミング入門",
    platform: "Qiita",
    image: "https://images.unsplash.com/photo-1620680779930-e74c15c8f7a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwYXJ0aWNsZXxlbnwxfHx8fDE3Nzc4NzMwMzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "2024.02.20",
    link: "#",
  },
  {
    id: "a3",
    title: "ゲーム開発におけるデザインパターンの活用事例",
    platform: "traP",
    image: "https://images.unsplash.com/photo-1556438064-2d7646166914?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1lJTIwZGV2ZWxvcG1lbnQlMjBibG9nfGVufDF8fHx8MTc3Nzg4NzUwMXww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "2023.11.05",
    link: "#",
  },
  {
    id: "a4",
    title: "自作ブログエンジンを構築した話",
    platform: "Own",
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXNpZ258ZW58MXx8fHwxNzc3ODg2Mjg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "2023.08.12",
    link: "#",
  },
];

const platformColors: Record<Platform, string> = {
  All: "bg-slate-800",
  Zenn: "bg-blue-500",
  Qiita: "bg-green-500",
  traP: "bg-purple-600",
  Own: "bg-cyan-500",
};

export default function ArticlesPage() {
  const [filter, setFilter] = useState<Platform>("All");

  const filteredArticles = filter === "All" 
    ? articlesData 
    : articlesData.filter(a => a.platform === filter);

  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle title="ARTICLES" subtitle="記事一覧" />
        
        <section className="mt-20 mb-32">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3">
          {(["All", "Zenn", "Qiita", "traP", "Own"] as Platform[]).map(p => (
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

        {/* Grid */}
        <motion.div layout className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredArticles.map(article => (
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
        </section>
      </div>
    </div>
  );
}
