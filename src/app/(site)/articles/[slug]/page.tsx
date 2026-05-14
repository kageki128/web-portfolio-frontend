import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownAsync } from "react-markdown";
import rehypePrettyCode from "rehype-pretty-code";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import { remarkAdmonition } from "@/server/articles/remark-admonition";
import { getBlogArticleBySlug, getBlogArticleSlugs } from "@/server/articles/blog";
import { markdownComponents } from "./markdown-renderers";

const ARTICLE_DESCRIPTION_MAX_LENGTH = 140;
const PRETTY_CODE_OPTIONS = {
  theme: "github-dark",
  keepBackground: false,
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^:::[^\n]*$/gm, " ")
    .replace(/^---+$/gm, " ")
    .replace(/^___+$/gm, " ")
    .replace(/^\*\*\*+$/gm, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\[\s?[xX ]\s?\]/g, " ")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^\s{0,3}[-+*]\s+/gm, "")
    .replace(/^\s{0,3}\d+\.\s+/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\|?[\s:-]+\|[\s|:-]*$/gm, " ")
    .replace(/\|/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value: string, maxLength: number) {
  const chars = Array.from(value);
  if (chars.length <= maxLength) return value;
  return `${chars.slice(0, maxLength).join("")}...`;
}

function toArticleDescription(markdown: string) {
  const plainText = stripMarkdown(markdown);
  if (!plainText) return "";
  return truncateText(plainText, ARTICLE_DESCRIPTION_MAX_LENGTH);
}

export async function generateStaticParams() {
  const slugs = await getBlogArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);
  if (!article) return {};

  const description = toArticleDescription(article.content);

  return {
    title: article.title,
    description,
    alternates: {
      canonical: article.link,
    },
    openGraph: {
      type: "article",
      url: article.link,
      title: article.title,
      description,
      images: [article.image],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [article.image],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <section className="mb-32">
          <article>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-slate-400 font-bold text-sm">{article.date}</span>
              <span className="text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-md bg-cyan-500">
                Blog
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight mt-4 mb-8 pb-3 border-b-4 border-cyan-500">
              {article.title}
            </h1>

            <div className="mt-12 space-y-6 text-slate-600 leading-loose font-medium">
              <MarkdownAsync
                remarkPlugins={[remarkGfm, remarkDirective, remarkAdmonition]}
                rehypePlugins={[[rehypePrettyCode, PRETTY_CODE_OPTIONS]]}
                components={markdownComponents}
              >
                {article.content}
              </MarkdownAsync>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
