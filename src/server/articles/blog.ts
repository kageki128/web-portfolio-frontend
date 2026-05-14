import { blogArticleSources } from "@/content/blog/generated";
import type { ArticleItem, BlogArticleDetail } from "@/types/articles";

type LoadedBlogArticle = {
  slug: string;
  title: string;
  description: string;
  contentHtml: string;
  image: string;
  publishedAt: number;
  date: string;
};

function toArticleLink(slug: string) {
  return `/articles/${slug}`;
}

function loadBlogArticle({
  slug,
  title,
  date,
  publishedAt,
  image,
  description,
  html,
}: (typeof blogArticleSources)[number]): LoadedBlogArticle {
  return {
    slug,
    title,
    description,
    contentHtml: html,
    image,
    publishedAt,
    date,
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
    image: article.image,
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
    image: article.image,
    date: article.date,
    publishedAt: article.publishedAt,
    link: toArticleLink(article.slug),
    description: article.description,
    contentHtml: article.contentHtml,
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
