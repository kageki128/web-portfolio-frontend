import ArticlesPage from "@/components/site/pages/ArticlesPage";
import { getAllArticles } from "@/server/articles/all";

export default async function Page() {
  const articles = await getAllArticles();
  return <ArticlesPage articles={articles} />;
}
