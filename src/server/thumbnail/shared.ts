export const THUMBNAIL_REVALIDATE_SECONDS = 60 * 30;

type MetaKey = {
  property?: string;
  name?: string;
};

function decodeHtmlEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export function isHttpUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function resolveImageUrl(imageUrl: string, pageUrl: string) {
  try {
    return new URL(imageUrl, pageUrl).toString();
  } catch {
    return "";
  }
}

export function extractMetaContent(html: string, meta: MetaKey) {
  const target = meta.property ?? meta.name;
  const attr = meta.property ? "property" : "name";
  if (!target) return "";

  const escapedTarget = target.replaceAll(".", "\\.");
  const attrValuePattern = `(?:\"${escapedTarget}\"|'${escapedTarget}'|${escapedTarget})`;
  const contentValuePattern = `(?:\"([^\"]+)\"|'([^']+)'|([^\\s\"'>]+))`;
  const after = new RegExp(
    `<meta[^>]+${attr}=${attrValuePattern}[^>]+content=${contentValuePattern}`,
    "i",
  );
  const before = new RegExp(
    `<meta[^>]+content=${contentValuePattern}[^>]+${attr}=${attrValuePattern}`,
    "i",
  );
  const afterMatched = html.match(after);
  const beforeMatched = html.match(before);
  const matched = afterMatched?.[1] ?? afterMatched?.[2] ?? afterMatched?.[3] ?? beforeMatched?.[1] ?? beforeMatched?.[2] ?? beforeMatched?.[3] ?? "";
  return matched ? decodeHtmlEntities(matched) : "";
}

export function extractOgpImageFromHtml(html: string) {
  return extractMetaContent(html, { property: "og:image" }) || extractMetaContent(html, { name: "twitter:image" });
}

export async function fetchOgpImage(url: string) {
  if (!url) return "";
  try {
    const response = await fetch(url, { next: { revalidate: THUMBNAIL_REVALIDATE_SECONDS } });
    if (!response.ok) return "";
    const html = await response.text();
    return extractOgpImageFromHtml(html);
  } catch {
    return "";
  }
}

export async function fetchResolvedOgpImage(url: string) {
  const ogpImage = await fetchOgpImage(url);
  if (!ogpImage) return "";
  return resolveImageUrl(ogpImage, url);
}

function extractYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    if (host === "www.youtube.com" || host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v") ?? "";
      }
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" || parts[0] === "shorts") {
        return parts[1] ?? "";
      }
    }
  } catch {
    return "";
  }

  return "";
}

export function getYouTubeThumbnailUrl(url: string) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return "";
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
