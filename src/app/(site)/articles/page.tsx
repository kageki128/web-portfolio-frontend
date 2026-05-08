import ArticlesPage from "@/components/site/pages/ArticlesPage";
import { getAllArticles } from "@/server/articles/all";

export const revalidate = 1800;

export default async function Page() {
  const articles = await getAllArticles();
  return <ArticlesPage articles={articles} />;
}
