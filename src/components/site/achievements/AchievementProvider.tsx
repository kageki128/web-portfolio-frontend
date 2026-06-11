"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
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

type AchievementView = AchievementDefinition & {
  isUnlocked: boolean;
};

type AchievementContextValue = {
  achievements: AchievementView[];
  progress: AchievementProgress;
  isHydrated: boolean;
  unlockAchievement: (achievementId: AchievementId) => void;
  recordViewedWork: (workId: string) => void;
  recordReadArticle: (articleId: string) => void;
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
    if (viewedWorkIds.length >= 3) achievementsToUnlock.push("work_3");

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
  if (readArticleIds.length >= 3) achievementsToUnlock.push("article_3");

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
  const progressRef = useRef(state.progress);
  const secretCommandProgressRef = useRef<string[]>([]);
  const activeNotificationId = state.notificationQueue[0] ?? null;
  const activeNotification = activeNotificationId ? achievementById.get(activeNotificationId) : null;

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

  const unlockAchievement = useCallback((achievementId: AchievementId) => {
    if (state.isHydrated) {
      const update = unlockIds(progressRef.current, [achievementId]);
      if (update.newlyUnlockedIds.length > 0) {
        writeStoredProgress(update.progress);
      }
    }

    dispatch({ type: "unlock", achievementId });
  }, [state.isHydrated]);

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

  const recordReadArticle = useCallback((articleId: string) => {
    dispatch({ type: "record-article", articleId });
  }, []);

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
      unlockAchievement,
      recordViewedWork,
      recordReadArticle,
    }),
    [
      achievements,
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
      <AnimatePresence>
        {activeNotification ? (
          <div className="pointer-events-none fixed inset-x-0 top-20 z-[9999] flex justify-end overflow-hidden pl-4 md:pl-8">
            <motion.div
            key={activeNotification.id}
            initial={{ opacity: 0, x: "calc(100% + 2rem)" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "calc(100% + 2rem)" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pointer-events-auto w-full max-w-md overflow-hidden rounded-l-lg border border-r-0 border-cyan-200 bg-white shadow-2xl shadow-slate-900/20"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-4 border-l-[8px] border-cyan-500 px-5 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
                <Trophy size={24} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-black tracking-widest text-cyan-600">
                  <CheckCircle2 size={16} />
                  実績を達成しました！
                </div>
                <div className="mt-1 truncate text-lg font-black text-slate-800">
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
