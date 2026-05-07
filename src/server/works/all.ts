import path from "node:path";
import { z } from "zod";
import { hasText } from "@/lib/text";
import { fetchArticleTitle } from "@/server/articles/title";
import {
  collectJsonFilePaths,
  getJsonFileId,
  readJsonFileWithSchema,
} from "@/server/shared/content";
import { enrichLinkedItemImage } from "@/server/thumbnail/shared";
import type { WorkItem, WorksIndex, WorksYearGroup, WorksYearSection } from "@/types/works";

const WORKS_DIRECTORY = path.join(process.cwd(), "src", "content", "works");
const WORKS_ITEMS_DIRECTORY = path.join(WORKS_DIRECTORY, "items");
const WORKS_INDEX_FILE = path.join(WORKS_DIRECTORY, "index.json");

type WorkLookupContext = "featuredIds" | "yearSections";
type WorkItemSource = Omit<WorkItem, "id" | "articles"> & {
  articles: string[];
};
export type WorkCardSummary = Pick<WorkItem, "title" | "date" | "tags" | "image">;

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

const worksIndexSchema: z.ZodType<WorksIndex> = z.object({
  featuredIds: z.array(z.string()),
  yearSections: z.array(worksYearSectionSchema),
});

async function loadWorksIndex(): Promise<WorksIndex> {
  return readJsonFileWithSchema(WORKS_INDEX_FILE, worksIndexSchema, "works/index.json");
}

async function loadWorkItemSourcesById(): Promise<Map<string, WorkItemSource>> {
  const jsonFilePaths = await collectJsonFilePaths(WORKS_ITEMS_DIRECTORY);
  const entries = await Promise.all(
    jsonFilePaths.map(async (filePath) => {
      const id = getJsonFileId(filePath);
      const source = await readJsonFileWithSchema(
        filePath,
        workItemSourceSchema,
        `works/items/${path.relative(WORKS_ITEMS_DIRECTORY, filePath)}`,
      );
      return { id, source };
    }),
  );

  return entries.reduce((acc, entry) => {
    if (acc.has(entry.id)) {
      throw new Error(`Duplicate work id: ${entry.id}`);
    }
    acc.set(entry.id, entry.source);
    return acc;
  }, new Map<string, WorkItemSource>());
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
  const entries = await Promise.all(
    Array.from(sourcesById.entries()).map(async ([id, source]) => {
      const enriched = await enrichLinkedItemImage(source);
      return [
        id,
        {
          title: enriched.title,
          date: enriched.date,
          tags: enriched.tags,
          image: enriched.image,
        } satisfies WorkCardSummary,
      ] as const;
    }),
  );

  return new Map(entries);
}

export async function getWorkImagesById(): Promise<Map<string, string>> {
  const summariesById = await getWorkCardSummariesById();
  return new Map(Array.from(summariesById.entries(), ([id, summary]) => [id, summary.image]));
}

async function loadWorkItemsById(): Promise<Map<string, WorkItem>> {
  const sourcesById = await loadWorkItemSourcesById();
  const entries = await Promise.all(
    Array.from(sourcesById.entries()).map(async ([id, source]) => {
      const enriched = await enrichLinkedItemImage(source);
      const articleLinks = enriched.articles.map((articleUrl) => articleUrl.trim()).filter(hasText);
      const articles = await Promise.all(
        articleLinks.map(async (articleUrl) => ({
          title: await fetchArticleTitle(articleUrl),
          link: articleUrl,
        })),
      );

      return [
        id,
        {
          id,
          ...enriched,
          articles,
        } satisfies WorkItem,
      ] as const;
    }),
  );

  return new Map(entries);
}

export async function getAllWorks(): Promise<{
  allWorks: WorkItem[];
  featuredWorks: WorkItem[];
  allWorksByYear: WorksYearGroup[];
}> {
  const [worksIndex, itemsById] = await Promise.all([loadWorksIndex(), loadWorkItemsById()]);
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
