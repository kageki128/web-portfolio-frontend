import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { WorkItem, WorkRelatedArticle, WorksIndex, WorksYearGroup, WorksYearSection } from "@/types/works";

const WORKS_DIRECTORY = path.join(process.cwd(), "src", "content", "works");
const WORKS_ITEMS_DIRECTORY = path.join(WORKS_DIRECTORY, "items");
const WORKS_INDEX_FILE = path.join(WORKS_DIRECTORY, "index.json");

type WorkLookupContext = "featuredIds" | "yearSections";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isWorkRelatedArticle(value: unknown): value is WorkRelatedArticle {
  if (typeof value !== "object" || value === null) return false;
  const article = value as Record<string, unknown>;
  return typeof article.title === "string" && typeof article.url === "string";
}

function isWorkItem(value: unknown): value is WorkItem {
  if (typeof value !== "object" || value === null) return false;
  const work = value as Record<string, unknown>;

  return (
    typeof work.id === "string" &&
    typeof work.title === "string" &&
    isStringArray(work.tags) &&
    typeof work.image === "string" &&
    typeof work.date === "string" &&
    typeof work.desc === "string" &&
    typeof work.role === "string" &&
    typeof work.tech === "string" &&
    typeof work.duration === "string" &&
    typeof work.members === "string" &&
    typeof work.link === "string" &&
    typeof work.year === "number" &&
    Number.isInteger(work.year) &&
    Array.isArray(work.relatedArticles) &&
    work.relatedArticles.every(isWorkRelatedArticle)
  );
}

function isWorksYearSection(value: unknown): value is WorksYearSection {
  if (typeof value !== "object" || value === null) return false;
  const section = value as Record<string, unknown>;
  return (
    typeof section.year === "number" &&
    Number.isInteger(section.year) &&
    isStringArray(section.itemIds)
  );
}

function isWorksIndex(value: unknown): value is WorksIndex {
  if (typeof value !== "object" || value === null) return false;
  const index = value as Record<string, unknown>;
  return (
    isStringArray(index.featuredIds) &&
    Array.isArray(index.yearSections) &&
    index.yearSections.every(isWorksYearSection)
  );
}

async function loadWorksIndex(): Promise<WorksIndex> {
  const fileContent = await readFile(WORKS_INDEX_FILE, "utf-8");
  const parsed = JSON.parse(fileContent) as unknown;
  if (!isWorksIndex(parsed)) {
    throw new Error("Invalid works index JSON: index.json");
  }
  return parsed;
}

async function loadWorkItemsById(): Promise<Record<string, WorkItem>> {
  const entries = await readdir(WORKS_ITEMS_DIRECTORY, { withFileTypes: true });
  const jsonFileNames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);

  const items = await Promise.all(
    jsonFileNames.map(async (fileName) => {
      const filePath = path.join(WORKS_ITEMS_DIRECTORY, fileName);
      const fileContent = await readFile(filePath, "utf-8");
      const parsed = JSON.parse(fileContent) as unknown;
      if (!isWorkItem(parsed)) {
        throw new Error(`Invalid work JSON: ${fileName}`);
      }
      return parsed;
    }),
  );

  return items.reduce<Record<string, WorkItem>>((acc, item) => {
    if (acc[item.id]) {
      throw new Error(`Duplicate work id: ${item.id}`);
    }
    acc[item.id] = item;
    return acc;
  }, {});
}

function resolveWorkById(itemsById: Record<string, WorkItem>, itemId: string, context: WorkLookupContext): WorkItem {
  const item = itemsById[itemId];
  if (!item) {
    throw new Error(`Unknown work id in ${context}: ${itemId}`);
  }
  return item;
}

export async function getAllWorks(): Promise<{
  featuredWorks: WorkItem[];
  allWorksByYear: WorksYearGroup[];
}> {
  const worksIndex = await loadWorksIndex();
  const itemsById = await loadWorkItemsById();

  const featuredWorks = worksIndex.featuredIds.map((itemId) =>
    resolveWorkById(itemsById, itemId, "featuredIds"),
  );

  const allWorksByYear = worksIndex.yearSections.map(({ year, itemIds }) => ({
    year,
    items: itemIds.map((itemId) => resolveWorkById(itemsById, itemId, "yearSections")),
  }));

  return {
    featuredWorks,
    allWorksByYear,
  };
}
