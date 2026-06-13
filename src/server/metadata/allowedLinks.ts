import { getAllInterests } from "@/server/interests/all";
import { getAllWorks } from "@/server/works/all";

let allowedMetadataLinksPromise: Promise<Set<string>> | null = null;

function normalizeLink(value: string): string {
  return value.trim();
}

async function loadAllowedMetadataLinks(): Promise<Set<string>> {
  const [interests, works] = await Promise.all([getAllInterests(), getAllWorks()]);
  const links = new Set<string>();

  interests.forEach((category) => {
    category.items.forEach((item) => {
      const link = normalizeLink(item.link);
      if (link) links.add(link);
    });
  });

  works.allWorks.forEach((work) => {
    const workLink = normalizeLink(work.link);
    if (workLink) links.add(workLink);

    work.articles.forEach((article) => {
      const articleLink = normalizeLink(article.link);
      if (articleLink) links.add(articleLink);
    });
  });

  return links;
}

export async function isAllowedMetadataLink(url: string): Promise<boolean> {
  allowedMetadataLinksPromise ??= loadAllowedMetadataLinks();
  const allowedLinks = await allowedMetadataLinksPromise;
  return allowedLinks.has(normalizeLink(url));
}
