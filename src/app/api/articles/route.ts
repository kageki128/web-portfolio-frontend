import { NextResponse } from "next/server";
import { getOwnArticles } from "@/server/articles/own";
import { fetchQiitaArticles } from "@/server/articles/qiita";
import { fetchTraPArticles } from "@/server/articles/trap";
import { fetchZennArticles } from "@/server/articles/zenn";

export async function GET() {
  const [qiita, zenn, trap] = await Promise.allSettled([
    fetchQiitaArticles(),
    fetchZennArticles(),
    fetchTraPArticles(),
  ]);

  const articles = [
    ...getOwnArticles(),
    ...(qiita.status === "fulfilled" ? qiita.value : []),
    ...(zenn.status === "fulfilled" ? zenn.value : []),
    ...(trap.status === "fulfilled" ? trap.value : []),
  ].sort((a, b) => b.publishedAt - a.publishedAt);

  return NextResponse.json(articles);
}
