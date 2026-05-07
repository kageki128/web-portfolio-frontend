import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import {
  AMAZON_ASIN_PATH_PATTERNS,
  AMAZON_ASIN_PATTERN,
  AMAZON_ASIN_QUERY_KEYS,
  AMAZON_BLOCKED_HTML_MARKERS,
  AMAZON_IMAGE_CANDIDATE_URL_BUILDERS,
  AMAZON_LANDING_IMAGE_PATTERNS,
  AMAZON_PAGE_FETCH_MAX_BYTES,
  AMAZON_PAGE_FETCH_TIMEOUT_MS,
  AMAZON_PAGE_REQUEST_HEADERS,
  AMAZON_PAGE_REQUEST_MAX_HOPS,
  AMAZON_REDIRECT_MAX_HOPS,
  AMAZON_SHORT_LINK_HOSTS,
  THUMBNAIL_REVALIDATE_SECONDS,
} from "./constants";
import { extractOgpImageFromHtml } from "./ogp";
import { isImageContentType, normalizeHost, parseUrl, resolveImageUrl } from "./url";

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

function normalizeAmazonAsin(value: string): string {
  const normalized = value.trim().toUpperCase();
  return AMAZON_ASIN_PATTERN.test(normalized) ? normalized : "";
}

function isAmazonShortLinkHost(host: string): boolean {
  return AMAZON_SHORT_LINK_HOSTS.has(normalizeHost(host));
}

function isAmazonHost(host: string): boolean {
  return /^(.+\.)?amazon\.[^.]+(?:\.[^.]+)?$/.test(normalizeHost(host));
}

function extractAmazonAsinFromPath(pathname: string): string {
  for (const pattern of AMAZON_ASIN_PATH_PATTERNS) {
    const matched = pathname.match(pattern)?.[1] ?? "";
    const asin = normalizeAmazonAsin(matched);
    if (asin) return asin;
  }

  return "";
}

function extractAmazonAsinFromUrl(url: string): string {
  const parsed = parseUrl(url);
  if (!parsed || !isAmazonHost(parsed.hostname)) return "";

  for (const key of AMAZON_ASIN_QUERY_KEYS) {
    const asin = normalizeAmazonAsin(parsed.searchParams.get(key) ?? "");
    if (asin) return asin;
  }

  return extractAmazonAsinFromPath(parsed.pathname);
}

async function fetchRedirectLocation(url: string): Promise<string> {
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
    // HEADが拒否された場合はGETで再試行する。
  }

  try {
    const response = await fetch(url, fetchOptions);
    return response.headers.get("location") ?? "";
  } catch {
    return "";
  }
}

async function resolveAmazonAsinFromLink(link: string): Promise<string> {
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

function extractHtmlAttributeValue(html: string, pattern: RegExp): string {
  const rawValue = getFirstCapturedValue(html.match(pattern));
  return rawValue ? decodeHtmlEntities(rawValue) : "";
}

function extractLargestImageUrlFromDynamicImageMap(serializedMap: string): string {
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

function extractAmazonPageImageUrl(html: string, pageUrl: string): string {
  const dynamicImageMap = extractHtmlAttributeValue(
    html,
    /data-a-dynamic-image=(?:"([^"]+)"|'([^']+)')/i,
  );

  const imageCandidates = [
    extractHtmlAttributeValue(html, /data-old-hires=(?:"([^"]+)"|'([^']+)')/i),
    dynamicImageMap ? extractLargestImageUrlFromDynamicImageMap(dynamicImageMap) : "",
    ...AMAZON_LANDING_IMAGE_PATTERNS.map((pattern) => extractHtmlAttributeValue(html, pattern)),
    extractOgpImageFromHtml(html),
  ];

  for (const candidate of imageCandidates) {
    if (!candidate) continue;
    const resolved = resolveImageUrl(candidate, pageUrl);
    if (resolved) return resolved;
  }

  return "";
}

function isAmazonBlockedHtml(html: string): boolean {
  const normalized = html.toLowerCase();
  return AMAZON_BLOCKED_HTML_MARKERS.some((marker) => normalized.includes(marker));
}

function getHeaderValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function isRedirectStatusCode(statusCode: number): boolean {
  return statusCode >= 300 && statusCode < 400;
}

type NodeTextResponse = {
  body: string;
  statusCode: number;
  url: string;
};

async function requestTextViaNode(
  url: string,
  redirectHops = AMAZON_PAGE_REQUEST_MAX_HOPS,
): Promise<NodeTextResponse | null> {
  const parsedUrl = parseUrl(url);
  if (!parsedUrl) return null;
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") return null;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: NodeTextResponse | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const requestFn = parsedUrl.protocol === "http:" ? httpRequest : httpsRequest;
    const request = requestFn(
      parsedUrl,
      {
        method: "GET",
        headers: AMAZON_PAGE_REQUEST_HEADERS,
      },
      (response) => {
        const statusCode = response.statusCode ?? 0;
        const locationHeader = getHeaderValue(response.headers.location);
        const redirectedUrl = locationHeader ? resolveImageUrl(locationHeader, parsedUrl.toString()) : "";

        if (isRedirectStatusCode(statusCode) && redirectedUrl && redirectHops > 0) {
          response.resume();
          requestTextViaNode(redirectedUrl, redirectHops - 1).then(finish);
          return;
        }

        const chunks: Buffer[] = [];
        let receivedBytes = 0;

        response.on("data", (chunk: Buffer) => {
          receivedBytes += chunk.length;
          if (receivedBytes > AMAZON_PAGE_FETCH_MAX_BYTES) {
            response.destroy();
            finish(null);
            return;
          }
          chunks.push(chunk);
        });

        response.on("error", () => finish(null));
        response.on("end", () => {
          finish({
            body: Buffer.concat(chunks).toString("utf-8"),
            statusCode,
            url: parsedUrl.toString(),
          });
        });
      },
    );

    request.setTimeout(AMAZON_PAGE_FETCH_TIMEOUT_MS, () => {
      request.destroy();
    });
    request.on("error", () => finish(null));
    request.end();
  });
}

async function fetchAmazonPageImage(link: string): Promise<string> {
  const response = await requestTextViaNode(link);
  if (!response) return "";
  if (response.statusCode < 200 || response.statusCode >= 400) return "";
  if (isAmazonBlockedHtml(response.body)) return "";

  const pageUrl = response.url || link;
  return extractAmazonPageImageUrl(response.body, pageUrl);
}

async function canResolveImageUrl(url: string): Promise<boolean> {
  try {
    const headResponse = await fetch(url, {
      method: "HEAD",
      next: { revalidate: THUMBNAIL_REVALIDATE_SECONDS },
    });

    if (headResponse.ok) {
      return isImageContentType(headResponse.headers.get("content-type") ?? "");
    }

    if (headResponse.status !== 405) {
      return false;
    }
  } catch {
    // HEADが失敗したときはGETで再試行する。
  }

  try {
    const response = await fetch(url, { next: { revalidate: THUMBNAIL_REVALIDATE_SECONDS } });
    if (!response.ok) return false;
    return isImageContentType(response.headers.get("content-type") ?? "");
  } catch {
    return false;
  }
}

export async function resolveAmazonThumbnailUrl(link: string): Promise<string> {
  const parsed = parseUrl(link);
  if (!parsed) return "";
  const isAmazonUrl = isAmazonHost(parsed.hostname) || isAmazonShortLinkHost(parsed.hostname);
  if (!isAmazonUrl) return "";

  const pageImage = await fetchAmazonPageImage(link);
  if (pageImage) return pageImage;

  const asin = await resolveAmazonAsinFromLink(link);
  if (!asin) return "";

  for (const buildUrl of AMAZON_IMAGE_CANDIDATE_URL_BUILDERS) {
    const imageUrl = buildUrl(asin);
    if (await canResolveImageUrl(imageUrl)) {
      return imageUrl;
    }
  }

  return "";
}
