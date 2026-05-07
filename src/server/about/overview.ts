import path from "node:path";
import { z } from "zod";
import { readJsonFileWithSchema } from "@/server/shared/content";
import type { AboutOverview } from "@/types/about";

const ABOUT_DIRECTORY = path.join(process.cwd(), "src", "content", "about");
const ABOUT_OVERVIEW_FILE = path.join(ABOUT_DIRECTORY, "overview.json");

const aboutOverviewSchema: z.ZodType<AboutOverview> = z.object({
  profile: z.object({
    name: z.string(),
    id: z.string(),
  }),
  affiliations: z.array(z.string()),
  contact: z.object({
    email: z.string(),
    name: z.string(),
  }),
  shortIntroduction: z.string(),
  introduction: z.string(),
  philosophy: z.string(),
  techStackGroups: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.string()),
    }),
  ),
});

export async function getAboutOverview(): Promise<AboutOverview> {
  return readJsonFileWithSchema(
    ABOUT_OVERVIEW_FILE,
    aboutOverviewSchema,
    "about/overview.json",
  );
}
