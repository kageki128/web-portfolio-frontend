import { z } from "zod";
import { interestItemEntries } from "@/content/interests/generated";
import interestCategoryOrder from "@/content/interests/index.json";
import { parseJsonWithSchema } from "@/server/shared/content";
import type { InterestCategory, InterestItem } from "@/types/interests";

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
  return parseJsonWithSchema(
    interestCategoryOrder,
    interestCategoryOrderListSchema,
    "interests/index.json",
  );
}

async function loadInterestItemsById(): Promise<Map<string, InterestItem>> {
  const items = interestItemEntries.map(([id, source]) => ({
    id,
    ...parseJsonWithSchema(source, interestItemSourceSchema, `interests/items/${id}.json`),
  }) satisfies InterestItem);

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

  return categoryOrder.map(({ itemIds, ...category }) => {
    const items = itemIds.map((itemId) => {
      const item = itemsById.get(itemId);
      if (!item) {
        throw new Error(`Unknown interest id: ${itemId}`);
      }
      return item;
    });

    return {
      ...category,
      items,
    };
  });
}
