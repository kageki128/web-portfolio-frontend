import { SOCIAL_LINK_URLS } from "@/constants/socialLinks";
import type { ArticleItem } from "@/types/articles";
import {
  REVALIDATE_SECONDS,
  extractFirstImageFromHtml,
  extractMetaContent,
  extractOgpImageFromHtml,
  formatDate,
} from "./shared";

const TRAP_DEFAULT_IMAGE = "https://trap.jp/favicon.png";

export async function fetchTraPArticles(): Promise<ArticleItem[]> {
  const authorUrl = `${SOCIAL_LINK_URLS.traP.replace(/\/$/, "")}/`;
  const rootUrl = new URL(authorUrl).origin;
  const postLinks = new Set<string>();
  const visited = new Set<string>();
  let currentUrl = authorUrl;

  while (currentUrl && !visited.has(currentUrl)) {
    visited.add(currentUrl);
    const response = await fetch(currentUrl, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!response.ok) break;
    const html = await response.text();

    for (const match of html.matchAll(/href=["'](\/post\/\d+\/)["']/g)) {
      postLinks.add(new URL(match[1], rootUrl).toString());
    }

    const nextPath = html.match(/<link rel=["']next["'] href=["']([^"']+)["']/i)?.[1] ?? "";
    if (!nextPath) break;
    currentUrl = new URL(nextPath, rootUrl).toString();
  }

  return Promise.all(
    Array.from(postLinks).map(async (link, index) => {
      const response = await fetch(link, { next: { revalidate: REVALIDATE_SECONDS } });
      if (!response.ok) {
        return {
          id: `trap-${index}-${link}`,
          title: "",
          platform: "traP",
          image: TRAP_DEFAULT_IMAGE,
          date: formatDate(new Date(0)),
          publishedAt: 0,
          link,
        } satisfies ArticleItem;
      }

      const html = await response.text();
      const title =
        extractMetaContent(html, { property: "og:title" }) ||
        extractMetaContent(html, { name: "twitter:title" });
      const image = extractOgpImageFromHtml(html) || extractFirstImageFromHtml(html) || TRAP_DEFAULT_IMAGE;
      const published = extractMetaContent(html, { property: "article:published_time" });
      const publishedDate = new Date(published || 0);

      return {
        id: `trap-${index}-${link}`,
        title,
        platform: "traP",
        image,
        date: formatDate(publishedDate),
        publishedAt: publishedDate.getTime(),
        link,
      } satisfies ArticleItem;
    }),
  );
}
