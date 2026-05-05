import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { WorkItem, WorksIndex, WorksYearGroup, WorksYearSection } from "@/types/works";

const WORKS_DIRECTORY = path.join(process.cwd(), "src", "content", "works");
const WORKS_ITEMS_DIRECTORY = path.join(WORKS_DIRECTORY, "items");
const WORKS_INDEX_FILE = path.join(WORKS_DIRECTORY, "index.json");

type WorkLookupContext = "featuredIds" | "yearSections";
type WorkItemSource = Omit<WorkItem, "id">;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isWorkItemSource(value: unknown): value is WorkItemSource {
  if (typeof value !== "object" || value === null) return false;
  const work = value as Record<string, unknown>;

  return (
    typeof work.title === "string" &&
    typeof work.date === "string" &&
    isStringArray(work.tags) &&
    typeof work.image === "string" &&
    typeof work.desc === "string" &&
    typeof work.members === "string" &&
    typeof work.roll === "string" &&
    typeof work.tech === "string" &&
    typeof work.duration === "string" &&
    typeof work.link === "string" &&
    isStringArray(work.articles)
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
  const collectJsonFilePaths = async (directoryPath: string): Promise<string[]> => {
    const entries = await readdir(directoryPath, { withFileTypes: true });
    const nestedFileLists = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(directoryPath, entry.name);
        if (entry.isDirectory()) {
          return collectJsonFilePaths(entryPath);
        }
        if (entry.isFile() && entry.name.endsWith(".json")) {
          return [entryPath];
        }
        return [];
      }),
    );
    return nestedFileLists.flat();
  };

  const jsonFilePaths = await collectJsonFilePaths(WORKS_ITEMS_DIRECTORY);

  const items = await Promise.all(
    jsonFilePaths.map(async (filePath) => {
      const fileName = path.basename(filePath);
      const id = fileName.replace(/\.json$/, "");
      if (!id) {
        throw new Error(`Invalid work file name: ${fileName}`);
      }

      const fileContent = await readFile(filePath, "utf-8");
      const parsed = JSON.parse(fileContent) as unknown;
      if (!isWorkItemSource(parsed)) {
        throw new Error(`Invalid work JSON: ${fileName}`);
      }

      return {
        id,
        ...parsed,
      } satisfies WorkItem;
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
