export const THUMBNAIL_REVALIDATE_SECONDS = 60 * 30;
const OGP_REFRESH_INTERVAL_MS = 1000 * 60 * 30;
const OGP_FETCH_WAIT_MS = 350;
const AMAZON_REDIRECT_MAX_HOPS = 4;
const AMAZON_SHORT_LINK_HOSTS = new Set(["amzn.asia", "amzn.to", "a.co"]);
const AMAZON_ASIN_PATTERN = /^[A-Z0-9]{10}$/;
const AMAZON_ASIN_QUERY_KEYS = ["asin", "ASIN", "creativeASIN"] as const;
const AMAZON_ASIN_PATH_PATTERNS = [
  /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i,
  /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
  /\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
  /\/([A-Z0-9]{10})(?:[/?]|$)/i,
] as const;
const AMAZON_PAGE_REQUEST_HEADERS = {
  "accept-language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};
const AMAZON_IMAGE_CANDIDATE_URL_BUILDERS: Array<(asin: string) => string> = [
  (asin) => `https://m.media-amazon.com/images/P/${asin}.09.MAIN._SX640_.jpg`,
  (asin) => `https://m.media-amazon.com/images/P/${asin}.01.MAIN._SX640_.jpg`,
  (asin) => `https://m.media-amazon.com/images/P/${asin}.09.MAIN.jpg`,
  (asin) => `https://m.media-amazon.com/images/P/${asin}.01.MAIN.jpg`,
];
const AMAZON_LANDING_IMAGE_PATTERNS = [
  /<img[^>]+id=(?:"landingImage"|'landingImage')[^>]+src=(?:"([^"]+)"|'([^']+)')/i,
  /<img[^>]+src=(?:"([^"]+)"|'([^']+)')[^>]+id=(?:"landingImage"|'landingImage')/i,
] as const;
const AMAZON_BLOCKED_HTML_MARKERS = [
  "api-services-support@amazon.com",
  "service unavailable error",
] as const;
const YOUTUBE_HOSTS = new Set(["www.youtube.com", "youtube.com", "m.youtube.com"]);

type OgpCacheEntry = {
  image: string;
  updatedAt: number;
  refreshing?: Promise<string>;
};

const ogpImageCache = new Map<string, OgpCacheEntry>();

type MetaKey = {
  property?: string;
  name?: string;
};

function parseUrl(url: string) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function getFirstCapturedValue(matched: RegExpMatchArray | null | undefined) {
  if (!matched) return "";
  for (const value of matched.slice(1)) {
    if (value) return value;
  }
  return "";
}

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
  const matched =
    getFirstCapturedValue(html.match(after)) ||
    getFirstCapturedValue(html.match(before));
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
  const parsed = parseUrl(url);
  if (!parsed) return "";
  const host = normalizeHost(parsed.hostname);

  if (host === "youtu.be") {
    return parsed.pathname.split("/").filter(Boolean)[0] ?? "";
  }

  if (YOUTUBE_HOSTS.has(host)) {
    if (parsed.pathname === "/watch") {
      return parsed.searchParams.get("v") ?? "";
    }
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts[0] === "embed" || parts[0] === "shorts") {
      return parts[1] ?? "";
    }
  }

  return "";
}

export function getYouTubeThumbnailUrl(url: string) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return "";
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function normalizeHost(host: string) {
  return host.toLowerCase();
}

function normalizeAmazonAsin(value: string) {
  const normalized = value.trim().toUpperCase();
  return AMAZON_ASIN_PATTERN.test(normalized) ? normalized : "";
}

function isAmazonShortLinkHost(host: string) {
  return AMAZON_SHORT_LINK_HOSTS.has(normalizeHost(host));
}

function isAmazonHost(host: string) {
  return /^(.+\.)?amazon\.[^.]+(?:\.[^.]+)?$/.test(normalizeHost(host));
}

function extractAmazonAsinFromPath(pathname: string) {
  for (const pattern of AMAZON_ASIN_PATH_PATTERNS) {
    const matched = pathname.match(pattern)?.[1] ?? "";
    const asin = normalizeAmazonAsin(matched);
    if (asin) return asin;
  }

  return "";
}

function extractAmazonAsinFromUrl(url: string) {
  const parsed = parseUrl(url);
  if (!parsed || !isAmazonHost(parsed.hostname)) return "";

  for (const key of AMAZON_ASIN_QUERY_KEYS) {
    const asin = normalizeAmazonAsin(parsed.searchParams.get(key) ?? "");
    if (asin) return asin;
  }

  return extractAmazonAsinFromPath(parsed.pathname);
}

async function fetchRedirectLocation(url: string) {
  const fetchOptions = {
    redirect: "manual" as const,
    next: { revalidate: THUMBNAIL_REVALIDATE_SECONDS },
  };

  try {
    const headResponse = await fetch(url, {
      ...fetchOptions,
      method: "HEAD",
    });
    const location = headResponse.headers.get("location");
    if (location) return location;
  } catch {
    // Ignore and fallback to GET
  }

  try {
    const response = await fetch(url, fetchOptions);
    return response.headers.get("location") ?? "";
  } catch {
    return "";
  }
}

async function resolveAmazonAsinFromLink(link: string) {
  let currentUrl = link;

  for (let hop = 0; hop < AMAZON_REDIRECT_MAX_HOPS; hop += 1) {
    const asin = extractAmazonAsinFromUrl(currentUrl);
    if (asin) return asin;

    const parsedUrl = parseUrl(currentUrl);
    if (!parsedUrl) return "";
    if (!isAmazonShortLinkHost(parsedUrl.hostname)) return "";

    const redirectedLocation = await fetchRedirectLocation(currentUrl);
    if (!redirectedLocation) return "";

    const redirectedUrl = resolveImageUrl(redirectedLocation, currentUrl);
    if (!redirectedUrl) return "";
    currentUrl = redirectedUrl;
  }

  return "";
}

function isImageContentType(contentType: string) {
  return contentType.toLowerCase().startsWith("image/");
}

function extractHtmlAttributeValue(html: string, pattern: RegExp) {
  const rawValue = getFirstCapturedValue(html.match(pattern));
  return rawValue ? decodeHtmlEntities(rawValue) : "";
}

function extractLargestImageUrlFromDynamicImageMap(serializedMap: string) {
  try {
    const parsed = JSON.parse(serializedMap) as Record<string, unknown>;
    const entries = Object.entries(parsed).filter(
      ([url, size]) =>
        typeof url === "string" &&
        Array.isArray(size) &&
        typeof size[0] === "number" &&
        typeof size[1] === "number",
    ) as Array<[string, [number, number]]>;
    if (entries.length === 0) return "";

    const [largestUrl] = entries.reduce((largest, current) => {
      const largestArea = largest[1][0] * largest[1][1];
      const currentArea = current[1][0] * current[1][1];
      return currentArea > largestArea ? current : largest;
    });
    return largestUrl;
  } catch {
    return "";
  }
}

function extractAmazonPageImageUrl(html: string, pageUrl: string) {
  const dynamicImageMap = extractHtmlAttributeValue(
    html,
    /data-a-dynamic-image=(?:"([^"]+)"|'([^']+)')/i,
  );
  const imageCandidates = [
    extractHtmlAttributeValue(
      html,
      /data-old-hires=(?:"([^"]+)"|'([^']+)')/i,
    ),
    dynamicImageMap
      ? extractLargestImageUrlFromDynamicImageMap(dynamicImageMap)
      : "",
    ...AMAZON_LANDING_IMAGE_PATTERNS.map((pattern) =>
      extractHtmlAttributeValue(html, pattern),
    ),
    extractOgpImageFromHtml(html),
  ];

  for (const candidate of imageCandidates) {
    if (!candidate) continue;
    const resolved = resolveImageUrl(candidate, pageUrl);
    if (resolved) return resolved;
  }

  return "";
}

function isAmazonBlockedHtml(html: string) {
  const normalized = html.toLowerCase();
  return AMAZON_BLOCKED_HTML_MARKERS.some((marker) =>
    normalized.includes(marker),
  );
}

async function fetchAmazonPageImage(link: string) {
  try {
    const response = await fetch(link, {
      headers: AMAZON_PAGE_REQUEST_HEADERS,
      next: { revalidate: THUMBNAIL_REVALIDATE_SECONDS },
    });
    if (!response.ok) return "";

    const html = await response.text();
    if (isAmazonBlockedHtml(html)) return "";

    const pageUrl = response.url || link;
    return extractAmazonPageImageUrl(html, pageUrl);
  } catch {
    return "";
  }
}

async function canResolveImageUrl(url: string) {
  try {
    const headResponse = await fetch(url, {
      method: "HEAD",
      next: { revalidate: THUMBNAIL_REVALIDATE_SECONDS },
    });
    if (headResponse.ok) {
      return isImageContentType(headResponse.headers.get("content-type") ?? "");
    }
    if (headResponse.status !== 405) return false;
  } catch {
    // Ignore and fallback to GET
  }

  try {
    const response = await fetch(url, { next: { revalidate: THUMBNAIL_REVALIDATE_SECONDS } });
    if (!response.ok) return false;
    return isImageContentType(response.headers.get("content-type") ?? "");
  } catch {
    return false;
  }
}

async function resolveAmazonThumbnailUrl(link: string) {
  const parsed = parseUrl(link);
  if (!parsed) return "";
  const isAmazonUrl =
    isAmazonHost(parsed.hostname) || isAmazonShortLinkHost(parsed.hostname);
  if (!isAmazonUrl) return "";

  const pageImage = await fetchAmazonPageImage(link);
  if (pageImage) return pageImage;

  const asin = await resolveAmazonAsinFromLink(link);
  if (!asin) return "";

  for (const buildUrl of AMAZON_IMAGE_CANDIDATE_URL_BUILDERS) {
    const imageUrl = buildUrl(asin);
    if (await canResolveImageUrl(imageUrl)) return imageUrl;
  }

  return "";
}

function isCacheFresh(entry: OgpCacheEntry) {
  return Date.now() - entry.updatedAt < OGP_REFRESH_INTERVAL_MS;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function refreshOgpCache(url: string) {
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
    return resolvedImage;
  })().finally(() => {
    const latest = ogpImageCache.get(url);
    if (latest) {
      delete latest.refreshing;
      ogpImageCache.set(url, latest);
    }
  });

  ogpImageCache.set(url, {
    image: cached?.image ?? "",
    updatedAt: cached?.updatedAt ?? 0,
    refreshing,
  });

  return refreshing;
}

async function resolveImageFromHttpUrl(link: string) {
  const cached = ogpImageCache.get(link);
  if (cached?.image && isCacheFresh(cached)) return cached.image;

  const refreshTask = refreshOgpCache(link);
  if (cached?.image) return cached.image;

  return Promise.race([
    refreshTask,
    wait(OGP_FETCH_WAIT_MS).then(() => ""),
  ]);
}

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
