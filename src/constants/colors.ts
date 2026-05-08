import type { ArticlePlatformFilter } from "@/types/articles";

export const BRAND_COLORS = {
  x: "#000000",
  github: "#181717",
  unityroom: "#FFFFFF",
  atcoder: "#FFFFFF",
  qiita: "#55C500",
  zenn: "#3EA8FF",
  trap: "#005BAC",
} as const;

export const ABOUT_ACTIVITY_ACCENT_COLORS = {
  game: "#7733AA",
  web: "#14A39E",
  algorithm: "#B02525",
  graphics: "#F47FAD",
  sound: "#FF7B19",
} as const;

export const WORK_TAG_THEME_COLORS = {
  Game: ABOUT_ACTIVITY_ACCENT_COLORS.game,
  Web: ABOUT_ACTIVITY_ACCENT_COLORS.web,
  Algorithm: ABOUT_ACTIVITY_ACCENT_COLORS.algorithm,
  Graphics: ABOUT_ACTIVITY_ACCENT_COLORS.graphics,
  Sound: ABOUT_ACTIVITY_ACCENT_COLORS.sound,
} as const;

type WorkTagThemeColorKey = keyof typeof WORK_TAG_THEME_COLORS;
const WORK_TAG_FALLBACK_COLOR = "#06B6D4";

export function getWorkTagThemeColor(tag: string): string {
  return tag in WORK_TAG_THEME_COLORS
    ? WORK_TAG_THEME_COLORS[tag as WorkTagThemeColorKey]
    : WORK_TAG_FALLBACK_COLOR;
}

export const ARTICLE_PLATFORM_COLORS: Record<ArticlePlatformFilter, string> = {
  All: "#1E293B",
  Blog: "#06B6D4",
  Qiita: BRAND_COLORS.qiita,
  Zenn: BRAND_COLORS.zenn,
  traP: BRAND_COLORS.trap,
};

export const ARTICLE_PLATFORM_FILTERS: ArticlePlatformFilter[] = [
  "All",
  "Blog",
  "Qiita",
  "Zenn",
  "traP",
];
