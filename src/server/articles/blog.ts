import matter from "gray-matter";
import { BLOG_THUMBNAIL_PATH } from "@/constants/assets";
import { blogArticleSources } from "@/content/blog/generated";
import type { ArticleItem, BlogArticleDetail } from "@/types/articles";
import { formatDate } from "./shared";

type BlogFrontmatter = {
  title: string;
  date: string;
};

type LoadedBlogArticle = {
  slug: string;
  title: string;
  content: string;
  publishedAt: number;
  date: string;
};

function toArticleLink(slug: string) {
  return `/articles/${slug}`;
}

function parseFrontmatter(data: unknown, fileName: string): BlogFrontmatter {
  if (typeof data !== "object" || data === null) {
    throw new Error(`Invalid frontmatter: ${fileName}`);
  }

  const frontmatter = data as Record<string, unknown>;
  if (typeof frontmatter.title !== "string" || typeof frontmatter.date !== "string") {
    throw new Error(`Missing required frontmatter fields in ${fileName}`);
  }

  return {
    title: frontmatter.title.trim(),
    date: frontmatter.date.trim(),
  };
}

function parsePublishedAt(date: string, fileName: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new Error(`Invalid date format in ${fileName}: ${date}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const normalized = new Date(Date.UTC(year, month - 1, day));
  const isValidDate =
    normalized.getUTCFullYear() === year &&
    normalized.getUTCMonth() === month - 1 &&
    normalized.getUTCDate() === day;
  if (!isValidDate) {
    throw new Error(`Invalid date format in ${fileName}: ${date}`);
  }

  const parsed = new Date(`${date}T00:00:00+09:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format in ${fileName}: ${date}`);
  }
  return parsed;
}

function loadBlogArticle({ slug, raw }: { slug: string; raw: string }): LoadedBlogArticle {
  const { data, content } = matter(raw);
  const context = `${slug}.md`;
  const frontmatter = parseFrontmatter(data, context);
  const publishedDate = parsePublishedAt(frontmatter.date, context);

  return {
    slug,
    title: frontmatter.title,
    content,
    publishedAt: publishedDate.getTime(),
    date: formatDate(publishedDate),
  };
}

function assertUniqueSlugs(slugs: string[]) {
  const slugSet = new Set<string>();
  for (const slug of slugs) {
    if (slugSet.has(slug)) {
      throw new Error(`Duplicate blog slug: ${slug}`);
    }
    slugSet.add(slug);
  }
}

function toArticleItem(article: LoadedBlogArticle): ArticleItem {
  return {
    id: article.slug,
    title: article.title,
    platform: "Blog",
    image: BLOG_THUMBNAIL_PATH,
    date: article.date,
    publishedAt: article.publishedAt,
    link: toArticleLink(article.slug),
  };
}

function toBlogArticleDetail(article: LoadedBlogArticle): BlogArticleDetail {
  return {
    id: article.slug,
    slug: article.slug,
    title: article.title,
    image: BLOG_THUMBNAIL_PATH,
    date: article.date,
    publishedAt: article.publishedAt,
    link: toArticleLink(article.slug),
    content: article.content,
  };
}

async function loadAllBlogArticles() {
  assertUniqueSlugs(blogArticleSources.map((source) => source.slug));
  const articles = blogArticleSources.map(loadBlogArticle);
  return articles.sort((a, b) => b.publishedAt - a.publishedAt);
}

async function loadBlogArticleBySlug(slug: string) {
  const source = blogArticleSources.find((article) => article.slug === slug);
  return source ? loadBlogArticle(source) : null;
}

export async function getBlogArticleSlugs() {
  const articles = await loadAllBlogArticles();
  return articles.map((article) => article.slug);
}

export async function getBlogArticles(): Promise<ArticleItem[]> {
  const articles = await loadAllBlogArticles();
  return articles.map(toArticleItem);
}

export async function getBlogArticleBySlug(slug: string): Promise<BlogArticleDetail | null> {
  if (!slug) return null;

  const article = await loadBlogArticleBySlug(slug);
  if (!article) return null;
  return toBlogArticleDetail(article);
}
