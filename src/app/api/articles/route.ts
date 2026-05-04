import { NextResponse } from "next/server";
import { getAllArticles } from "@/server/articles/all";

export async function GET() {
  const articles = await getAllArticles();
  return NextResponse.json(articles);
}
