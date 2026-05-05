import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { InterestCategory, InterestItem } from "@/types/interests";
import { enrichLinkedItemImage } from "@/server/thumbnail/shared";

const INTERESTS_DIRECTORY = path.join(process.cwd(), "src", "content", "interests");
const INTERESTS_ITEMS_DIRECTORY = path.join(INTERESTS_DIRECTORY, "items");
const INTERESTS_INDEX_FILE = path.join(INTERESTS_DIRECTORY, "index.json");

type InterestCategoryOrder = {
  category: string;
  iconId: string;
  itemIds: string[];
};

type InterestItemSource = Omit<InterestItem, "id">;

function isInterestItemSource(value: unknown): value is InterestItemSource {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.name === "string" &&
    typeof item.image === "string" &&
    typeof item.link === "string"
  );
}

function isInterestCategoryOrder(value: unknown): value is InterestCategoryOrder {
  if (typeof value !== "object" || value === null) return false;
  const category = value as Record<string, unknown>;
  return (
    typeof category.category === "string" &&
    typeof category.iconId === "string" &&
    category.iconId.trim().length > 0 &&
    Array.isArray(category.itemIds) &&
    category.itemIds.every((itemId) => typeof itemId === "string")
  );
}

async function loadInterestCategoryOrder(): Promise<InterestCategoryOrder[]> {
  const fileContent = await readFile(INTERESTS_INDEX_FILE, "utf-8");
  const parsed = JSON.parse(fileContent) as unknown;
  if (!Array.isArray(parsed) || !parsed.every(isInterestCategoryOrder)) {
    throw new Error("Invalid interest category JSON: index.json");
  }
  return parsed;
}

async function loadInterestItemsById(): Promise<Record<string, InterestItem>> {
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

  const jsonFilePaths = await collectJsonFilePaths(INTERESTS_ITEMS_DIRECTORY);

  const items = await Promise.all(
    jsonFilePaths.map(async (filePath) => {
      const fileName = path.basename(filePath);
      const id = fileName.replace(/\.json$/, "");
      if (!id) {
        throw new Error(`Invalid interest file name: ${fileName}`);
      }

      const fileContent = await readFile(filePath, "utf-8");
      const parsed = JSON.parse(fileContent) as unknown;
      if (!isInterestItemSource(parsed)) {
        throw new Error(`Invalid interest JSON: ${fileName}`);
      }

      return {
        id,
        ...parsed,
      } satisfies InterestItem;
    }),
  );

  return items.reduce<Record<string, InterestItem>>((acc, item) => {
    if (acc[item.id]) {
      throw new Error(`Duplicate interest id: ${item.id}`);
    }
    acc[item.id] = item;
    return acc;
  }, {});
}

async function enrichItemImage(item: InterestItem): Promise<InterestItem> {
  return enrichLinkedItemImage(item);
}

export async function getAllInterests(): Promise<InterestCategory[]> {
  const categoryOrder = await loadInterestCategoryOrder();
  const itemsById = await loadInterestItemsById();

  return Promise.all(
    categoryOrder.map(async ({ itemIds, ...category }) => {
      const items = itemIds.map((itemId) => {
        const item = itemsById[itemId];
        if (!item) {
          throw new Error(`Unknown interest id: ${itemId}`);
        }
        return item;
      });

      return {
        ...category,
        items: await Promise.all(items.map(enrichItemImage)),
      };
    }),
  );
}
