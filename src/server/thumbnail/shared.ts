import { resolveImageFromHttpUrl } from "./cache";
import { THUMBNAIL_REVALIDATE_SECONDS } from "./constants";
import { extractMetaContent, extractOgpImageFromHtml, fetchOgpImage } from "./ogp";
import { isHttpUrl, resolveImageUrl } from "./url";

export {
  THUMBNAIL_REVALIDATE_SECONDS,
  extractMetaContent,
  extractOgpImageFromHtml,
  fetchOgpImage,
  isHttpUrl,
  resolveImageUrl,
};

export async function enrichLinkedItemImage<T extends { image: string; link: string }>(item: T): Promise<T> {
  if (item.image.trim().length > 0) return item;

  const link = item.link.trim();
  if (!isHttpUrl(link)) return item;

  const resolvedImage = await resolveImageFromHttpUrl(link);
  if (!resolvedImage) return item;

  return {
    ...item,
    image: resolvedImage,
  };
}
