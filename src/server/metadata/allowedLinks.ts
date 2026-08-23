import { getAllInterests } from "@/server/interests/all";
import { getAllWorks } from "@/server/works/all";
import { SOCIAL_LINK_URLS } from "@/constants/socialLinks";

let allowedMetadataLinksPromise: Promise<Set<string>> | null = null;

function normalizeLink(value: string): string {
  return value.trim();
}

function isAllowedArticleLink(value: string): boolean {
  try {
    const url = new URL(value);
    const qiitaProfile = new URL(SOCIAL_LINK_URLS.Qiita);
    const zennProfile = new URL(SOCIAL_LINK_URLS.Zenn);

    return (
      (url.origin === qiitaProfile.origin &&
        url.pathname.startsWith(`${qiitaProfile.pathname}/items/`)) ||
      (url.origin === zennProfile.origin &&
        url.pathname.startsWith(`${zennProfile.pathname}/articles/`))
    );
  } catch {
    return false;
  }
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
  if (isAllowedArticleLink(url)) return true;

  allowedMetadataLinksPromise ??= loadAllowedMetadataLinks();
  const allowedLinks = await allowedMetadataLinksPromise;
  return allowedLinks.has(normalizeLink(url));
}
