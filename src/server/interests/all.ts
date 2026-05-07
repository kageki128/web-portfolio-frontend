import path from "node:path";
import { z } from "zod";
import { enrichLinkedItemImage } from "@/server/thumbnail/shared";
import {
  collectJsonFilePaths,
  getJsonFileId,
  readJsonFileWithSchema,
} from "@/server/shared/content";
import type { InterestCategory, InterestItem } from "@/types/interests";

const INTERESTS_DIRECTORY = path.join(process.cwd(), "src", "content", "interests");
const INTERESTS_ITEMS_DIRECTORY = path.join(INTERESTS_DIRECTORY, "items");
const INTERESTS_INDEX_FILE = path.join(INTERESTS_DIRECTORY, "index.json");

type InterestCategoryOrder = {
  category: string;
  iconId: string;
  itemIds: string[];
};

type InterestItemSource = Omit<InterestItem, "id">;

const interestItemSourceSchema: z.ZodType<InterestItemSource> = z.object({
  name: z.string(),
  image: z.string(),
  link: z.string(),
});

const interestCategoryOrderSchema: z.ZodType<InterestCategoryOrder> = z.object({
  category: z.string(),
  iconId: z.string().trim().min(1),
  itemIds: z.array(z.string()),
});

const interestCategoryOrderListSchema = z.array(interestCategoryOrderSchema);

async function loadInterestCategoryOrder(): Promise<InterestCategoryOrder[]> {
  return readJsonFileWithSchema(
    INTERESTS_INDEX_FILE,
    interestCategoryOrderListSchema,
    "interests/index.json",
  );
}

async function loadInterestItemsById(): Promise<Map<string, InterestItem>> {
  const jsonFilePaths = await collectJsonFilePaths(INTERESTS_ITEMS_DIRECTORY);
  const items = await Promise.all(
    jsonFilePaths.map(async (filePath) => {
      const id = getJsonFileId(filePath);
      const source = await readJsonFileWithSchema(
        filePath,
        interestItemSourceSchema,
        `interests/items/${path.relative(INTERESTS_ITEMS_DIRECTORY, filePath)}`,
      );
      return {
        id,
        ...source,
      } satisfies InterestItem;
    }),
  );

  return items.reduce((acc, item) => {
    if (acc.has(item.id)) {
      throw new Error(`Duplicate interest id: ${item.id}`);
    }
    acc.set(item.id, item);
    return acc;
  }, new Map<string, InterestItem>());
}

export async function getAllInterests(): Promise<InterestCategory[]> {
  const categoryOrder = await loadInterestCategoryOrder();
  const itemsById = await loadInterestItemsById();

  return Promise.all(
    categoryOrder.map(async ({ itemIds, ...category }) => {
      const items = itemIds.map((itemId) => {
        const item = itemsById.get(itemId);
        if (!item) {
          throw new Error(`Unknown interest id: ${itemId}`);
        }
        return item;
      });

      return {
        ...category,
        items: await Promise.all(items.map((item) => enrichLinkedItemImage(item))),
      };
    }),
  );
}
