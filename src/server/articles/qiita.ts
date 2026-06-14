import { XMLParser } from "fast-xml-parser";
import { SOCIAL_LINK_URLS } from "@/constants/socialLinks";
import type { ArticleItem } from "@/types/articles";
import { z } from "zod";
import {
  REVALIDATE_SECONDS,
  fetchArticleSource,
  fetchOgpImage,
  formatDate,
  getUserNameFromUrl,
  parseArticleDate,
  toArticleDescription,
  toArray,
} from "./shared";

const QIITA_DEFAULT_IMAGE = "https://qiita.com/favicons/apple-touch-icon.png";

const atomLinkSchema = z.object({
  href: z.string().optional(),
});

const atomEntrySchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  published: z.string().optional(),
  content: z.union([z.string(), z.object({ "#text": z.string().optional() })]).optional(),
  link: z.union([atomLinkSchema, z.array(atomLinkSchema)]).optional(),
});

const atomFeedSchema = z.object({
  feed: z
    .object({
      entry: z.union([atomEntrySchema, z.array(atomEntrySchema)]).optional(),
    })
    .optional(),
});

function getAtomText(value: string | { "#text"?: string } | undefined): string {
  return typeof value === "string" ? value : value?.["#text"] ?? "";
}

export async function fetchQiitaArticles(): Promise<ArticleItem[]> {
  const userName = getUserNameFromUrl(SOCIAL_LINK_URLS.Qiita);
  const response = await fetchArticleSource(`https://qiita.com/${userName}/feed.atom`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    throw new Error(`Qiita fetch failed: ${response.status}`);
  }

  const xml = await response.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  const parsed = atomFeedSchema.parse(parser.parse(xml));

  const articles = await Promise.all(
    toArray(parsed.feed?.entry).map(async (entry, index) => {
      const links = toArray(entry.link);
      const link = links.find((candidate) => candidate.href)?.href?.trim() ?? "";
      const title = entry.title?.trim() ?? "";
      const publishedAt = parseArticleDate(entry.published);
      if (!link || !title || !publishedAt) return null;

      const imageFromOgp = await fetchOgpImage(link);

      return {
        id: `qiita-${entry.id ?? `${index}-${link}`}`,
        title,
        description: toArticleDescription(getAtomText(entry.content)),
        platform: "Qiita",
        image: imageFromOgp || QIITA_DEFAULT_IMAGE,
        date: formatDate(publishedAt),
        publishedAt: publishedAt.getTime(),
        link,
      } satisfies ArticleItem;
    }),
  );

  return articles.filter((article) => article !== null);
}
