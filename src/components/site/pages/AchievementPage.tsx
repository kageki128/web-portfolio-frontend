"use client";

import { motion } from "framer-motion";
import { Trophy, Lock, CheckCircle2 } from "lucide-react";
import { SectionTitle } from "../SectionTitle";

type Achievement = {
  id: string;
  title: string;
  desc: string;
  isUnlocked: boolean;
};

// Mock achievements data.
// In a real app, isUnlocked would be populated from localStorage.
const initialAchievements: Achievement[] = [
  { id: "a1", title: "Welcome to Stellarium", desc: "サイトに初めて訪問した", isUnlocked: true },
  { id: "a2", title: "Explorer", desc: "すべてのページ(Home, About, Works, Articles, Interests)を開いた", isUnlocked: false },
  { id: "a3", title: "Reader", desc: "Articlesページで記事のリンクを1つ開いた", isUnlocked: true },
  { id: "a4", title: "Curious", desc: "Worksページで作品の詳細モーダルを開いた", isUnlocked: true },
  { id: "a5", title: "Gamer", desc: "Otogeページで1回プレイした", isUnlocked: false },
  { id: "a6", title: "Master", desc: "OtogeページでランクSを獲得した", isUnlocked: false },
];

export default function AchievementPage() {
  const achievements = initialAchievements;

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const isCompleted = unlockedCount === totalCount;

  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <section className="max-w-4xl mx-auto px-6">
        <SectionTitle title="ACHIEVEMENT" subtitle="実績" />
        
        {/* Progress Header */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 mb-8 md:mb-16">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-slate-200 shadow-inner shrink-0">
              <Trophy size={40} className={isCompleted ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "text-slate-400"} />
            </div>
            <div>
              <div className="text-slate-500 font-bold tracking-widest text-sm mb-1">COMPLETION RATE</div>
              <div className="text-5xl font-black text-slate-800">
                <span className="text-cyan-500">{unlockedCount}</span>
                <span className="text-slate-300 mx-2">/</span>
                <span className="text-slate-300">{totalCount}</span>
              </div>
            </div>
          </div>

          <div className="min-w-[280px] text-center md:text-right w-full md:w-auto">
            <div className="text-slate-500 font-bold tracking-widest text-xs mb-3">COMPLETE REWARD</div>
            {isCompleted ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-yellow-500 font-black text-lg">
                Hidden Difficulty Unlocked!
              </motion.div>
            ) : (
              <div className="flex items-center justify-center md:justify-end gap-2 text-slate-400 font-black text-2xl tracking-widest">
                <Lock size={20} /> ???
              </div>
            )}
            {/* Progress Bar */}
            <div className="mt-4 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mt-16 space-y-4">
          {achievements.map((a, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={a.id} 
              className={`p-6 rounded-xl border flex items-center gap-6 transition-all ${
                a.isUnlocked 
                  ? "bg-white border-slate-200 shadow-sm" 
                  : "bg-slate-50 border-slate-100 opacity-60 grayscale-[0.5]"
              }`}
            >
              <div className="shrink-0">
                {a.isUnlocked ? (
                  <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-500">
                    <CheckCircle2 size={24} />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <Lock size={20} />
                  </div>
                )}
              </div>
              <div>
                <h4 className={`text-lg font-bold mb-1 ${a.isUnlocked ? "text-slate-800" : "text-slate-500"}`}>
                  {a.title}
                </h4>
                <p className="text-slate-500 font-medium text-sm">
                  {a.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
