import { hasText } from "@/lib/text";
import { fetchArticleTitle } from "@/server/articles/title";
import { resolveImageFromHttpUrl } from "@/server/thumbnail/cache";
import { isHttpUrl } from "@/server/thumbnail/url";

type ResolveLinkMetadataOptions = {
  includeTitle?: boolean;
  includeImage?: boolean;
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

async function resolveWithTimeout(task: Promise<string>): Promise<string> {
  try {
    return await Promise.race([task, wait(LINK_METADATA_TIMEOUT_MS)]);
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

  const { includeTitle = true, includeImage = true } = options;
  const [title, image] = await Promise.all([
    includeTitle ? resolveWithTimeout(fetchArticleTitle(normalizedUrl)) : Promise.resolve(""),
    includeImage ? resolveWithTimeout(resolveImageFromHttpUrl(normalizedUrl)) : Promise.resolve(""),
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
