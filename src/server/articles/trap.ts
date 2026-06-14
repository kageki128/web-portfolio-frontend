import { SOCIAL_LINK_URLS } from "@/constants/socialLinks";
import type { ArticleItem } from "@/types/articles";
import { z } from "zod";
import { createGhostAdminToken } from "./ghost";
import {
  REVALIDATE_SECONDS,
  fetchArticleSource,
  formatDate,
  getUserNameFromUrl,
  parseArticleDate,
  toArticleDescription,
} from "./shared";

const TRAP_ADMIN_API_URL = "https://blog-admin.trap.jp/ghost/api/admin/posts/";
const TRAP_DEFAULT_IMAGE = "https://trap.jp/favicon.png";

const postsResponseSchema = z.object({
  posts: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      url: z.string(),
      feature_image: z.string().nullable(),
      published_at: z.string(),
      excerpt: z.string().nullable(),
    }),
  ),
});

export async function fetchTraPArticles(
  staffAccessToken = process.env.GHOST_STAFF_ACCESS_TOKEN,
): Promise<ArticleItem[]> {
  if (!staffAccessToken) {
    throw new Error("GHOST_STAFF_ACCESS_TOKEN is required to fetch traP articles");
  }

  const authorSlug = getUserNameFromUrl(SOCIAL_LINK_URLS.traP);
  const searchParams = new URLSearchParams({
    fields: "id,title,url,feature_image,published_at,excerpt",
    filter: `authors.slug:${authorSlug}+status:published+visibility:public`,
    limit: "all",
    order: "published_at desc",
  });
  const token = await createGhostAdminToken(staffAccessToken);
  const response = await fetchArticleSource(`${TRAP_ADMIN_API_URL}?${searchParams}`, {
    headers: {
      "Accept-Version": "v5.0",
      Authorization: `Ghost ${token}`,
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`traP API fetch failed: ${response.status}`);
  }

  const { posts } = postsResponseSchema.parse(await response.json());
  const articles = posts.map((post) => {
    const publishedAt = parseArticleDate(post.published_at);
    if (!publishedAt) return null;

    return {
      id: `trap-${post.id}`,
      title: post.title,
      description: toArticleDescription(post.excerpt ?? ""),
      platform: "traP",
      image: post.feature_image ?? TRAP_DEFAULT_IMAGE,
      date: formatDate(publishedAt),
      publishedAt: publishedAt.getTime(),
      link: post.url,
    } satisfies ArticleItem;
  });

  return articles.filter((article) => article !== null);
}
