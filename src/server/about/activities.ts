import { readFile } from "node:fs/promises";
import path from "node:path";
import { ABOUT_ACTIVITY_ACCENT_COLORS } from "@/constants/colors";
import { getWorkImagesById } from "@/server/works/all";
import type { AboutActivity } from "@/types/about";

const ABOUT_DIRECTORY = path.join(process.cwd(), "src", "content", "about");
const ABOUT_ACTIVITIES_FILE = path.join(ABOUT_DIRECTORY, "activities.json");

type AboutActivityAccentColorId = keyof typeof ABOUT_ACTIVITY_ACCENT_COLORS;
type AboutActivitySource = Omit<AboutActivity, "accentColor"> & {
  accentColorId: AboutActivityAccentColorId;
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
  workId?: string,
): AboutActivity {
  return {
    title: activity.title,
    description: activity.description,
    imageUrl,
    accentColor: ABOUT_ACTIVITY_ACCENT_COLORS[activity.accentColorId],
    ...(workId ? { workId } : {}),
  };
}

export async function getAboutActivities(): Promise<AboutActivity[]> {
  const fileContent = await readFile(ABOUT_ACTIVITIES_FILE, "utf-8");
  const parsed = JSON.parse(fileContent) as unknown;

  if (!Array.isArray(parsed) || !parsed.every(isAboutActivitySource)) {
    throw new Error("Invalid about activities JSON: activities.json");
  }

  assertUniqueTitles(parsed);

  const shouldResolveWorkImages = parsed.some((activity) => hasText(activity.workId ?? ""));
  const workImagesById = shouldResolveWorkImages ? await getWorkImagesById() : null;

  return parsed.map((activity) => {
    const workId = activity.workId?.trim() ?? "";
    if (!hasText(workId)) {
      return toAboutActivity(activity, activity.imageUrl);
    }

    const workImage = workImagesById?.get(workId);
    if (workImage === undefined) {
      throw new Error(`Unknown work id in about activities: ${workId}`);
    }

    return toAboutActivity(activity, hasText(workImage) ? workImage : activity.imageUrl, workId);
  });
}
