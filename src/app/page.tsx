import HomePage from "@/components/site/pages/HomePage";
import { getAllArticles } from "@/server/articles/all";
import { getAllWorks } from "@/server/works/all";

const HOME_LATEST_ARTICLE_LIMIT = 6;

export default async function Page() {
  const [works, articles] = await Promise.all([getAllWorks(), getAllArticles()]);

  return (
    <HomePage
      featuredWorks={works.featuredWorks}
      latestArticles={articles.slice(0, HOME_LATEST_ARTICLE_LIMIT)}
    />
  );
}
