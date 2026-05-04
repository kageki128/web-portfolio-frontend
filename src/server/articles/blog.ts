import { BLOG_ARTICLES } from "@/data/blogArticles";
import type { ArticleItem } from "@/types/articles";

export function getBlogArticles(): ArticleItem[] {
  return BLOG_ARTICLES.map((article) => ({
    ...article,
    platform: "Blog" as const,
  }));
}
