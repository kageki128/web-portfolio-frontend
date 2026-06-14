import { XMLParser } from "fast-xml-parser";
import { SOCIAL_LINK_URLS } from "@/constants/socialLinks";
import type { ArticleItem } from "@/types/articles";
import { z } from "zod";
import {
  REVALIDATE_SECONDS,
  extractFirstImageFromHtml,
  fetchArticleSource,
  fetchOgpImage,
  formatDate,
  getUrlFromMedia,
  parseArticleDate,
  toArticleDescription,
  toArray,
} from "./shared";

const ZENN_DEFAULT_IMAGE = "https://static.zenn.studio/images/logo-only.svg";

const mediaSchema = z.object({
  url: z.string().optional(),
});

const rssItemSchema = z.object({
  title: z.string().optional(),
  link: z.string().optional(),
  pubDate: z.string().optional(),
  description: z.string().optional(),
  "content:encoded": z.string().optional(),
  enclosure: z.union([mediaSchema, z.array(mediaSchema)]).optional(),
  "media:content": z.union([mediaSchema, z.array(mediaSchema)]).optional(),
  "media:thumbnail": z.union([mediaSchema, z.array(mediaSchema)]).optional(),
});

const rssFeedSchema = z.object({
  rss: z
    .object({
      channel: z
        .object({
          image: z.object({ url: z.string().optional() }).optional(),
          item: z.union([rssItemSchema, z.array(rssItemSchema)]).optional(),
        })
        .optional(),
    })
    .optional(),
});

export async function fetchZennArticles(): Promise<ArticleItem[]> {
  const feedUrl = `${SOCIAL_LINK_URLS.Zenn.replace(/\/$/, "")}/feed`;
  const response = await fetchArticleSource(feedUrl, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    throw new Error(`Zenn fetch failed: ${response.status}`);
  }

  const xml = await response.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  const parsed = rssFeedSchema.parse(parser.parse(xml));
  const channel = parsed.rss?.channel;
  if (!channel) return [];

  const channelImage = channel.image?.url ?? ZENN_DEFAULT_IMAGE;
  const articles = await Promise.all(
    toArray(channel.item).map(async (item) => {
      const link = (item.link ?? "").trim();
      const title = item.title?.trim() ?? "";
      const publishedAt = parseArticleDate(item.pubDate);
      if (!link || !title || !publishedAt) return null;

      const imageFromOgp = await fetchOgpImage(link);
      const imageFromFeed =
        getUrlFromMedia(item.enclosure) ||
        getUrlFromMedia(item["media:thumbnail"]) ||
        getUrlFromMedia(item["media:content"]) ||
        extractFirstImageFromHtml(item.description ?? "") ||
        extractFirstImageFromHtml(item["content:encoded"] ?? "");

      return {
        id: `zenn-${link}`,
        title,
        description: toArticleDescription(item.description ?? item["content:encoded"] ?? ""),
        platform: "Zenn",
        image: imageFromOgp || imageFromFeed || channelImage,
        date: formatDate(publishedAt),
        publishedAt: publishedAt.getTime(),
        link,
      } satisfies ArticleItem;
    }),
  );

  return articles.filter((article) => article !== null);
}
