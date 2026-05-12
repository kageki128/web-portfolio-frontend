import { THUMBNAIL_REVALIDATE_SECONDS } from "./constants";
import { resolveImageUrl } from "./url";
import { METADATA_REQUEST_HEADERS } from "@/server/metadata/requestHeaders";

type MetaKey = {
  property?: string;
  name?: string;
};

function getFirstCapturedValue(matched: RegExpMatchArray | null | undefined): string {
  if (!matched) return "";
  for (const value of matched.slice(1)) {
    if (value) return value;
  }
  return "";
}

function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export function extractMetaContent(html: string, meta: MetaKey): string {
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
  const matched = getFirstCapturedValue(html.match(after)) || getFirstCapturedValue(html.match(before));
  return matched ? decodeHtmlEntities(matched) : "";
}

export function extractOgpImageFromHtml(html: string): string {
  return extractMetaContent(html, { property: "og:image" }) || extractMetaContent(html, { name: "twitter:image" });
}

export async function fetchOgpImage(url: string): Promise<string> {
  if (!url) return "";

  try {
    const response = await fetch(url, {
      next: { revalidate: THUMBNAIL_REVALIDATE_SECONDS },
      headers: METADATA_REQUEST_HEADERS,
    });
    if (!response.ok) return "";
    const html = await response.text();
    return extractOgpImageFromHtml(html);
  } catch {
    return "";
  }
}

export async function fetchResolvedOgpImage(url: string): Promise<string> {
  const ogpImage = await fetchOgpImage(url);
  if (!ogpImage) return "";
  return resolveImageUrl(ogpImage, url);
}
