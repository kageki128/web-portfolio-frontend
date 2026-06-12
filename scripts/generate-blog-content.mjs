import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { SKIP, visit } from "unist-util-visit";

const BLOG_DIRECTORY_PATH = path.join(process.cwd(), "src/content/blog");
const OUTPUT_FILE_PATH = path.join(process.cwd(), "src/content/blog/generated.ts");
const PRETTY_CODE_OPTIONS = {
  theme: "github-dark",
  keepBackground: false,
};
const ADMONITION_TYPES = new Set(["info", "warning", "error", "success"]);
const BLOG_DESCRIPTION_MAX_LENGTH = 140;

function parseFrontmatter(data, fileName) {
  if (typeof data !== "object" || data === null) {
    throw new Error(`Invalid frontmatter: ${fileName}`);
  }

  const frontmatter = data;
  if (typeof frontmatter.title !== "string" || typeof frontmatter.date !== "string") {
    throw new Error(`Missing required frontmatter fields in ${fileName}`);
  }

  return {
    title: frontmatter.title.trim(),
    date: frontmatter.date.trim(),
  };
}

function parsePublishedAt(date, fileName) {
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

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function extractFirstImageFromMarkdown(markdown) {
  const markdownImageMatch = /!\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/.exec(markdown);
  if (markdownImageMatch?.[1]) {
    return markdownImageMatch[1].replace(/^<|>$/g, "").trim();
  }

  const htmlImageMatch = /<img[^>]+src=["']([^"']+)["'][^>]*>/i.exec(markdown);
  if (htmlImageMatch?.[1]) {
    return htmlImageMatch[1].trim();
  }

  return "/images/blog/default.jpg";
}

function stripMarkdown(markdown) {
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

function truncateText(value, maxLength) {
  const chars = Array.from(value);
  if (chars.length <= maxLength) return value;
  return `${chars.slice(0, maxLength).join("")}...`;
}

function toArticleDescription(markdown) {
  const plainText = stripMarkdown(markdown);
  if (!plainText) return "";
  return truncateText(plainText, BLOG_DESCRIPTION_MAX_LENGTH);
}

function remarkAdmonition() {
  return (tree) => {
    visit(tree, "containerDirective", (node) => {
      const kind = node.name;
      if (typeof kind !== "string" || !ADMONITION_TYPES.has(kind)) {
        return;
      }

      node.data = {
        ...node.data,
        hName: "div",
        hProperties: {
          ...node.data?.hProperties,
          className: ["admonition", `admonition-${kind}`],
          "data-admonition": kind,
        },
      };
    });
  };
}

function rehypeWrapTables() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "table" || typeof index !== "number" || !parent) {
        return;
      }

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["table-scroll"],
        },
        children: [node],
      };

      return SKIP;
    });
  };
}

async function renderMarkdownToHtml(markdown) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkAdmonition)
    .use(remarkRehype)
    .use(rehypePrettyCode, PRETTY_CODE_OPTIONS)
    .use(rehypeWrapTables)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

function getSlugFromFileName(fileName) {
  const slug = fileName.replace(/\.md$/, "").trim();
  if (!slug) {
    throw new Error(`Invalid blog file name: ${fileName}`);
  }
  return slug;
}

async function loadBlogSources() {
  const entries = await readdir(BLOG_DIRECTORY_PATH, { withFileTypes: true });
  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .sort((a, b) => a.name.localeCompare(b.name));

  return Promise.all(
    markdownFiles.map(async (entry) => {
      const slug = getSlugFromFileName(entry.name);
      const filePath = path.join(BLOG_DIRECTORY_PATH, entry.name);
      const raw = await readFile(filePath, "utf-8");
      const { data, content } = matter(raw);
      const frontmatter = parseFrontmatter(data, entry.name);
      const publishedDate = parsePublishedAt(frontmatter.date, entry.name);
      const html = await renderMarkdownToHtml(content);

      return {
        slug,
        title: frontmatter.title,
        date: formatDate(publishedDate),
        publishedAt: publishedDate.getTime(),
        image: extractFirstImageFromMarkdown(content),
        description: toArticleDescription(content),
        html,
      };
    }),
  );
}

function buildOutput(sources) {
  const lines = [
    "// This file is auto-generated by scripts/generate-blog-content.mjs.",
    "// Do not edit manually.",
    "",
    "export type BlogArticleSource = {",
    "  slug: string;",
    "  title: string;",
    "  date: string;",
    "  publishedAt: number;",
    "  image: string;",
    "  description: string;",
    "  html: string;",
    "};",
    "",
    "export const blogArticleSources: BlogArticleSource[] = [",
    ...sources.map(
      (source) =>
        `  { slug: ${JSON.stringify(source.slug)}, title: ${JSON.stringify(source.title)}, date: ${JSON.stringify(source.date)}, publishedAt: ${source.publishedAt}, image: ${JSON.stringify(source.image)}, description: ${JSON.stringify(source.description)}, html: ${JSON.stringify(source.html)} },`,
    ),
    "];",
    "",
  ];

  return lines.join("\n");
}

async function main() {
  const sources = await loadBlogSources();
  const output = buildOutput(sources);
  await writeFile(OUTPUT_FILE_PATH, output, "utf-8");
  console.log(`Generated ${OUTPUT_FILE_PATH} (${sources.length} articles)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
