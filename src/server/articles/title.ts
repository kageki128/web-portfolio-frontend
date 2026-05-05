import { REVALIDATE_SECONDS, extractMetaContent } from "./shared";

const titlePromiseCache = new Map<string, Promise<string>>();

export function extractArticleTitleFromHtml(html: string): string {
  return (
    extractMetaContent(html, { property: "og:title" }) ||
    extractMetaContent(html, { name: "twitter:title" })
  );
}

async function fetchArticleTitleInternal(url: string): Promise<string> {
  if (!url.trim()) return "";

  try {
    const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!response.ok) return "";

    const html = await response.text();
    return extractArticleTitleFromHtml(html);
  } catch {
    return "";
  }
}

export function fetchArticleTitle(url: string): Promise<string> {
  const cached = titlePromiseCache.get(url);
  if (cached) return cached;

  const promise = fetchArticleTitleInternal(url);
  titlePromiseCache.set(url, promise);
  return promise;
}
