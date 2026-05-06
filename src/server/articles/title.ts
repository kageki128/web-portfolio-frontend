import { REVALIDATE_SECONDS, extractMetaContent } from "./shared";

const titlePromiseCache = new Map<string, Promise<string>>();

function decodeHtmlEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function extractTitleTagContent(html: string) {
  const matched = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  if (!matched) return "";
  return normalizeText(decodeHtmlEntities(matched));
}

export function extractArticleTitleFromHtml(html: string): string {
  const socialTitle =
    extractMetaContent(html, { property: "og:title" }) ||
    extractMetaContent(html, { name: "twitter:title" });
  const pageTitle = extractTitleTagContent(html);
  if (!socialTitle) return pageTitle;
  if (!pageTitle) return socialTitle;
  if (pageTitle === socialTitle) return socialTitle;
  if (pageTitle.includes(socialTitle) && pageTitle.length > socialTitle.length) return pageTitle;
  return socialTitle;
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
