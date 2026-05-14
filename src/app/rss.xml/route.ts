import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/constants/siteMetadata";
import { isExternalLink } from "@/lib/url";
import { getAllArticles } from "@/server/articles/all";

export const revalidate = 1800;

const FEED_PATH = "/rss.xml";
const ARTICLES_PATH = "/articles";
const MAX_FEED_ITEMS = 50;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}

function toAbsoluteUrl(url: string, siteUrl: string) {
  if (isExternalLink(url)) return url;
  return new URL(url, siteUrl).toString();
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const feedUrl = new URL(FEED_PATH, siteUrl).toString();
  const articlesUrl = new URL(ARTICLES_PATH, siteUrl).toString();
  const articles = await getAllArticles();

  const itemsXml = articles
    .filter(
      (article) =>
        article.title.trim().length > 0 &&
        article.link.trim().length > 0 &&
        Number.isFinite(article.publishedAt) &&
        article.publishedAt > 0,
    )
    .slice(0, MAX_FEED_ITEMS)
    .map((article) => {
      const absoluteLink = toAbsoluteUrl(article.link, siteUrl);
      const escapedTitle = escapeXml(article.title);
      const escapedLink = escapeXml(absoluteLink);
      const escapedDescription = escapeXml(`${article.platform}の記事`);
      const escapedCategory = escapeXml(article.platform);
      const pubDate = new Date(article.publishedAt).toUTCString();

      return [
        "    <item>",
        `      <title>${escapedTitle}</title>`,
        `      <link>${escapedLink}</link>`,
        `      <guid isPermaLink="true">${escapedLink}</guid>`,
        `      <description>${escapedDescription}</description>`,
        `      <category>${escapedCategory}</category>`,
        `      <pubDate>${pubDate}</pubDate>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const now = new Date().toUTCString();
  const rssXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(`${SITE_NAME} Articles`)}</title>`,
    `    <link>${escapeXml(articlesUrl)}</link>`,
    `    <description>${escapeXml(SITE_DESCRIPTION)}</description>`,
    "    <language>ja</language>",
    `    <lastBuildDate>${now}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>`,
    itemsXml,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
}
