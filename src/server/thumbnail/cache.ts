import { OGP_FETCH_WAIT_MS, OGP_REFRESH_INTERVAL_MS } from "./constants";
import { resolveAmazonThumbnailUrl } from "./amazon";
import { fetchResolvedOgpImage } from "./ogp";
import { getYouTubeThumbnailUrl } from "./youtube";

type OgpCacheEntry = {
  image: string;
  updatedAt: number;
  refreshing?: Promise<string>;
};

const ogpImageCache = new Map<string, OgpCacheEntry>();

function isCacheFresh(entry: OgpCacheEntry): boolean {
  return Date.now() - entry.updatedAt < OGP_REFRESH_INTERVAL_MS;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function refreshOgpCache(url: string): Promise<string> {
  const cached = ogpImageCache.get(url);
  if (cached?.refreshing) return cached.refreshing;

  const refreshing = (async () => {
    const amazonThumbnail = await resolveAmazonThumbnailUrl(url);
    if (amazonThumbnail) {
      ogpImageCache.set(url, {
        image: amazonThumbnail,
        updatedAt: Date.now(),
      });
      return amazonThumbnail;
    }

    const youtubeThumbnail = getYouTubeThumbnailUrl(url);
    if (youtubeThumbnail) {
      ogpImageCache.set(url, {
        image: youtubeThumbnail,
        updatedAt: Date.now(),
      });
      return youtubeThumbnail;
    }

    const resolvedImage = await fetchResolvedOgpImage(url);
    if (resolvedImage) {
      ogpImageCache.set(url, {
        image: resolvedImage,
        updatedAt: Date.now(),
      });
      return resolvedImage;
    }

    ogpImageCache.set(url, {
      image: cached?.image ?? "",
      updatedAt: Date.now(),
    });
    return "";
  })().finally(() => {
    const latest = ogpImageCache.get(url);
    if (!latest) return;
    delete latest.refreshing;
    ogpImageCache.set(url, latest);
  });

  ogpImageCache.set(url, {
    image: cached?.image ?? "",
    updatedAt: cached?.updatedAt ?? 0,
    refreshing,
  });

  return refreshing;
}

export async function resolveImageFromHttpUrl(link: string): Promise<string> {
  const cached = ogpImageCache.get(link);
  if (cached?.image && isCacheFresh(cached)) return cached.image;

  const refreshTask = refreshOgpCache(link);
  if (cached?.image) return cached.image;

  return Promise.race([
    refreshTask,
    wait(OGP_FETCH_WAIT_MS).then(() => ""),
  ]);
}
