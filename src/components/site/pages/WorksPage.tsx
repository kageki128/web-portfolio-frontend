/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink, Users, Calendar, Wrench, User } from "lucide-react";
import { SectionTitle } from "../SectionTitle";

type Work = {
  id: string;
  title: string;
  tags: string[];
  image: string;
  date: string;
  desc: string;
  role: string;
  tech: string;
  duration: string;
  members: string;
  link: string;
  year: number;
  relatedArticles?: { title: string; url: string }[];
};

const worksData: Work[] = [
  {
    id: "w1",
    title: "Neon Pulse",
    tags: ["Game", "Unity"],
    image: "https://images.unsplash.com/photo-1556438064-2d7646166914?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1lJTIwZGV2ZWxvcG1lbnR8ZW58MXx8fHwxNzc3ODg3NDA2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "2023.10",
    desc: "サイバーパンクな世界観を舞台にしたリズムアクションゲーム。WebGL向けに最適化され、ブラウザ上で軽快に動作します。",
    role: "リードエンジニア / UIデザイン",
    tech: "Unity, C#, WebGL, HLSL",
    duration: "約3ヶ月",
    members: "3名",
    link: "https://example.com/neon-pulse",
    year: 2023,
    relatedArticles: [
      { title: "開発秘話：Neon Pulseの描画最適化について", url: "#" },
      { title: "WebGL向けシェーダー実装の工夫", url: "#" }
    ]
  },
  {
    id: "w2",
    title: "Sword & Magic",
    tags: ["Game", "UE5"],
    image: "https://images.unsplash.com/photo-1528723624453-3e53a413b392?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3Rpb24lMjBnYW1lfGVufDF8fHx8MTc3Nzg4NzQ0OHww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "2024.01",
    desc: "Unreal Engine 5を使用したハイスピードアクションRPG。流麗なコンボシステムと、美しいエフェクト表現が特徴。",
    role: "個人制作",
    tech: "Unreal Engine 5, Blueprints, C++",
    duration: "約6ヶ月",
    members: "1名",
    link: "https://example.com/sword-magic",
    year: 2024,
    relatedArticles: [
      { title: "UE5でのコンボシステム構築手順", url: "#" }
    ]
  },
  {
    id: "w3",
    title: "Stellarium Web",
    tags: ["Web", "React"],
    image: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBhcHBsaWNhdGlvbiUyMHVpfGVufDF8fHx8MTc3Nzg4NzQ1M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "2024.03",
    desc: "架空のゲーム公式サイトをイメージして作成したポートフォリオサイト。スクロール連動のアニメーションやリッチな演出を多数盛り込んでいます。",
    role: "フロントエンド / デザイン",
    tech: "React, TailwindCSS, Framer Motion",
    duration: "約1ヶ月",
    members: "1名",
    link: "https://example.com",
    year: 2024,
    relatedArticles: [
      { title: "ポートフォリオサイトのデザインプロセス", url: "#" }
    ]
  },
  {
    id: "w4",
    title: "Pocket Dungeon",
    tags: ["Game", "Mobile"],
    image: "https://images.unsplash.com/photo-1621529931703-1795723337f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRybyUyMHBpeGVsJTIwZ2FtZXxlbnwxfHx8fDE3Nzc4ODc0NTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "2022.08",
    desc: "ドット絵のローグライクRPG。ランダム生成されるダンジョンを探索し、最深部を目指します。スマホ向けに片手で遊べるUIを追求しました。",
    role: "企画 / プログラム",
    tech: "Unity, C#",
    duration: "約2ヶ月",
    members: "2名",
    link: "https://example.com/pocket-dungeon",
    year: 2022,
    relatedArticles: []
  },
];

export default function WorksPage() {
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  const years = Array.from(new Set(worksData.map(w => w.year))).sort((a, b) => b - a);

  const WorkCard = ({ work }: { work: Work }) => (
    <div 
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-100 transition-all hover:-translate-y-2 cursor-pointer"
      onClick={() => setSelectedWork(work)}
    >
      <div className="aspect-[16/9] w-full overflow-hidden relative">
        <img src={work.image} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {work.tags.map(tag => (
            <span key={tag} className="bg-cyan-500 text-white text-[10px] font-black font-heading px-2 py-0.5 rounded-sm shadow-md">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-bold text-slate-800 leading-[1.5] group-hover:text-cyan-600 transition-colors line-clamp-2 min-h-[3em] mb-3">
          {work.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 min-h-[4.5em]">
          {work.desc}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle title="WORKS" subtitle="作品" />

        {/* Featured Works */}
        <section className="mt-20 mb-32">
          <h2 className="text-3xl md:text-4xl font-black font-heading text-slate-800 mb-12 inline-block border-b-4 border-cyan-500 pb-2">
            FEATURED
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {worksData.slice(0, 2).map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
      </section>

      {/* All Works */}
      <section className="mt-20 mb-32">
        <h2 className="text-3xl md:text-4xl font-black font-heading text-slate-800 mb-16 inline-block border-b-4 border-cyan-500 pb-2">
          ALL WORKS
        </h2>
        
        <div className="flex flex-col space-y-20">
          {years.map(year => (
            <div key={year}>
              <h3 className="text-xl font-black font-heading text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-cyan-500 inline-block"></span>
                {year}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {worksData.filter(w => w.year === year).map((work) => (
                  <WorkCard key={work.id} work={work} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      </div>

      {/* Work Modal */}
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
              
              <div className="w-full aspect-[16/9] bg-slate-900 relative shrink-0">
                <img src={selectedWork.image} alt={selectedWork.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedWork.tags.map(tag => (
                      <span key={tag} className="bg-cyan-500 text-white font-heading text-xs font-black px-3 py-1 rounded-sm">{tag}</span>
                    ))}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black font-heading text-white tracking-tight">{selectedWork.title}</h2>
                </div>
              </div>

              <div className="p-8 bg-slate-50">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
                  <h3 className="text-sm font-bold text-slate-400 mb-3 tracking-wider font-heading">OVERVIEW</h3>
                  <p className="text-slate-700 leading-relaxed font-medium text-lg">
                    {selectedWork.desc}
                  </p>
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
                    <User className="text-cyan-500 mt-1 shrink-0" size={24} />
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

                {selectedWork.relatedArticles && selectedWork.relatedArticles.length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
                    <h3 className="text-sm font-bold text-slate-400 mb-4 tracking-wider font-heading">RELATED ARTICLES</h3>
                    <div className="flex flex-col gap-3">
                      {selectedWork.relatedArticles.map((article, i) => (
                        <a 
                          key={i} 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="group flex items-center gap-3 text-slate-700 hover:text-cyan-600 font-medium transition-colors p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100"
                        >
                          <ExternalLink size={18} className="text-slate-400 group-hover:text-cyan-500 transition-colors shrink-0" />
                          <span className="line-clamp-1">{article.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center mt-4">
                  <a 
                    href={selectedWork.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-full font-bold font-heading tracking-widest transition-colors shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
                  >
                    VIEW PROJECT <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
