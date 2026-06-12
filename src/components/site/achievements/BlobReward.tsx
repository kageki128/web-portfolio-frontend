"use client";

import { type ChangeEvent } from "react";
import { useAchievements } from "./AchievementProvider";

export function BlobReward({ isUnlocked }: { isUnlocked: boolean }) {
  const { isBlobEnabled, setBlobEnabled } = useAchievements();

  const handleEnabledChange = (event: ChangeEvent<HTMLInputElement>) => {
    setBlobEnabled(event.target.checked);
  };

  if (!isUnlocked) {
    return null;
  }

  return (
    <label className="inline-flex cursor-pointer items-center justify-center gap-3">
      <input
        type="checkbox"
        checked={isBlobEnabled}
        onChange={handleEnabledChange}
        className="sr-only"
        aria-label="Blobを呼ぶ"
      />
      <span
        className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${
          isBlobEnabled ? "bg-brand-500" : "bg-faint"
        }`}
      >
        <span
          className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-surface shadow-sm transition-transform duration-300 ${
            isBlobEnabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
      <span className="text-xs font-black tracking-widest text-brand-600">SUMMON BLOB</span>
    </label>
  );
}
