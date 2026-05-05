import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AboutActivity } from "@/types/about";

const ABOUT_DIRECTORY = path.join(process.cwd(), "src", "content", "about");
const ABOUT_ACTIVITIES_FILE = path.join(ABOUT_DIRECTORY, "activities.json");

function isAboutActivity(value: unknown): value is AboutActivity {
  if (typeof value !== "object" || value === null) return false;
  const activity = value as Record<string, unknown>;

  return (
    typeof activity.title === "string" &&
    typeof activity.description === "string" &&
    typeof activity.imageUrl === "string" &&
    typeof activity.accentColor === "string"
  );
}

function assertUniqueTitles(activities: AboutActivity[]) {
  const seenTitles = new Set<string>();

  activities.forEach(({ title }) => {
    if (seenTitles.has(title)) {
      throw new Error(`Duplicate activity title: ${title}`);
    }
    seenTitles.add(title);
  });
}

export async function getAboutActivities(): Promise<AboutActivity[]> {
  const fileContent = await readFile(ABOUT_ACTIVITIES_FILE, "utf-8");
  const parsed = JSON.parse(fileContent) as unknown;

  if (!Array.isArray(parsed) || !parsed.every(isAboutActivity)) {
    throw new Error("Invalid about activities JSON: activities.json");
  }

  assertUniqueTitles(parsed);
  return parsed;
}
