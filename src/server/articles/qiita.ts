import { SOCIAL_LINK_URLS } from "@/constants/socialLinks";
import type { ArticleItem } from "@/types/articles";
import {
  REVALIDATE_SECONDS,
  extractFirstImageFromHtml,
  fetchOgpImage,
  formatDate,
  getUserNameFromUrl,
} from "./shared";

const QIITA_DEFAULT_IMAGE = "https://qiita.com/favicons/apple-touch-icon.png";

type QiitaArticle = {
  id: string;
  title: string;
  url: string;
  created_at: string;
  rendered_body: string;
  user: {
    profile_image_url: string;
  };
};

export async function fetchQiitaArticles(): Promise<ArticleItem[]> {
  const userName = getUserNameFromUrl(SOCIAL_LINK_URLS.Qiita);
  const response = await fetch(
    `https://qiita.com/api/v2/users/${userName}/items?page=1&per_page=20`,
    { next: { revalidate: REVALIDATE_SECONDS } },
  );
  if (!response.ok) {
    throw new Error(`Qiita fetch failed: ${response.status}`);
  }

  const data = (await response.json()) as QiitaArticle[];
  return Promise.all(
    data.map(async (article) => {
      const publishedAt = new Date(article.created_at);
      const imageFromBody = extractFirstImageFromHtml(article.rendered_body);
      const imageFromOgp = await fetchOgpImage(article.url);

      return {
        id: `qiita-${article.id}`,
        title: article.title,
        platform: "Qiita",
        image: imageFromOgp || imageFromBody || article.user.profile_image_url || QIITA_DEFAULT_IMAGE,
        date: formatDate(publishedAt),
        publishedAt: publishedAt.getTime(),
        link: article.url,
      } satisfies ArticleItem;
    }),
  );
}
