import { REVALIDATE_SECONDS, extractMetaContent } from "./shared";
import { fetchMetadataDocument } from "@/server/metadata/document";

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

  const html = await fetchMetadataDocument(url, REVALIDATE_SECONDS);
  return html ? extractArticleTitleFromHtml(html) : "";
}

export function fetchArticleTitle(url: string): Promise<string> {
  return fetchArticleTitleInternal(url);
}
