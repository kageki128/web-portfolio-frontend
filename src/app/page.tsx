import HomePage from "@/components/site/pages/HomePage";
import { hasText } from "@/lib/text";
import { getAllArticles } from "@/server/articles/all";
import { getAboutOverview } from "@/server/about/overview";
import { getAllWorks } from "@/server/works/all";

const HOME_LATEST_ARTICLE_LIMIT = 6;

export default async function Page() {
  const [works, articles, overview] = await Promise.all([
    getAllWorks(),
    getAllArticles(),
    getAboutOverview(),
  ]);
  const heroPreviewSources = works.allWorksByYear
    .flatMap((yearGroup) => yearGroup.items)
    .map((work) => work.preview.trim())
    .filter(hasText);

  return (
    <HomePage
      heroPreviewSources={heroPreviewSources}
      heroProfileName={overview.profile.name}
      heroProfileId={overview.profile.id}
      heroIntroduction={overview.shortIntroduction}
      featuredWorks={works.featuredWorks}
      latestArticles={articles.slice(0, HOME_LATEST_ARTICLE_LIMIT)}
    />
  );
}
