export const SOCIAL_LINK_URLS = {
  X: "https://x.com/kageki128",
  GitHub: "https://github.com/kageki128",
  Qiita: "https://qiita.com/kageki128",
  Zenn: "https://zenn.dev/kageki128",
  traP: "https://trap.jp/author/hijoushiki/",
} as const;

export type SocialLinkLabel = keyof typeof SOCIAL_LINK_URLS;
