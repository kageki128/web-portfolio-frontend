import { XMLParser } from "fast-xml-parser";
import { SOCIAL_LINK_URLS } from "@/constants/socialLinks";
import type { ArticleItem } from "@/types/articles";
import {
  REVALIDATE_SECONDS,
  extractFirstImageFromHtml,
  fetchOgpImage,
  formatDate,
  getUrlFromMedia,
  toArray,
} from "./shared";

const ZENN_DEFAULT_IMAGE = "https://static.zenn.studio/images/logo-only.svg";

type ParsedRssChannel = {
  image?: {
    url?: string;
  };
  item?: ParsedRssItem | ParsedRssItem[];
};

type ParsedRssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  "content:encoded"?: string;
  enclosure?: { url?: string } | Array<{ url?: string }>;
  "media:content"?: { url?: string } | Array<{ url?: string }>;
  "media:thumbnail"?: { url?: string } | Array<{ url?: string }>;
};

export async function fetchZennArticles(): Promise<ArticleItem[]> {
  const feedUrl = `${SOCIAL_LINK_URLS.Zenn.replace(/\/$/, "")}/feed`;
  const response = await fetch(feedUrl, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!response.ok) {
    throw new Error(`Zenn fetch failed: ${response.status}`);
  }

  const xml = await response.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  const parsed = parser.parse(xml) as { rss?: { channel?: ParsedRssChannel } };
  const channel = parsed.rss?.channel;
  if (!channel) return [];

  const channelImage = channel.image?.url ?? ZENN_DEFAULT_IMAGE;
  return Promise.all(
    toArray(channel.item).map(async (item, index) => {
      const link = (item.link ?? "").trim();
      const publishedAt = new Date(item.pubDate ?? 0);
      const imageFromOgp = await fetchOgpImage(link);
      const imageFromFeed =
        getUrlFromMedia(item.enclosure) ||
        getUrlFromMedia(item["media:thumbnail"]) ||
        getUrlFromMedia(item["media:content"]) ||
        extractFirstImageFromHtml(item.description ?? "") ||
        extractFirstImageFromHtml(item["content:encoded"] ?? "");

      return {
        id: `zenn-${index}-${link}`,
        title: item.title ?? "",
        platform: "Zenn",
        image: imageFromOgp || imageFromFeed || channelImage,
        date: formatDate(publishedAt),
        publishedAt: publishedAt.getTime(),
        link,
      } satisfies ArticleItem;
    }),
  );
}
