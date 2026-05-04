import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { ArticleItem, BlogArticleDetail } from "@/types/articles";
import { formatDate } from "./shared";

const BLOG_DIRECTORY = path.join(process.cwd(), "src", "content", "blog");

type BlogFrontmatter = {
  id: number;
  title: string;
  date: string;
};

type LoadedBlogArticle = {
  id: number;
  slug: string;
  title: string;
  content: string;
  publishedAt: number;
  date: string;
  image: string;
};

function toRouteSlug(id: number) {
  return String(id);
}

function toArticleId(slug: string) {
  return `blog-${slug}`;
}

function toArticleLink(slug: string) {
  return `/articles/${slug}`;
}

function parseFrontmatter(data: unknown, fileName: string): BlogFrontmatter {
  if (typeof data !== "object" || data === null) {
    throw new Error(`Invalid frontmatter: ${fileName}`);
  }

  const frontmatter = data as Record<string, unknown>;
  if (typeof frontmatter.id !== "number" || !Number.isInteger(frontmatter.id) || frontmatter.id < 1) {
    throw new Error(`id must be positive integer in ${fileName}`);
  }

  if (typeof frontmatter.title !== "string" || typeof frontmatter.date !== "string") {
    throw new Error(`Missing required frontmatter fields in ${fileName}`);
  }

  return {
    id: frontmatter.id,
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

async function listBlogMarkdownFiles() {
  try {
    const entries = await readdir(BLOG_DIRECTORY, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => entry.name);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function loadBlogArticle(fileName: string): Promise<LoadedBlogArticle> {
  const filePath = path.join(BLOG_DIRECTORY, fileName);
  const raw = await readFile(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = parseFrontmatter(data, fileName);
  const publishedDate = parsePublishedAt(frontmatter.date, fileName);
  const slug = toRouteSlug(frontmatter.id);
  const image = "";

  return {
    id: frontmatter.id,
    slug,
    title: frontmatter.title,
    content,
    publishedAt: publishedDate.getTime(),
    date: formatDate(publishedDate),
    image,
  };
}

function assertUniqueSlugs(articles: LoadedBlogArticle[]) {
  const slugSet = new Set<string>();
  for (const article of articles) {
    if (slugSet.has(article.slug)) {
      throw new Error(`Duplicate blog slug: ${article.slug}`);
    }
    slugSet.add(article.slug);
  }
}

function toArticleItem(article: LoadedBlogArticle): ArticleItem {
  return {
    id: toArticleId(article.slug),
    title: article.title,
    platform: "Blog",
    image: article.image,
    date: article.date,
    publishedAt: article.publishedAt,
    link: toArticleLink(article.slug),
  };
}

function toBlogArticleDetail(article: LoadedBlogArticle): BlogArticleDetail {
  return {
    id: toArticleId(article.slug),
    slug: article.slug,
    title: article.title,
    image: article.image,
    date: article.date,
    publishedAt: article.publishedAt,
    link: toArticleLink(article.slug),
    content: article.content,
  };
}

async function loadAllBlogArticles() {
  const fileNames = await listBlogMarkdownFiles();
  const articles = await Promise.all(fileNames.map(loadBlogArticle));
  assertUniqueSlugs(articles);
  return articles.sort((a, b) => b.publishedAt - a.publishedAt);
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
  if (!/^[1-9]\d*$/.test(slug)) return null;

  const articles = await loadAllBlogArticles();
  const article = articles.find((item) => item.slug === slug);
  if (!article) return null;
  return toBlogArticleDetail(article);
}
