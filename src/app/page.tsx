import HomePage from "@/components/site/pages/HomePage";
import { getAllArticles } from "@/server/articles/all";
import { getAllWorks } from "@/server/works/all";

const HOME_LATEST_ARTICLE_LIMIT = 6;

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

export default async function Page() {
  const [works, articles] = await Promise.all([getAllWorks(), getAllArticles()]);
  const heroPreviewSources = works.allWorks
    .map((work) => work.preview.trim())
    .filter(hasText);

  return (
    <HomePage
      heroPreviewSources={heroPreviewSources}
      featuredWorks={works.featuredWorks}
      latestArticles={articles.slice(0, HOME_LATEST_ARTICLE_LIMIT)}
    />
  );
}
