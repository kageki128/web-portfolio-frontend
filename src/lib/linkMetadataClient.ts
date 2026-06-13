import { hasText } from "./text";

type LinkMetadata = {
  title: string;
  image: string;
};

type LinkMetadataOptions = {
  includeTitle?: boolean;
  includeImage?: boolean;
  timeoutMs?: number;
  waitForCompleteImageFetch?: boolean;
  signal?: AbortSignal;
};

const EMPTY_METADATA: LinkMetadata = { title: "", image: "" };
const METADATA_CACHE_TTL_MS = 30 * 60 * 1000;
const METADATA_CACHE_MAX_ENTRIES = 128;

type CachedMetadata = {
  metadata: LinkMetadata;
  expiresAt: number;
};

const resolvedMetadataByRequestKey = new Map<string, CachedMetadata>();
const pendingMetadataByRequestKey = new Map<string, Promise<LinkMetadata>>();

function encodeUrl(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function createRequestKey(url: string, options: Required<Omit<LinkMetadataOptions, "signal">>): string {
  const { includeTitle, includeImage, timeoutMs, waitForCompleteImageFetch } = options;
  return [
    url,
    includeTitle ? "title:1" : "title:0",
    includeImage ? "image:1" : "image:0",
    `timeout:${timeoutMs}`,
    waitForCompleteImageFetch ? "wait:1" : "wait:0",
  ].join("|");
}

function normalizeMetadata(value: unknown): LinkMetadata {
  if (!value || typeof value !== "object") return EMPTY_METADATA;
  const parsed = value as Partial<LinkMetadata>;
  return {
    title: typeof parsed.title === "string" ? parsed.title : "",
    image: typeof parsed.image === "string" ? parsed.image : "",
  };
}

function getCachedMetadata(requestKey: string): LinkMetadata | null {
  const cached = resolvedMetadataByRequestKey.get(requestKey);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    resolvedMetadataByRequestKey.delete(requestKey);
    return null;
  }

  resolvedMetadataByRequestKey.delete(requestKey);
  resolvedMetadataByRequestKey.set(requestKey, cached);
  return cached.metadata;
}

function cacheMetadata(requestKey: string, metadata: LinkMetadata) {
  resolvedMetadataByRequestKey.delete(requestKey);
  resolvedMetadataByRequestKey.set(requestKey, {
    metadata,
    expiresAt: Date.now() + METADATA_CACHE_TTL_MS,
  });

  while (resolvedMetadataByRequestKey.size > METADATA_CACHE_MAX_ENTRIES) {
    const oldestKey = resolvedMetadataByRequestKey.keys().next().value;
    if (typeof oldestKey !== "string") break;
    resolvedMetadataByRequestKey.delete(oldestKey);
  }
}

export async function fetchLinkMetadata(url: string, options: LinkMetadataOptions = {}): Promise<LinkMetadata> {
  const normalizedUrl = url.trim();
  if (!hasText(normalizedUrl)) return EMPTY_METADATA;

  const includeTitle = options.includeTitle ?? true;
  const includeImage = options.includeImage ?? true;
  const timeoutMs = options.timeoutMs ?? 12_000;
  const waitForCompleteImageFetch = options.waitForCompleteImageFetch ?? true;

  if (!includeTitle && !includeImage) return EMPTY_METADATA;

  const requestKey = createRequestKey(normalizedUrl, {
    includeTitle,
    includeImage,
    timeoutMs,
    waitForCompleteImageFetch,
  });
  const cached = getCachedMetadata(requestKey);
  if (cached) return cached;

  const pending = pendingMetadataByRequestKey.get(requestKey);
  if (pending) return pending;

  const searchParams = new URLSearchParams({
    url64: encodeUrl(normalizedUrl),
    title: includeTitle ? "1" : "0",
    image: includeImage ? "1" : "0",
    wait: waitForCompleteImageFetch ? "1" : "0",
    timeoutMs: String(timeoutMs),
  });

  const nextPending = fetch(`/api/metadata/link?${searchParams.toString()}`, {
    signal: options.signal,
  })
    .then(async (response) => {
      if (!response.ok) return EMPTY_METADATA;
      return normalizeMetadata(await response.json());
    })
    .catch(() => EMPTY_METADATA)
    .then((metadata) => {
      const hasResolvedField =
        (includeTitle && hasText(metadata.title)) || (includeImage && hasText(metadata.image));
      if (hasResolvedField) {
        cacheMetadata(requestKey, metadata);
      }
      return metadata;
    })
    .finally(() => {
      pendingMetadataByRequestKey.delete(requestKey);
    });

  pendingMetadataByRequestKey.set(requestKey, nextPending);
  return nextPending;
}
