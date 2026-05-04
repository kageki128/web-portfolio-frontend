export type ArticlePlatform = "Own" | "Qiita" | "Zenn" | "traP";

export type ArticlePlatformFilter = "All" | ArticlePlatform;

export type ArticleItem = {
  id: string;
  title: string;
  platform: ArticlePlatform;
  image: string;
  date: string;
  publishedAt: number;
  link: string;
};
