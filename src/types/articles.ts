export type ArticlePlatform = "Blog" | "Qiita" | "Zenn" | "traP";

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

export type BlogArticleDetail = {
  id: string;
  slug: string;
  title: string;
  image: string;
  date: string;
  publishedAt: number;
  link: string;
  content: string;
  contentHtml: string;
};
