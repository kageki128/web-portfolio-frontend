import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { InterestCategory, InterestIconKey, InterestItem } from "@/types/interests";
import { fetchOgpImage } from "@/server/articles/shared";

const INTERESTS_DIRECTORY = path.join(process.cwd(), "src", "data", "interests");
const INTERESTS_ITEMS_DIRECTORY = path.join(INTERESTS_DIRECTORY, "items");
const INTERESTS_CATEGORY_FILE = path.join(INTERESTS_DIRECTORY, "category.json");
const INTEREST_ICON_KEYS = ["games", "music", "video", "books", "others"] as const;

type InterestCategoryOrder = {
  category: string;
  iconKey: InterestIconKey;
  itemIds: string[];
};

function isHttpUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function isInterestIconKey(value: unknown): value is InterestIconKey {
  return (
    typeof value === "string" &&
    INTEREST_ICON_KEYS.some((iconKey) => iconKey === value)
  );
}

function isInterestItem(value: unknown): value is InterestItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.image === "string" &&
    typeof item.link === "string" &&
    typeof item.desc === "string"
  );
}

function isInterestCategoryOrder(value: unknown): value is InterestCategoryOrder {
  if (typeof value !== "object" || value === null) return false;
  const category = value as Record<string, unknown>;
  return (
    typeof category.category === "string" &&
    isInterestIconKey(category.iconKey) &&
    Array.isArray(category.itemIds) &&
    category.itemIds.every((itemId) => typeof itemId === "string")
  );
}

async function loadInterestCategoryOrder(): Promise<InterestCategoryOrder[]> {
  const fileContent = await readFile(INTERESTS_CATEGORY_FILE, "utf-8");
  const parsed = JSON.parse(fileContent) as unknown;
  if (!Array.isArray(parsed) || !parsed.every(isInterestCategoryOrder)) {
    throw new Error("Invalid interest category JSON: category.json");
  }
  return parsed;
}

async function loadInterestItemsById(): Promise<Record<string, InterestItem>> {
  const entries = await readdir(INTERESTS_ITEMS_DIRECTORY, { withFileTypes: true });
  const jsonFileNames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);

  const items = await Promise.all(
    jsonFileNames.map(async (fileName) => {
      const filePath = path.join(INTERESTS_ITEMS_DIRECTORY, fileName);
      const fileContent = await readFile(filePath, "utf-8");
      const parsed = JSON.parse(fileContent) as unknown;
      if (!isInterestItem(parsed)) {
        throw new Error(`Invalid interest JSON: ${fileName}`);
      }
      return parsed;
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

function resolveImageUrl(imageUrl: string, pageUrl: string) {
  try {
    return new URL(imageUrl, pageUrl).toString();
  } catch {
    return "";
  }
}

async function enrichItemImage(item: InterestItem): Promise<InterestItem> {
  if (item.image.trim().length > 0) return item;

  const link = item.link.trim();
  if (!isHttpUrl(link)) return item;

  const ogpImage = await fetchOgpImage(link);
  if (!ogpImage) return item;

  const resolvedImage = resolveImageUrl(ogpImage, link);
  if (!resolvedImage) return item;

  return {
    ...item,
    image: resolvedImage,
  };
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
