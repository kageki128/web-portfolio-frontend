import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { InterestCategory, InterestItem } from "@/types/interests";
import {
  fetchResolvedOgpImage,
  getYouTubeThumbnailUrl,
  isHttpUrl,
} from "@/server/thumbnail/shared";

const INTERESTS_DIRECTORY = path.join(process.cwd(), "src", "content", "interests");
const INTERESTS_ITEMS_DIRECTORY = path.join(INTERESTS_DIRECTORY, "items");
const INTERESTS_CATEGORY_FILE = path.join(INTERESTS_DIRECTORY, "category.json");
const OGP_REFRESH_INTERVAL_MS = 1000 * 60 * 30;
const OGP_FETCH_WAIT_MS = 350;

type InterestCategoryOrder = {
  category: string;
  iconId: string;
  itemIds: string[];
};

type OgpCacheEntry = {
  image: string;
  updatedAt: number;
  refreshing?: Promise<string>;
};

const ogpImageCache = new Map<string, OgpCacheEntry>();

function isInterestItem(value: unknown): value is InterestItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
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

function isCacheFresh(entry: OgpCacheEntry) {
  return Date.now() - entry.updatedAt < OGP_REFRESH_INTERVAL_MS;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function refreshOgpCache(url: string) {
  const cached = ogpImageCache.get(url);
  if (cached?.refreshing) return cached.refreshing;

  const refreshing = (async () => {
    const resolvedImage = await fetchResolvedOgpImage(url);
    ogpImageCache.set(url, {
      image: resolvedImage,
      updatedAt: Date.now(),
    });
    return resolvedImage;
  })().finally(() => {
    const latest = ogpImageCache.get(url);
    if (latest) {
      delete latest.refreshing;
      ogpImageCache.set(url, latest);
    }
  });

  ogpImageCache.set(url, {
    image: cached?.image ?? "",
    updatedAt: cached?.updatedAt ?? 0,
    refreshing,
  });

  return refreshing;
}

async function resolveInterestImage(link: string) {
  const cached = ogpImageCache.get(link);
  if (cached?.image && isCacheFresh(cached)) return cached.image;

  const refreshTask = refreshOgpCache(link);

  if (cached?.image) {
    return cached.image;
  }

  const resolved = await Promise.race([
    refreshTask,
    wait(OGP_FETCH_WAIT_MS).then(() => ""),
  ]);

  return resolved;
}

async function enrichItemImage(item: InterestItem): Promise<InterestItem> {
  if (item.image.trim().length > 0) return item;

  const link = item.link.trim();
  if (!isHttpUrl(link)) return item;

  const youtubeThumbnail = getYouTubeThumbnailUrl(link);
  if (youtubeThumbnail) {
    return {
      ...item,
      image: youtubeThumbnail,
    };
  }

  const resolvedImage = await resolveInterestImage(link);
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
