import { METADATA_REQUEST_HEADERS } from "./requestHeaders";

const METADATA_DOCUMENT_TIMEOUT_MS = 8_000;
const METADATA_DOCUMENT_MAX_BYTES = 2 * 1024 * 1024;
const METADATA_DOCUMENT_CACHE_TTL_MS = 30 * 60 * 1000;
const METADATA_DOCUMENT_CACHE_MAX_ENTRIES = 128;

type CachedDocument = {
  html: string;
  expiresAt: number;
};

const documentCache = new Map<string, CachedDocument>();
const pendingDocumentByUrl = new Map<string, Promise<string>>();

function getCachedDocument(url: string): string | null {
  const cached = documentCache.get(url);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    documentCache.delete(url);
    return null;
  }

  documentCache.delete(url);
  documentCache.set(url, cached);
  return cached.html;
}

function cacheDocument(url: string, html: string) {
  documentCache.delete(url);
  documentCache.set(url, {
    html,
    expiresAt: Date.now() + METADATA_DOCUMENT_CACHE_TTL_MS,
  });

  while (documentCache.size > METADATA_DOCUMENT_CACHE_MAX_ENTRIES) {
    const oldestUrl = documentCache.keys().next().value;
    if (typeof oldestUrl !== "string") break;
    documentCache.delete(oldestUrl);
  }
}

async function readTextWithLimit(response: Response): Promise<string> {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > METADATA_DOCUMENT_MAX_BYTES) {
    return "";
  }

  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let html = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    receivedBytes += value.byteLength;
    if (receivedBytes > METADATA_DOCUMENT_MAX_BYTES) {
      await reader.cancel();
      return "";
    }

    html += decoder.decode(value, { stream: true });
  }

  return html + decoder.decode();
}

async function fetchMetadataDocumentInternal(
  url: string,
  revalidateSeconds: number,
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), METADATA_DOCUMENT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      next: { revalidate: revalidateSeconds },
      headers: METADATA_REQUEST_HEADERS,
      signal: controller.signal,
    });
    if (!response.ok) return "";
    return await readTextWithLimit(response);
  } catch {
    return "";
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchMetadataDocument(
  url: string,
  revalidateSeconds: number,
): Promise<string> {
  const normalizedUrl = url.trim();
  if (!normalizedUrl) return "";

  const cached = getCachedDocument(normalizedUrl);
  if (cached !== null) return cached;

  const pending = pendingDocumentByUrl.get(normalizedUrl);
  if (pending) return pending;

  const nextPending = fetchMetadataDocumentInternal(normalizedUrl, revalidateSeconds)
    .then((html) => {
      cacheDocument(normalizedUrl, html);
      return html;
    })
    .finally(() => {
      pendingDocumentByUrl.delete(normalizedUrl);
    });

  pendingDocumentByUrl.set(normalizedUrl, nextPending);
  return nextPending;
}
