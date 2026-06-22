import { z } from "zod";
import { workItemEntries } from "@/content/works/generated";
import worksIndex from "@/content/works/index.json";
import { runWithConcurrency } from "@/lib/runWithConcurrency";
import { hasText } from "@/lib/text";
import { fetchArticleTitle } from "@/server/articles/title";
import { parseJsonWithSchema } from "@/server/shared/content";
import type { WorkItem, WorksIndex, WorksYearGroup, WorksYearSection } from "@/types/works";

type WorkLookupContext = "featuredIds" | "yearSections";
type WorkItemSource = Omit<WorkItem, "id" | "articles"> & {
  articles: string[];
};
export type WorkCardSummary = Pick<WorkItem, "title" | "date" | "tags" | "image" | "link">;

const workItemSourceSchema: z.ZodType<WorkItemSource> = z.object({
  title: z.string(),
  date: z.string(),
  tags: z.array(z.string()),
  image: z.string(),
  preview: z.string(),
  desc: z.string(),
  members: z.string(),
  role: z.string(),
  tech: z.string(),
  duration: z.string(),
  articles: z.array(z.string()),
  link: z.string(),
});

const worksYearSectionSchema: z.ZodType<WorksYearSection> = z.object({
  year: z.number().int(),
  itemIds: z.array(z.string()),
});

const MANUAL_WORK_ARTICLE_TITLE_BY_LINK: Record<string, string> = {
  "https://x.com/Senirenol_traP": "Senirenol_traP (@X)",
  "https://takiplaza.gakumu.titech.ac.jp/": "Taki Plaza (東工大蔵前会館)",
};
const WORK_ARTICLE_TITLE_FETCH_CONCURRENCY = 6;

type GetAllWorksOptions = {
  resolveArticleTitles?: boolean;
};

const worksIndexSchema: z.ZodType<WorksIndex> = z.object({
  featuredIds: z.array(z.string()),
  yearSections: z.array(worksYearSectionSchema),
});

async function loadWorksIndex(): Promise<WorksIndex> {
  return parseJsonWithSchema(worksIndex, worksIndexSchema, "works/index.json");
}

async function loadWorkItemSourcesById(): Promise<Map<string, WorkItemSource>> {
  const entries = workItemEntries.map(([id, source]) => ({
    id,
    source: parseJsonWithSchema(source, workItemSourceSchema, `works/items/${id}.json`),
  }));

  return entries.reduce((acc, entry) => {
    if (acc.has(entry.id)) {
      throw new Error(`Duplicate work id: ${entry.id}`);
    }
    acc.set(entry.id, entry.source);
    return acc;
  }, new Map<string, WorkItemSource>());
}

async function resolveWorkArticleTitles(articleLinks: string[]): Promise<Map<string, string>> {
  const uniqueLinks = Array.from(
    new Set(
      articleLinks
        .map((articleUrl) => articleUrl.trim())
        .filter((articleUrl) => hasText(articleUrl) && !hasText(MANUAL_WORK_ARTICLE_TITLE_BY_LINK[articleUrl] ?? "")),
    ),
  );
  const titleByLink = new Map<string, string>();

  await runWithConcurrency(uniqueLinks, WORK_ARTICLE_TITLE_FETCH_CONCURRENCY, async (articleUrl) => {
    const title = await fetchArticleTitle(articleUrl);
    if (hasText(title)) {
      titleByLink.set(articleUrl, title);
    }
  });

  return titleByLink;
}

function resolveWorkById(itemsById: Map<string, WorkItem>, itemId: string, context: WorkLookupContext): WorkItem {
  const item = itemsById.get(itemId);
  if (!item) {
    throw new Error(`Unknown work id in ${context}: ${itemId}`);
  }
  return item;
}

export async function getWorkCardSummariesById(): Promise<Map<string, WorkCardSummary>> {
  const sourcesById = await loadWorkItemSourcesById();
  const entries = Array.from(sourcesById.entries()).map(
    ([id, source]) =>
      [
        id,
        {
          title: source.title,
          date: source.date,
          tags: source.tags,
          image: source.image,
          link: source.link,
        } satisfies WorkCardSummary,
      ] as const,
  );

  return new Map(entries);
}

export async function getWorkImagesById(): Promise<Map<string, string>> {
  const summariesById = await getWorkCardSummariesById();
  return new Map(Array.from(summariesById.entries(), ([id, summary]) => [id, summary.image]));
}

async function loadWorkItemsById(options: GetAllWorksOptions = {}): Promise<Map<string, WorkItem>> {
  const sourcesById = await loadWorkItemSourcesById();
  const articleLinks = Array.from(sourcesById.values()).flatMap((source) =>
    source.articles.map((articleUrl) => articleUrl.trim()).filter(hasText),
  );
  const resolvedArticleTitleByLink = options.resolveArticleTitles
    ? await resolveWorkArticleTitles(articleLinks)
    : new Map<string, string>();
  const entries = Array.from(sourcesById.entries()).map(([id, source]) => {
    const sourceArticleLinks = source.articles.map((articleUrl) => articleUrl.trim()).filter(hasText);
    const articles = sourceArticleLinks.map((articleUrl) => ({
      title: MANUAL_WORK_ARTICLE_TITLE_BY_LINK[articleUrl] ?? resolvedArticleTitleByLink.get(articleUrl) ?? articleUrl,
      link: articleUrl,
    }));

    return [
      id,
      {
        id,
        ...source,
        articles,
      } satisfies WorkItem,
    ] as const;
  });

  return new Map(entries);
}

export async function getAllWorks(options: GetAllWorksOptions = {}): Promise<{
  allWorks: WorkItem[];
  featuredWorks: WorkItem[];
  allWorksByYear: WorksYearGroup[];
}> {
  const [worksIndex, itemsById] = await Promise.all([loadWorksIndex(), loadWorkItemsById(options)]);
  const allWorks = Array.from(itemsById.values()).sort((a, b) => a.id.localeCompare(b.id));

  const featuredWorks = worksIndex.featuredIds.map((itemId) =>
    resolveWorkById(itemsById, itemId, "featuredIds"),
  );

  const allWorksByYear = worksIndex.yearSections.map(({ year, itemIds }) => ({
    year,
    items: itemIds.map((itemId) => resolveWorkById(itemsById, itemId, "yearSections")),
  }));

  return {
    allWorks,
    featuredWorks,
    allWorksByYear,
  };
}
