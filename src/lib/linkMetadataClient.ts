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
const resolvedMetadataByRequestKey = new Map<string, LinkMetadata>();
const pendingMetadataByRequestKey = new Map<string, Promise<LinkMetadata>>();

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
  const cached = resolvedMetadataByRequestKey.get(requestKey);
  if (cached) return cached;

  const pending = pendingMetadataByRequestKey.get(requestKey);
  if (pending) return pending;

  const searchParams = new URLSearchParams({
    url: normalizedUrl,
    title: includeTitle ? "1" : "0",
    image: includeImage ? "1" : "0",
    wait: waitForCompleteImageFetch ? "1" : "0",
    timeoutMs: String(timeoutMs),
  });

  const nextPending = fetch(`/api/metadata/link?${searchParams.toString()}`, {
    signal: options.signal,
    cache: "no-store",
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
        resolvedMetadataByRequestKey.set(requestKey, metadata);
      }
      return metadata;
    })
    .finally(() => {
      pendingMetadataByRequestKey.delete(requestKey);
    });

  pendingMetadataByRequestKey.set(requestKey, nextPending);
  return nextPending;
}
