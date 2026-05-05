export {
  extractMetaContent,
  extractOgpImageFromHtml,
  fetchOgpImage,
  THUMBNAIL_REVALIDATE_SECONDS as REVALIDATE_SECONDS,
} from "@/server/thumbnail/shared";

type Media = { url?: string } | Array<{ url?: string }>;

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

export function getUrlFromMedia(media: Media | undefined) {
  if (!media) return "";
  if (Array.isArray(media)) return media.find((entry) => entry.url)?.url ?? "";
  return media.url ?? "";
}
