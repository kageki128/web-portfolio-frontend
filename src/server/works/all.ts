import { z } from "zod";
import senirenol from "@/content/works/items/2020/senirenol.json";
import senirenolChronicle from "@/content/works/items/2023/senirenol-chronicle.json";
import aviutlWorkshop from "@/content/works/items/2024/aviutl-workshop.json";
import scienceTechnocrasy from "@/content/works/items/2024/science-technocrasy.json";
import senirenolRestart from "@/content/works/items/2024/senirenol-restart.json";
import bioenceTokyo from "@/content/works/items/2025/bioence-tokyo.json";
import flavorfulVision from "@/content/works/items/2025/flavorful-vision.json";
import homeServer from "@/content/works/items/2025/home-server.json";
import senirenolBloom from "@/content/works/items/2025/senirenol-bloom.json";
import takiPlazaIntroduction from "@/content/works/items/2025/taki-plaza-introduction.json";
import twinStarsMythology from "@/content/works/items/2025/twin-stars-mythology.json";
import uraUnityWorkshop from "@/content/works/items/2025/ura-unity-workshop.json";
import youAnd from "@/content/works/items/2025/you-and.json";
import madeInTrap from "@/content/works/items/2026/made-in-trap.json";
import otogeRush from "@/content/works/items/2026/otoge-rush.json";
import unityDesignWorkshop from "@/content/works/items/2026/unity-design-workshop.json";
import unitySingleSceneTemplate from "@/content/works/items/2026/unity-single-scene-template.json";
import uraakaManagement from "@/content/works/items/2026/uraaka-management.json";
import webPortfolioFrontend from "@/content/works/items/2026/web-portfolio-frontend.json";
import worksIndex from "@/content/works/index.json";
import { hasText } from "@/lib/text";
import { parseJsonWithSchema } from "@/server/shared/content";
import type { WorkItem, WorksIndex, WorksYearGroup, WorksYearSection } from "@/types/works";

type WorkLookupContext = "featuredIds" | "yearSections";
type WorkItemSource = Omit<WorkItem, "id" | "articles"> & {
  articles: string[];
};
export type WorkCardSummary = Pick<WorkItem, "title" | "date" | "tags" | "image" | "link">;

const workItemEntries = [
  ["senirenol", senirenol],
  ["senirenol-chronicle", senirenolChronicle],
  ["aviutl-workshop", aviutlWorkshop],
  ["science-technocrasy", scienceTechnocrasy],
  ["senirenol-restart", senirenolRestart],
  ["bioence-tokyo", bioenceTokyo],
  ["flavorful-vision", flavorfulVision],
  ["home-server", homeServer],
  ["senirenol-bloom", senirenolBloom],
  ["taki-plaza-introduction", takiPlazaIntroduction],
  ["twin-stars-mythology", twinStarsMythology],
  ["ura-unity-workshop", uraUnityWorkshop],
  ["you-and", youAnd],
  ["made-in-trap", madeInTrap],
  ["otoge-rush", otogeRush],
  ["unity-design-workshop", unityDesignWorkshop],
  ["unity-single-scene-template", unitySingleSceneTemplate],
  ["uraaka-management", uraakaManagement],
  ["web-portfolio-frontend", webPortfolioFrontend],
] as const;

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

async function loadWorkItemsById(): Promise<Map<string, WorkItem>> {
  const sourcesById = await loadWorkItemSourcesById();
  const entries = Array.from(sourcesById.entries()).map(([id, source]) => {
    const articleLinks = source.articles.map((articleUrl) => articleUrl.trim()).filter(hasText);
    const articles = articleLinks.map((articleUrl) => ({
      title: MANUAL_WORK_ARTICLE_TITLE_BY_LINK[articleUrl] ?? articleUrl,
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
