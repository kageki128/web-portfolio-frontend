export const REVALIDATE_SECONDS = 60 * 30;

type MetaKey = {
  property?: string;
  name?: string;
};

type Media = { url?: string } | Array<{ url?: string }>;

function decodeHtmlEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function toArray<T>(value: T | T[] | undefined) {
  if (!value) return [] as T[];
  return Array.isArray(value) ? value : [value];
}

export function getUserNameFromUrl(url: string) {
  const paths = new URL(url).pathname.split("/").filter(Boolean);
  return paths.at(-1) ?? "";
}

export function extractFirstImageFromHtml(html: string) {
  const canonicalMatch = html.match(/<img[^>]+data-canonical-src=["']([^"']+)["']/i);
  if (canonicalMatch) return canonicalMatch[1];
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? "";
}

export function extractMetaContent(html: string, meta: MetaKey) {
  const target = meta.property ?? meta.name;
  const attr = meta.property ? "property" : "name";
  if (!target) return "";

  const escapedTarget = target.replaceAll(".", "\\.");
  const after = new RegExp(
    `<meta[^>]+${attr}=["']${escapedTarget}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const before = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${escapedTarget}["']`,
    "i",
  );
  const matched = html.match(after)?.[1] ?? html.match(before)?.[1] ?? "";
  return matched ? decodeHtmlEntities(matched) : "";
}

export function getUrlFromMedia(media: Media | undefined) {
  if (!media) return "";
  if (Array.isArray(media)) return media.find((entry) => entry.url)?.url ?? "";
  return media.url ?? "";
}

export function extractOgpImageFromHtml(html: string) {
  return extractMetaContent(html, { property: "og:image" }) || extractMetaContent(html, { name: "twitter:image" });
}

export async function fetchOgpImage(url: string) {
  if (!url) return "";
  try {
    const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!response.ok) return "";
    const html = await response.text();
    return extractOgpImageFromHtml(html);
  } catch {
    return "";
  }
}
