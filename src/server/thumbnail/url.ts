export function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function isHttpUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function resolveImageUrl(imageUrl: string, pageUrl: string): string {
  try {
    return new URL(imageUrl, pageUrl).toString();
  } catch {
    return "";
  }
}

export function normalizeHost(host: string): string {
  return host.toLowerCase();
}

export function isImageContentType(contentType: string): boolean {
  return contentType.toLowerCase().startsWith("image/");
}
