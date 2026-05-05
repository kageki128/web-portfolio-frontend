import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { BLOG_THUMBNAIL_PATH } from "@/constants/assets";
import type { ArticleItem, BlogArticleDetail } from "@/types/articles";
import { formatDate } from "./shared";

const BLOG_DIRECTORY = path.join(process.cwd(), "src", "content", "blog");
const BLOG_FILE_EXTENSION = ".md";

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

async function listBlogMarkdownFiles() {
  try {
    const entries = await readdir(BLOG_DIRECTORY, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && entry.name.endsWith(BLOG_FILE_EXTENSION)).map((entry) => entry.name);
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
  const slug = path.basename(fileName, BLOG_FILE_EXTENSION);
  if (!slug) {
    throw new Error(`Invalid file name: ${fileName}`);
  }

  return {
    slug,
    title: frontmatter.title,
    content,
    publishedAt: publishedDate.getTime(),
    date: formatDate(publishedDate),
  };
}

function assertUniqueSlugs(fileNames: string[]) {
  const slugSet = new Set<string>();
  for (const fileName of fileNames) {
    const slug = path.basename(fileName, BLOG_FILE_EXTENSION);
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
  const fileNames = await listBlogMarkdownFiles();
  assertUniqueSlugs(fileNames);
  const articles = await Promise.all(fileNames.map(loadBlogArticle));
  return articles.sort((a, b) => b.publishedAt - a.publishedAt);
}

async function loadBlogArticleBySlug(slug: string) {
  const filePath = path.resolve(BLOG_DIRECTORY, `${slug}${BLOG_FILE_EXTENSION}`);
  if (!filePath.startsWith(`${BLOG_DIRECTORY}${path.sep}`)) {
    return null;
  }

  try {
    return await loadBlogArticle(path.basename(filePath));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
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
