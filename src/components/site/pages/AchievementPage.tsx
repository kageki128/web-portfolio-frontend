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
import { MOTION_EASING } from "@/constants/motion";
import { PAGE_NARROW_CONTAINER_CLASS, PAGE_SHELL_CLASS } from "@/constants/siteStyles";

const ACHIEVEMENT_SEQUENCE_COLUMNS = Number.MAX_SAFE_INTEGER;

export default function AchievementPage() {
  const { achievements, progress, isHydrated } = useAchievements();
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();

  const unlockedCount = achievements.filter((achievement) => achievement.isUnlocked).length;
  const totalCount = achievements.length;
  const isCompleted = unlockedCount === totalCount;
  const completionRate = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
  const completedTextClass = isCompleted ? "text-yellow-500" : "text-muted";
  const completedCountClass = isCompleted ? "text-yellow-500" : "text-brand-500";
  const completedMutedCountClass = isCompleted ? "text-yellow-500" : "text-faint";

  return (
    <div className={PAGE_SHELL_CLASS}>
      <section className={PAGE_NARROW_CONTAINER_CLASS}>
        <SectionTitle title="ACHIEVE" subtitle="実績" />
        
        {/* Progress Header */}
        <div className="mt-10 mb-8 flex flex-col items-center justify-between gap-8 sm:mt-12 lg:mb-16 lg:flex-row lg:items-start">
          <div className="flex items-center gap-4 sm:gap-6">
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 bg-surface shadow-inner transition-colors sm:h-24 sm:w-24 ${
                isCompleted ? "border-yellow-400" : "border-line"
              }`}
            >
              <Trophy
                size={40}
                className={isCompleted ? "text-yellow-500" : "text-subtle"}
                style={
                  isCompleted
                    ? {
                        filter:
                          "drop-shadow(0 0 8px color-mix(in srgb, var(--color-yellow-500) 50%, transparent))",
                      }
                    : undefined
                }
              />
            </div>
            <div>
              <div className={`${completedTextClass} font-bold tracking-widest text-sm mb-1 transition-colors`}>
                COMPLETION RATE
              </div>
              <div className="text-4xl font-black text-ink sm:text-5xl">
                <span className={`${completedCountClass} transition-colors`}>{isHydrated ? unlockedCount : "-"}</span>
                <span className={`${completedMutedCountClass} mx-2 transition-colors`}>/</span>
                <span className={`${completedMutedCountClass} transition-colors`}>{totalCount}</span>
              </div>
            </div>
          </div>

          <div className="w-full text-center lg:w-auto lg:min-w-70 lg:text-right">
            <div className="text-muted font-bold tracking-widest text-xs mb-3">COMPLETE REWARD</div>
            {isCompleted ? (
              <BlobReward isUnlocked={isCompleted} />
            ) : (
              <div className="flex items-center justify-center gap-2 text-2xl font-black tracking-widest text-subtle lg:justify-end">
                <Lock size={20} /> ???
              </div>
            )}
            {/* Progress Bar */}
            <div className="mt-4 w-full h-2 bg-line rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, ease: MOTION_EASING.enter }}
                className="h-full bg-linear-to-r from-brand-400 to-brand-500"
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mt-12 space-y-4 sm:mt-16">
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
                className={`flex flex-wrap items-center gap-4 rounded-panel border p-4 transition-colors sm:flex-nowrap sm:gap-6 sm:p-6 ${
                  a.isUnlocked 
                    ? "bg-surface border-line shadow-panel"
                    : "bg-page border-faint"
                }`}
              >
                <div className="shrink-0">
                  {a.isUnlocked ? (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-500 sm:h-12 sm:w-12">
                      <CheckCircle2 size={24} />
                    </div>
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-line text-subtle sm:h-12 sm:w-12">
                      <Lock size={20} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className={`text-lg font-bold mb-1 ${a.isUnlocked ? "text-ink" : "text-muted"}`}>
                    {a.title}
                  </h4>
                  <p className="text-sm font-medium text-muted">
                    {description}
                  </p>
                </div>
                {counter ? (
                  <div
                    className="order-last ml-[3.75rem] h-2 basis-[calc(100%-3.75rem)] overflow-hidden rounded-full bg-line sm:order-none sm:ml-auto sm:w-24 sm:basis-auto sm:shrink-0 md:w-36"
                    role="progressbar"
                    aria-label={`${a.title} の進捗 ${isHydrated ? counter.current : "-"} / ${counter.target}`}
                    aria-valuemin={0}
                    aria-valuemax={counter.target}
                    aria-valuenow={isHydrated ? counter.current : undefined}
                  >
                    <div
                      className="h-full rounded-full bg-linear-to-r from-brand-400 to-brand-500 transition-[width] duration-slow ease-enter"
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
