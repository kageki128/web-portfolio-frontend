import { ABOUT_ACTIVITY_ACCENT_COLORS } from "@/constants/colors";
import { aboutActivities, type AboutActivitySource } from "@/content/about/activities";
import { hasText } from "@/lib/text";
import { getWorkCardSummariesById } from "@/server/works/all";
import type { AboutActivity, AboutActivityWork } from "@/types/about";

function assertUniqueTitles(activities: readonly AboutActivitySource[]) {
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
  assertUniqueTitles(aboutActivities);

  const shouldResolveWork = aboutActivities.some((activity) => hasText(activity.workId ?? ""));
  const workCardSummariesById = shouldResolveWork ? await getWorkCardSummariesById() : null;

  return aboutActivities.map((activity) => {
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
        link: workSummary.link,
      },
    );
  });
}
