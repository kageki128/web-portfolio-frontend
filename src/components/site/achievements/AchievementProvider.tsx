"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { CheckCircle2, Trophy } from "lucide-react";
import {
  ACHIEVEMENT_STORAGE_KEY,
  ACHIEVEMENTS,
  ALL_COMPLETE_ACHIEVEMENT_ID,
  BASE_ACHIEVEMENT_IDS,
  EMPTY_ACHIEVEMENT_PROGRESS,
  type AchievementDefinition,
  type AchievementId,
  type AchievementProgress,
} from "@/constants/achievements";
import { MOTION_DURATION, MOTION_EASING } from "@/constants/motion";
import { BlobFollower } from "./BlobFollower";

const NOTIFICATION_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    x: "calc(100% + 2rem)",
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASING.exit },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASING.enter },
  },
};

type AchievementView = AchievementDefinition & {
  isUnlocked: boolean;
};

type AchievementContextValue = {
  achievements: AchievementView[];
  progress: AchievementProgress;
  isHydrated: boolean;
  isBlobEnabled: boolean;
  setBlobEnabled: (isEnabled: boolean) => void;
  unlockAchievement: (
    achievementId: AchievementId,
    options?: AchievementNotificationOptions,
  ) => void;
  recordViewedWork: (workId: string) => void;
  recordReadArticle: (
    articleId: string,
    options?: AchievementNotificationOptions,
  ) => void;
};

type AchievementNotificationOptions = {
  deferNotificationUntilFocus?: boolean;
};

type AchievementState = {
  progress: AchievementProgress;
  notificationQueue: AchievementId[];
  isHydrated: boolean;
};

type InitAction = {
  type: "init";
  progress: AchievementProgress;
  shouldUnlockFirstVisit: boolean;
};

type AchievementAction =
  | InitAction
  | { type: "unlock"; achievementId: AchievementId }
  | { type: "record-work"; workId: string }
  | { type: "record-article"; articleId: string }
  | { type: "dismiss-notification" };

type ProgressUpdate = {
  progress: AchievementProgress;
  newlyUnlockedIds: AchievementId[];
};

const AchievementContext = createContext<AchievementContextValue | null>(null);

const HAPPY_SECRET_COMMAND_ACHIEVEMENT_ID = "happy_secret_command" satisfies AchievementId;

const HAPPY_SECRET_COMMAND_KEYS = [
  "ArrowRight",
  "ArrowDown",
  "ArrowUp",
  "ArrowRight",
  "ArrowRight",
  "ArrowDown",
  "ArrowRight",
  "ArrowRight",
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
] as const;

const achievementIds = new Set<AchievementId>(ACHIEVEMENTS.map((achievement) => achievement.id));

const achievementById = new Map<AchievementId, AchievementDefinition>(
  ACHIEVEMENTS.map((achievement) => [achievement.id, achievement]),
);

const initialState: AchievementState = {
  progress: EMPTY_ACHIEVEMENT_PROGRESS,
  notificationQueue: [],
  isHydrated: false,
};

function isAchievementId(value: string): value is AchievementId {
  return achievementIds.has(value as AchievementId);
}

function uniqueStrings(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(new Set(values.filter((value): value is string => typeof value === "string")));
}

function uniqueAchievementIds(values: unknown): AchievementId[] {
  return uniqueStrings(values).filter(isAchievementId);
}

function normalizeProgress(value: unknown): AchievementProgress {
  if (!value || typeof value !== "object") {
    return EMPTY_ACHIEVEMENT_PROGRESS;
  }

  const source = value as Partial<Record<keyof AchievementProgress, unknown>>;

  return {
    unlockedIds: uniqueAchievementIds(source.unlockedIds),
    viewedWorkIds: uniqueStrings(source.viewedWorkIds),
    readArticleIds: uniqueStrings(source.readArticleIds),
  };
}

function readStoredProgress(): {
  progress: AchievementProgress;
  hasStoredProgress: boolean;
} {
  try {
    const rawProgress = window.localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
    if (rawProgress === null) {
      return {
        progress: EMPTY_ACHIEVEMENT_PROGRESS,
        hasStoredProgress: false,
      };
    }

    return {
      progress: normalizeProgress(JSON.parse(rawProgress)),
      hasStoredProgress: true,
    };
  } catch {
    return {
      progress: EMPTY_ACHIEVEMENT_PROGRESS,
      hasStoredProgress: false,
    };
  }
}

function writeStoredProgress(progress: AchievementProgress) {
  try {
    window.localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // The in-memory state still works when localStorage is unavailable.
  }
}

function shouldIgnoreKeyboardEvent(event: KeyboardEvent): boolean {
  if (!(event.target instanceof HTMLElement)) {
    return false;
  }

  const targetTagName = event.target.tagName.toLowerCase();

  return (
    targetTagName === "input" ||
    targetTagName === "textarea" ||
    targetTagName === "select" ||
    event.target.isContentEditable
  );
}

export function shouldDeferAchievementNotificationForExternalClick(
  event: Pick<MouseEvent<HTMLElement>, "altKey" | "button" | "ctrlKey" | "metaKey" | "shiftKey">,
): boolean {
  return (
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

function unlockIds(progress: AchievementProgress, achievementIdsToUnlock: AchievementId[]): ProgressUpdate {
  const unlockedSet = new Set(progress.unlockedIds);
  const newlyUnlockedIds: AchievementId[] = [];

  if (!BASE_ACHIEVEMENT_IDS.every((achievementId) => unlockedSet.has(achievementId))) {
    unlockedSet.delete(ALL_COMPLETE_ACHIEVEMENT_ID);
  }

  achievementIdsToUnlock.forEach((achievementId) => {
    if (unlockedSet.has(achievementId)) {
      return;
    }

    unlockedSet.add(achievementId);
    newlyUnlockedIds.push(achievementId);
  });

  const shouldUnlockAllComplete =
    !unlockedSet.has(ALL_COMPLETE_ACHIEVEMENT_ID) &&
    BASE_ACHIEVEMENT_IDS.every((achievementId) => unlockedSet.has(achievementId));

  if (shouldUnlockAllComplete) {
    unlockedSet.add(ALL_COMPLETE_ACHIEVEMENT_ID);
    newlyUnlockedIds.push(ALL_COMPLETE_ACHIEVEMENT_ID);
  }

  return {
    progress: {
      ...progress,
      unlockedIds: ACHIEVEMENTS.map((achievement) => achievement.id).filter((achievementId) =>
        unlockedSet.has(achievementId),
      ),
    },
    newlyUnlockedIds,
  };
}

function appendUniqueId(values: string[], value: string): string[] {
  const trimmedValue = value.trim();
  if (!trimmedValue || values.includes(trimmedValue)) {
    return values;
  }

  return [...values, trimmedValue];
}

function withNotifications(state: AchievementState, update: ProgressUpdate): AchievementState {
  return {
    ...state,
    progress: update.progress,
    notificationQueue: [...state.notificationQueue, ...update.newlyUnlockedIds],
  };
}

function achievementReducer(state: AchievementState, action: AchievementAction): AchievementState {
  if (action.type === "dismiss-notification") {
    return {
      ...state,
      notificationQueue: state.notificationQueue.slice(1),
    };
  }

  if (action.type === "init") {
    const update = unlockIds(
      action.progress,
      action.shouldUnlockFirstVisit ? ["first_visit"] : [],
    );

    return {
      progress: update.progress,
      notificationQueue: update.newlyUnlockedIds,
      isHydrated: true,
    };
  }

  if (!state.isHydrated) {
    return state;
  }

  if (action.type === "unlock") {
    return withNotifications(state, unlockIds(state.progress, [action.achievementId]));
  }

  if (action.type === "record-work") {
    const viewedWorkIds = appendUniqueId(state.progress.viewedWorkIds, action.workId);
    if (viewedWorkIds === state.progress.viewedWorkIds) {
      return state;
    }

    const achievementsToUnlock: AchievementId[] = [];
    if (viewedWorkIds.length >= 1) achievementsToUnlock.push("work_1");
    if (viewedWorkIds.length >= 5) achievementsToUnlock.push("work_5");

    return withNotifications(
      state,
      unlockIds(
        {
          ...state.progress,
          viewedWorkIds,
        },
        achievementsToUnlock,
      ),
    );
  }

  const readArticleIds = appendUniqueId(state.progress.readArticleIds, action.articleId);
  if (readArticleIds === state.progress.readArticleIds) {
    return state;
  }

  const achievementsToUnlock: AchievementId[] = [];
  if (readArticleIds.length >= 1) achievementsToUnlock.push("article_1");
  if (readArticleIds.length >= 5) achievementsToUnlock.push("article_5");

  return withNotifications(
    state,
    unlockIds(
      {
        ...state.progress,
        readArticleIds,
      },
      achievementsToUnlock,
    ),
  );
}

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(achievementReducer, initialState);
  const [isNotificationDisplayPaused, setIsNotificationDisplayPaused] = useState(false);
  const [isBlobEnabled, setBlobEnabled] = useState(false);
  const progressRef = useRef(state.progress);
  const secretCommandProgressRef = useRef<string[]>([]);
  const notificationPauseFallbackIdRef = useRef<number | null>(null);
  const activeNotificationId = isNotificationDisplayPaused ? null : (state.notificationQueue[0] ?? null);
  const activeNotification = activeNotificationId ? achievementById.get(activeNotificationId) : null;
  const isBlobRewardUnlocked = state.progress.unlockedIds.includes(ALL_COMPLETE_ACHIEVEMENT_ID);

  const resumeNotificationsIfPageIsActive = useCallback(() => {
    if (document.visibilityState === "visible" && document.hasFocus()) {
      setIsNotificationDisplayPaused(false);
    }
  }, []);

  const pauseNotificationsUntilFocus = useCallback(() => {
    setIsNotificationDisplayPaused(true);

    if (notificationPauseFallbackIdRef.current !== null) {
      window.clearTimeout(notificationPauseFallbackIdRef.current);
    }

    notificationPauseFallbackIdRef.current = window.setTimeout(() => {
      notificationPauseFallbackIdRef.current = null;
      resumeNotificationsIfPageIsActive();
    }, 800);
  }, [resumeNotificationsIfPageIsActive]);

  const prepareNotificationDisplay = useCallback(
    (options?: AchievementNotificationOptions) => {
      if (options?.deferNotificationUntilFocus) {
        pauseNotificationsUntilFocus();
      }
    },
    [pauseNotificationsUntilFocus],
  );

  useEffect(() => {
    const { progress, hasStoredProgress } = readStoredProgress();
    dispatch({
      type: "init",
      progress,
      shouldUnlockFirstVisit: !hasStoredProgress,
    });
  }, []);

  useEffect(() => {
    if (!state.isHydrated) {
      return;
    }

    progressRef.current = state.progress;
    writeStoredProgress(state.progress);
  }, [state.isHydrated, state.progress]);

  useEffect(() => {
    window.addEventListener("focus", resumeNotificationsIfPageIsActive);
    window.addEventListener("pageshow", resumeNotificationsIfPageIsActive);
    document.addEventListener("visibilitychange", resumeNotificationsIfPageIsActive);

    return () => {
      window.removeEventListener("focus", resumeNotificationsIfPageIsActive);
      window.removeEventListener("pageshow", resumeNotificationsIfPageIsActive);
      document.removeEventListener("visibilitychange", resumeNotificationsIfPageIsActive);

      if (notificationPauseFallbackIdRef.current !== null) {
        window.clearTimeout(notificationPauseFallbackIdRef.current);
      }
    };
  }, [resumeNotificationsIfPageIsActive]);

  useEffect(() => {
    if (!activeNotificationId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: "dismiss-notification" });
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeNotificationId]);

  const unlockAchievement = useCallback((
    achievementId: AchievementId,
    options?: AchievementNotificationOptions,
  ) => {
    prepareNotificationDisplay(options);

    if (state.isHydrated) {
      const update = unlockIds(progressRef.current, [achievementId]);
      if (update.newlyUnlockedIds.length > 0) {
        writeStoredProgress(update.progress);
      }
    }

    dispatch({ type: "unlock", achievementId });
  }, [prepareNotificationDisplay, state.isHydrated]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreKeyboardEvent(event)) {
        secretCommandProgressRef.current = [];
        return;
      }

      const nextProgress = [...secretCommandProgressRef.current, event.key].slice(
        -HAPPY_SECRET_COMMAND_KEYS.length,
      );

      secretCommandProgressRef.current = nextProgress;

      if (HAPPY_SECRET_COMMAND_KEYS.every((key, index) => nextProgress[index] === key)) {
        secretCommandProgressRef.current = [];
        unlockAchievement(HAPPY_SECRET_COMMAND_ACHIEVEMENT_ID);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [unlockAchievement]);

  const recordViewedWork = useCallback((workId: string) => {
    dispatch({ type: "record-work", workId });
  }, []);

  const recordReadArticle = useCallback((articleId: string, options?: AchievementNotificationOptions) => {
    prepareNotificationDisplay(options);
    dispatch({ type: "record-article", articleId });
  }, [prepareNotificationDisplay]);

  const achievements = useMemo(
    () =>
      ACHIEVEMENTS.map((achievement) => ({
        ...achievement,
        isUnlocked: state.progress.unlockedIds.includes(achievement.id),
      })),
    [state.progress.unlockedIds],
  );

  const contextValue = useMemo<AchievementContextValue>(
    () => ({
      achievements,
      progress: state.progress,
      isHydrated: state.isHydrated,
      isBlobEnabled,
      setBlobEnabled,
      unlockAchievement,
      recordViewedWork,
      recordReadArticle,
    }),
    [
      achievements,
      isBlobEnabled,
      recordReadArticle,
      recordViewedWork,
      state.isHydrated,
      state.progress,
      unlockAchievement,
    ],
  );

  return (
    <AchievementContext.Provider value={contextValue}>
      {children}
      <BlobFollower isEnabled={isBlobRewardUnlocked && isBlobEnabled} />
      <AnimatePresence>
        {activeNotification ? (
          <div className="pointer-events-none fixed inset-x-0 top-20 z-[9999] flex justify-end overflow-hidden pl-4 md:pl-8">
            <motion.div
              key={activeNotification.id}
              variants={NOTIFICATION_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-l-panel border border-r-0 border-brand-200 bg-surface shadow-modal shadow-media/20"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-4 border-l-[8px] border-brand-500 px-5 py-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <Trophy size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-black tracking-widest text-brand-600">
                    <CheckCircle2 size={16} />
                    実績を達成しました！
                  </div>
                  <div className="mt-1 truncate text-lg font-black text-ink">
                    {activeNotification.title}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </AchievementContext.Provider>
  );
}

export function useAchievements(): AchievementContextValue {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error("useAchievements must be used within AchievementProvider.");
  }

  return context;
}
