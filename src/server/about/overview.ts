import { aboutOverview } from "@/content/about/overview";
import type { AboutOverview } from "@/types/about";

export async function getAboutOverview(): Promise<AboutOverview> {
  return aboutOverview;
}
