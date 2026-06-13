import { XMLParser } from "fast-xml-parser";
import { SOCIAL_LINK_URLS } from "@/constants/socialLinks";
import type { ArticleItem } from "@/types/articles";
import {
  REVALIDATE_SECONDS,
  fetchOgpImage,
  formatDate,
  getUserNameFromUrl,
  toArticleDescription,
  toArray,
} from "./shared";

const QIITA_DEFAULT_IMAGE = "https://qiita.com/favicons/apple-touch-icon.png";

type ParsedAtomFeed = {
  entry?: ParsedAtomEntry | ParsedAtomEntry[];
};

type ParsedAtomEntry = {
  id?: string;
  title?: string;
  published?: string;
  content?: string | { "#text"?: string };
  link?: { href?: string } | Array<{ href?: string }>;
};

function getAtomText(value: string | { "#text"?: string } | undefined): string {
  return typeof value === "string" ? value : value?.["#text"] ?? "";
}

export async function fetchQiitaArticles(): Promise<ArticleItem[]> {
  const userName = getUserNameFromUrl(SOCIAL_LINK_URLS.Qiita);
  const response = await fetch(`https://qiita.com/${userName}/feed.atom`, {
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
  const parsed = parser.parse(xml) as { feed?: ParsedAtomFeed };

  return Promise.all(
    toArray(parsed.feed?.entry).map(async (entry, index) => {
      const links = toArray(entry.link);
      const link = links.find((candidate) => candidate.href)?.href?.trim() ?? "";
      const publishedAt = new Date(entry.published ?? 0);
      const imageFromOgp = await fetchOgpImage(link);

      return {
        id: `qiita-${entry.id ?? `${index}-${link}`}`,
        title: entry.title ?? "",
        description: toArticleDescription(getAtomText(entry.content)),
        platform: "Qiita",
        image: imageFromOgp || QIITA_DEFAULT_IMAGE,
        date: formatDate(publishedAt),
        publishedAt: publishedAt.getTime(),
        link,
      } satisfies ArticleItem;
    }),
  );
}
