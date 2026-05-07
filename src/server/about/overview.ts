import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AboutOverview, AboutTechStackGroup } from "@/types/about";

const ABOUT_DIRECTORY = path.join(process.cwd(), "src", "content", "about");
const ABOUT_OVERVIEW_FILE = path.join(ABOUT_DIRECTORY, "overview.json");

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isAboutTechStackGroup(value: unknown): value is AboutTechStackGroup {
  if (typeof value !== "object" || value === null) return false;
  const stackGroup = value as Record<string, unknown>;
  return typeof stackGroup.category === "string" && isStringArray(stackGroup.items);
}

function isAboutOverview(value: unknown): value is AboutOverview {
  if (typeof value !== "object" || value === null) return false;
  const overview = value as Record<string, unknown>;
  const profile = overview.profile;
  const contact = overview.contact;

  if (typeof profile !== "object" || profile === null) return false;
  if (typeof contact !== "object" || contact === null) return false;
  const profileObject = profile as Record<string, unknown>;
  const contactObject = contact as Record<string, unknown>;

  return (
    typeof profileObject.name === "string" &&
    typeof profileObject.id === "string" &&
    isStringArray(overview.affiliations) &&
    typeof contactObject.email === "string" &&
    typeof contactObject.name === "string" &&
    typeof overview.shortIntroduction === "string" &&
    typeof overview.introduction === "string" &&
    typeof overview.philosophy === "string" &&
    Array.isArray(overview.techStackGroups) &&
    overview.techStackGroups.every(isAboutTechStackGroup)
  );
}

export async function getAboutOverview(): Promise<AboutOverview> {
  const fileContent = await readFile(ABOUT_OVERVIEW_FILE, "utf-8");
  const parsed = JSON.parse(fileContent) as unknown;

  if (!isAboutOverview(parsed)) {
    throw new Error("Invalid about overview JSON: overview.json");
  }

  return parsed;
}
