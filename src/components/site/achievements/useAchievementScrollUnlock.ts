"use client";

import { useEffect, type RefObject } from "react";
import type { AchievementId } from "@/constants/achievements";
import { useAchievements } from "./AchievementProvider";

export function useAchievementScrollUnlock(
  ref: RefObject<Element | null>,
  achievementId: AchievementId,
) {
  const { unlockAchievement } = useAchievements();

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        unlockAchievement(achievementId);
        observer.disconnect();
      },
      {
        threshold: 0.5,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [achievementId, ref, unlockAchievement]);
}
