import { z } from "zod";
import overview from "@/content/about/overview.json";
import { parseJsonWithSchema } from "@/server/shared/content";
import type { AboutOverview } from "@/types/about";

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
  return parseJsonWithSchema(overview, aboutOverviewSchema, "about/overview.json");
}
