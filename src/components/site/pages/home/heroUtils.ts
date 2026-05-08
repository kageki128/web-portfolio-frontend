import { hasText } from "@/lib/text";

export const HERO_MAX_DISPLAY_MILLISECONDS = 6000;
export const HERO_FADE_SECONDS = 0.6;
const HERO_FADE_MILLISECONDS = HERO_FADE_SECONDS * 1000;
const HERO_SWITCH_BUFFER_MILLISECONDS = 100;
const HERO_MIN_DISPLAY_MILLISECONDS = 150;
const HERO_VIDEO_EXTENSIONS = new Set(["mp4", "webm", "ogg", "mov", "m4v", "m3u8"]);

function getFileExtension(path: string): string | null {
  const normalizedPath = path.trim().split("#")[0]?.split("?")[0] ?? path.trim();
  const extension = normalizedPath.match(/\.([a-zA-Z0-9]+)$/)?.[1];
  return extension?.toLowerCase() ?? null;
}

export function isVideoPreview(previewSource: string): boolean {
  const extension = getFileExtension(previewSource);
  return extension !== null && HERO_VIDEO_EXTENSIONS.has(extension);
}

export function resolveVideoDisplayMilliseconds(durationSeconds: number): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return HERO_MAX_DISPLAY_MILLISECONDS;
  }

  return Math.max(
    HERO_MIN_DISPLAY_MILLISECONDS,
    Math.min(
      HERO_MAX_DISPLAY_MILLISECONDS,
      durationSeconds * 1000 - HERO_FADE_MILLISECONDS - HERO_SWITCH_BUFFER_MILLISECONDS,
    ),
  );
}

export function normalizePreviewSources(sources: string[]): string[] {
  return sources.map((source) => source.trim()).filter(hasText);
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function shuffleArrayWithSeed<T>(items: readonly T[], seed: number): T[] {
  const shuffledItems = [...items];
  let randomState = seed || 1;
  const nextRandom = () => {
    randomState = (randomState * 1664525 + 1013904223) >>> 0;
    return randomState / 0x100000000;
  };

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom() * (index + 1));
    const currentItem = shuffledItems[index];
    shuffledItems[index] = shuffledItems[swapIndex];
    shuffledItems[swapIndex] = currentItem;
  }

  return shuffledItems;
}

export function createLoopOrder(sources: string[], seedSource: string): string[] {
  const normalizedSources = normalizePreviewSources(sources);
  if (normalizedSources.length < 2) {
    return normalizedSources;
  }

  const seed = hashString(seedSource);
  return shuffleArrayWithSeed(normalizedSources, seed);
}
