import { z } from "zod";
import cleanArchitecture from "@/content/interests/items/books/clean-architecture.json";
import hennaIe from "@/content/interests/items/books/henna-ie.json";
import kinki from "@/content/interests/items/books/kinki.json";
import minoDriven from "@/content/interests/items/books/mino-driven.json";
import omaeNoShiin from "@/content/interests/items/books/omae-no-shiin.json";
import ushijimaKun from "@/content/interests/items/books/ushijima-kun.json";
import arcaea from "@/content/interests/items/games/arcaea.json";
import chunithm from "@/content/interests/items/games/chunithm.json";
import ddr from "@/content/interests/items/games/ddr.json";
import genshinImpact from "@/content/interests/items/games/genshin-impact.json";
import maimai from "@/content/interests/items/games/maimai.json";
import minecraft from "@/content/interests/items/games/minecraft.json";
import ongeki from "@/content/interests/items/games/ongeki.json";
import projectSekai from "@/content/interests/items/games/project-sekai.json";
import soundVoltex from "@/content/interests/items/games/sound-voltex.json";
import taikoNoTatsujin from "@/content/interests/items/games/taiko-no-tatsujin.json";
import theBattleCats from "@/content/interests/items/games/the-battle-cats.json";
import awakeNow from "@/content/interests/items/music/awake-now.json";
import devilJanai from "@/content/interests/items/music/devil-janai.json";
import hirame from "@/content/interests/items/music/hirame.json";
import manemane from "@/content/interests/items/music/manemane.json";
import rasutorasu from "@/content/interests/items/music/rasutorasu.json";
import teto31 from "@/content/interests/items/music/teto31.json";
import ultraTrailer from "@/content/interests/items/music/ultra-trailer.json";
import wakaremichi from "@/content/interests/items/music/wakaremichi.json";
import razer from "@/content/interests/items/others/razer.json";
import scp from "@/content/interests/items/others/scp.json";
import attackOfTitan from "@/content/interests/items/video/attack-of-titan.json";
import evangerion from "@/content/interests/items/video/evangerion.json";
import godzillaMinusOne from "@/content/interests/items/video/godzilla-minus-one.json";
import hirogaruSkyPrecure from "@/content/interests/items/video/hirogaru-sky-precure.json";
import kamenRiderBuild from "@/content/interests/items/video/kamen-rider-build.json";
import kamenRiderExAid from "@/content/interests/items/video/kamen-rider-ex-aid.json";
import kamenRiderW from "@/content/interests/items/video/kamen-rider-w.json";
import shinGodzilla from "@/content/interests/items/video/shin-godzilla.json";
import youAndIdolPrecure from "@/content/interests/items/video/you-and-idol-precure.json";
import youAndIdolPrecureMovie from "@/content/interests/items/video/you-and-idol-precure-movie.json";
import interestCategoryOrder from "@/content/interests/index.json";
import { parseJsonWithSchema } from "@/server/shared/content";
import type { InterestCategory, InterestItem } from "@/types/interests";

type InterestCategoryOrder = {
  category: string;
  iconId: string;
  itemIds: string[];
};

type InterestItemSource = Omit<InterestItem, "id">;

const interestItemEntries = [
  ["clean-architecture", cleanArchitecture],
  ["henna-ie", hennaIe],
  ["kinki", kinki],
  ["mino-driven", minoDriven],
  ["omae-no-shiin", omaeNoShiin],
  ["ushijima-kun", ushijimaKun],
  ["arcaea", arcaea],
  ["chunithm", chunithm],
  ["ddr", ddr],
  ["genshin-impact", genshinImpact],
  ["maimai", maimai],
  ["minecraft", minecraft],
  ["ongeki", ongeki],
  ["project-sekai", projectSekai],
  ["sound-voltex", soundVoltex],
  ["taiko-no-tatsujin", taikoNoTatsujin],
  ["the-battle-cats", theBattleCats],
  ["awake-now", awakeNow],
  ["devil-janai", devilJanai],
  ["hirame", hirame],
  ["manemane", manemane],
  ["rasutorasu", rasutorasu],
  ["teto31", teto31],
  ["ultra-trailer", ultraTrailer],
  ["wakaremichi", wakaremichi],
  ["razer", razer],
  ["scp", scp],
  ["attack-of-titan", attackOfTitan],
  ["evangerion", evangerion],
  ["godzilla-minus-one", godzillaMinusOne],
  ["hirogaru-sky-precure", hirogaruSkyPrecure],
  ["kamen-rider-build", kamenRiderBuild],
  ["kamen-rider-ex-aid", kamenRiderExAid],
  ["kamen-rider-w", kamenRiderW],
  ["shin-godzilla", shinGodzilla],
  ["you-and-idol-precure", youAndIdolPrecure],
  ["you-and-idol-precure-movie", youAndIdolPrecureMovie],
] as const;

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
