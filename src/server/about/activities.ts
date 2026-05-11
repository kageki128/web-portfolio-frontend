import { z } from "zod";
import { ABOUT_ACTIVITY_ACCENT_COLORS } from "@/constants/colors";
import activities from "@/content/about/activities.json";
import { hasText } from "@/lib/text";
import { parseJsonWithSchema } from "@/server/shared/content";
import { getWorkCardSummariesById } from "@/server/works/all";
import type { AboutActivity, AboutActivityWork } from "@/types/about";

type AboutActivityAccentColorId = keyof typeof ABOUT_ACTIVITY_ACCENT_COLORS;
type AboutActivitySource = {
  title: string;
  description: string;
  imageUrl: string;
  accentColorId: AboutActivityAccentColorId;
  workId?: string;
};

const ABOUT_ACTIVITY_ACCENT_COLOR_IDS = Object.keys(
  ABOUT_ACTIVITY_ACCENT_COLORS,
) as [AboutActivityAccentColorId, ...AboutActivityAccentColorId[]];

const aboutActivitySourceSchema: z.ZodType<AboutActivitySource> = z.object({
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  accentColorId: z.enum(ABOUT_ACTIVITY_ACCENT_COLOR_IDS),
  workId: z.string().optional(),
});

const aboutActivityListSchema = z.array(aboutActivitySourceSchema);

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
  const parsed = parseJsonWithSchema(
    activities,
    aboutActivityListSchema,
    "about/activities.json",
  );

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
