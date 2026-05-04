import { OWN_ARTICLES } from "@/data/ownArticles";
import type { ArticleItem } from "@/types/articles";

export function getOwnArticles(): ArticleItem[] {
  return OWN_ARTICLES.map((article) => ({
    ...article,
    platform: "Own" as const,
  }));
}
