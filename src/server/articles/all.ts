import { getBlogArticles } from "@/server/articles/blog";
import { fetchQiitaArticles } from "@/server/articles/qiita";
import { fetchTraPArticles } from "@/server/articles/trap";
import { fetchZennArticles } from "@/server/articles/zenn";

export async function getAllArticles() {
  const blog = await getBlogArticles();
  const [qiita, zenn, trap] = await Promise.allSettled([
    fetchQiitaArticles(),
    fetchZennArticles(),
    fetchTraPArticles(),
  ]);

  return [
    ...blog,
    ...(qiita.status === "fulfilled" ? qiita.value : []),
    ...(zenn.status === "fulfilled" ? zenn.value : []),
    ...(trap.status === "fulfilled" ? trap.value : []),
  ].sort((a, b) => b.publishedAt - a.publishedAt);
}
