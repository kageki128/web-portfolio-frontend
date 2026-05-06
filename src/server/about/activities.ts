import { readFile } from "node:fs/promises";
import path from "node:path";
import { ABOUT_ACTIVITY_ACCENT_COLORS } from "@/constants/colors";
import { getWorkCardSummariesById } from "@/server/works/all";
import type { AboutActivity, AboutActivityWork } from "@/types/about";

const ABOUT_DIRECTORY = path.join(process.cwd(), "src", "content", "about");
const ABOUT_ACTIVITIES_FILE = path.join(ABOUT_DIRECTORY, "activities.json");

type AboutActivityAccentColorId = keyof typeof ABOUT_ACTIVITY_ACCENT_COLORS;
type AboutActivitySource = {
  title: string;
  description: string;
  imageUrl: string;
  accentColorId: AboutActivityAccentColorId;
  workId?: string;
};

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function isAboutActivityAccentColorId(value: unknown): value is AboutActivityAccentColorId {
  return typeof value === "string" && value in ABOUT_ACTIVITY_ACCENT_COLORS;
}

function isAboutActivitySource(value: unknown): value is AboutActivitySource {
  if (typeof value !== "object" || value === null) return false;
  const activity = value as Record<string, unknown>;

  return (
    typeof activity.title === "string" &&
    typeof activity.description === "string" &&
    typeof activity.imageUrl === "string" &&
    isAboutActivityAccentColorId(activity.accentColorId) &&
    (activity.workId === undefined || typeof activity.workId === "string")
  );
}

function assertUniqueTitles(activities: AboutActivitySource[]) {
  const seenTitles = new Set<string>();

  activities.forEach(({ title }) => {
    if (seenTitles.has(title)) {
      throw new Error(`Duplicate activity title: ${title}`);
    }
    seenTitles.add(title);
  });
}

function toAboutActivity(
  activity: AboutActivitySource,
  imageUrl: string,
  work?: AboutActivityWork,
): AboutActivity {
  return {
    title: activity.title,
    description: activity.description,
    imageUrl,
    accentColor: ABOUT_ACTIVITY_ACCENT_COLORS[activity.accentColorId],
    ...(work ? { work } : {}),
  };
}

export async function getAboutActivities(): Promise<AboutActivity[]> {
  const fileContent = await readFile(ABOUT_ACTIVITIES_FILE, "utf-8");
  const parsed = JSON.parse(fileContent) as unknown;

  if (!Array.isArray(parsed) || !parsed.every(isAboutActivitySource)) {
    throw new Error("Invalid about activities JSON: activities.json");
  }

  assertUniqueTitles(parsed);

  const shouldResolveWork = parsed.some((activity) => hasText(activity.workId ?? ""));
  const workCardSummariesById = shouldResolveWork ? await getWorkCardSummariesById() : null;

  return parsed.map((activity) => {
    const workId = activity.workId?.trim() ?? "";
    if (!hasText(workId)) {
      return toAboutActivity(activity, activity.imageUrl);
    }

    const workSummary = workCardSummariesById?.get(workId);
    if (workSummary === undefined) {
      throw new Error(`Unknown work id in about activities: ${workId}`);
    }

    return toAboutActivity(
      activity,
      hasText(workSummary.image) ? workSummary.image : activity.imageUrl,
      {
        id: workId,
        title: workSummary.title,
        date: workSummary.date,
        tags: workSummary.tags,
      },
    );
  });
}
