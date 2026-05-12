import { hasText } from "@/lib/text";
import { fetchArticleTitle } from "@/server/articles/title";
import { resolveImageFromHttpUrl } from "@/server/thumbnail/cache";
import { isHttpUrl } from "@/server/thumbnail/url";

type ResolveLinkMetadataOptions = {
  includeTitle?: boolean;
  includeImage?: boolean;
  timeoutMs?: number | null;
  waitForCompleteImageFetch?: boolean;
};

const LINK_METADATA_TIMEOUT_MS = 4_000;

export type LinkMetadata = {
  title: string;
  image: string;
};

function normalizeUrl(url: string): string {
  return url.trim();
}

function isResolvableUrl(url: string): boolean {
  return hasText(url) && isHttpUrl(url);
}

function wait(milliseconds: number): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(""), milliseconds);
  });
}

async function resolveWithTimeout(task: Promise<string>, timeoutMs: number | null): Promise<string> {
  try {
    if (timeoutMs === null) {
      return await task;
    }
    return await Promise.race([task, wait(timeoutMs)]);
  } catch {
    return "";
  }
}

export async function resolveLinkMetadata(
  url: string,
  options: ResolveLinkMetadataOptions = {},
): Promise<LinkMetadata> {
  const normalizedUrl = normalizeUrl(url);
  if (!isResolvableUrl(normalizedUrl)) {
    return {
      title: "",
      image: "",
    };
  }

  const {
    includeTitle = true,
    includeImage = true,
    timeoutMs = LINK_METADATA_TIMEOUT_MS,
    waitForCompleteImageFetch = false,
  } = options;
  const [title, image] = await Promise.all([
    includeTitle ? resolveWithTimeout(fetchArticleTitle(normalizedUrl), timeoutMs) : Promise.resolve(""),
    includeImage
      ? resolveWithTimeout(
          resolveImageFromHttpUrl(normalizedUrl, {
            waitForCompleteFetch: waitForCompleteImageFetch,
          }),
          timeoutMs,
        )
      : Promise.resolve(""),
  ]);

  return {
    title,
    image,
  };
}

export async function resolveLinkMetadataByUrl(
  urls: Iterable<string>,
  options: ResolveLinkMetadataOptions = {},
): Promise<Map<string, LinkMetadata>> {
  const uniqueUrls = Array.from(
    new Set(Array.from(urls, normalizeUrl).filter(isResolvableUrl)),
  );
  const entries = await Promise.all(
    uniqueUrls.map(async (url) => [url, await resolveLinkMetadata(url, options)] as const),
  );
  return new Map(entries);
}
