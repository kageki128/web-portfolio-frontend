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
  const featuredWorks = works.featuredWorks.map((work) => ({
    id: work.id,
    title: work.title,
    date: work.date,
    tags: work.tags,
    image: work.image,
  }));
  const latestArticles = articles.slice(0, HOME_LATEST_ARTICLE_LIMIT).map((article) => ({
    id: article.id,
    title: article.title,
    platform: article.platform,
    image: article.image,
    date: article.date,
    link: article.link,
  }));

  return (
    <HomePage
      heroPreviewSources={heroPreviewSources}
      heroProfileName={overview.profile.name}
      heroProfileId={overview.profile.id}
      heroIntroduction={overview.shortIntroduction}
      featuredWorks={featuredWorks}
      latestArticles={latestArticles}
    />
  );
}
