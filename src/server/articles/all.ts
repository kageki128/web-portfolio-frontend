import { getBlogArticles } from "@/server/articles/blog";
import { fetchQiitaArticles } from "@/server/articles/qiita";
import { fetchTraPArticles } from "@/server/articles/trap";
import { fetchZennArticles } from "@/server/articles/zenn";

export async function getAllArticles() {
  const providers = [
    { name: "Qiita", request: fetchQiitaArticles() },
    { name: "Zenn", request: fetchZennArticles() },
    { name: "traP", request: fetchTraPArticles() },
  ] as const;
  const [blog, providerResults] = await Promise.all([
    getBlogArticles(),
    Promise.allSettled(providers.map((provider) => provider.request)),
  ]);
  const externalArticles = providerResults.flatMap((result, index) => {
    if (result.status === "fulfilled") return result.value;

    console.error(`[articles] Failed to fetch ${providers[index].name} articles`, result.reason);
    return [];
  });

  return [...blog, ...externalArticles].sort((a, b) => b.publishedAt - a.publishedAt);
}
