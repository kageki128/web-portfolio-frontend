"use client";

import { motion } from "framer-motion";
import { Trophy, Lock, CheckCircle2 } from "lucide-react";
import { BlobReward } from "../achievements/BlobReward";
import { useAchievements } from "../achievements/AchievementProvider";
import {
  cardItemMotionVariants,
  useForceCardVisibleOnRestore,
} from "../motion/cardItemMotion";
import { SectionTitle } from "../SectionTitle";

const ACHIEVEMENT_SEQUENCE_COLUMNS = Number.MAX_SAFE_INTEGER;

export default function AchievementPage() {
  const { achievements, progress, isHydrated } = useAchievements();
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();

  const unlockedCount = achievements.filter((achievement) => achievement.isUnlocked).length;
  const totalCount = achievements.length;
  const isCompleted = unlockedCount === totalCount;
  const completionRate = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <section className="max-w-4xl mx-auto px-6">
        <SectionTitle title="ACHIEVEMENT" subtitle="実績" />
        
        {/* Progress Header */}
        <div className="mt-12 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8 md:mb-16">
          <div className="flex items-center gap-6">
            <div
              className={`w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 shadow-inner shrink-0 transition-colors ${
                isCompleted ? "border-yellow-400" : "border-slate-200"
              }`}
            >
              <Trophy size={40} className={isCompleted ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "text-slate-400"} />
            </div>
            <div>
              <div className="text-slate-500 font-bold tracking-widest text-sm mb-1">COMPLETION RATE</div>
              <div className="text-5xl font-black text-slate-800">
                <span className="text-cyan-500">{isHydrated ? unlockedCount : "-"}</span>
                <span className="text-slate-300 mx-2">/</span>
                <span className="text-slate-300">{totalCount}</span>
              </div>
            </div>
          </div>

          <div className="min-w-70 text-center md:text-right w-full md:w-auto">
            <div className="text-slate-500 font-bold tracking-widest text-xs mb-3">COMPLETE REWARD</div>
            {isCompleted ? (
              <BlobReward isUnlocked={isCompleted} />
            ) : (
              <div className="flex items-center justify-center md:justify-end gap-2 text-slate-400 font-black text-2xl tracking-widest">
                <Lock size={20} /> ???
              </div>
            )}
            {/* Progress Bar */}
            <div className="mt-4 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-linear-to-r from-cyan-400 to-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mt-16 space-y-4">
          {achievements.map((a, i) => {
            const description = a.hideDescUntilUnlocked && !a.isUnlocked ? "???" : a.desc;
            const counter = a.counter
              ? {
                  current: Math.min(progress[a.counter.progressKey].length, a.counter.target),
                  target: a.counter.target,
                }
              : null;
            const counterRate = counter && isHydrated ? (counter.current / counter.target) * 100 : 0;

            return (
              <motion.div 
                custom={{ index: i, columns: ACHIEVEMENT_SEQUENCE_COLUMNS }}
                variants={cardItemMotionVariants}
                initial="hidden"
                animate={forceCardVisibleOnRestore ? "visibleInstant" : "visible"}
                key={a.id} 
                className={`p-6 rounded-xl border flex items-center gap-6 transition-colors ${
                  a.isUnlocked 
                    ? "bg-white border-slate-200 shadow-sm" 
                    : "bg-slate-50 border-slate-300"
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
                <div className="min-w-0 flex-1">
                  <h4 className={`text-lg font-bold mb-1 ${a.isUnlocked ? "text-slate-800" : "text-slate-500"}`}>
                    {a.title}
                  </h4>
                  <p className="text-slate-500 font-medium text-sm">
                    {description}
                  </p>
                </div>
                {counter ? (
                  <div
                    className="ml-auto h-2 w-24 shrink-0 overflow-hidden rounded-full bg-slate-200 md:w-36"
                    role="progressbar"
                    aria-label={`${a.title} の進捗 ${isHydrated ? counter.current : "-"} / ${counter.target}`}
                    aria-valuemin={0}
                    aria-valuemax={counter.target}
                    aria-valuenow={isHydrated ? counter.current : undefined}
                  >
                    <div
                      className="h-full rounded-full bg-linear-to-r from-cyan-400 to-cyan-500 transition-[width] duration-500 ease-out"
                      style={{ width: `${counterRate}%` }}
                    />
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
