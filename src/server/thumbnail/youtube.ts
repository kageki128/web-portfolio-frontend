import { normalizeHost, parseUrl } from "./url";

const YOUTUBE_HOSTS = new Set(["www.youtube.com", "youtube.com", "m.youtube.com"]);

function extractYouTubeVideoId(url: string): string {
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

export function getYouTubeThumbnailUrl(url: string): string {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return "";
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
