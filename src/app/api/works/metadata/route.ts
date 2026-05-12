import { NextResponse } from "next/server";
import { hasText } from "@/lib/text";
import { resolveLinkMetadataByUrl } from "@/server/metadata/link";
import { getAllWorks } from "@/server/works/all";

export const dynamic = "force-dynamic";

type WorksMetadataResponse = {
  workImagesById: Record<string, string>;
  articleTitlesByLink: Record<string, string>;
};

export async function GET() {
  const { allWorks } = await getAllWorks();
  const imageLinksByWorkId = new Map<string, string>();
  const articleLinks = new Set<string>();

  for (const work of allWorks) {
    if (!hasText(work.image) && hasText(work.link)) {
      imageLinksByWorkId.set(work.id, work.link);
    }

    for (const article of work.articles) {
      if (hasText(article.link)) {
        articleLinks.add(article.link);
      }
    }
  }

  const [imageMetadataByUrl, articleMetadataByUrl] = await Promise.all([
    resolveLinkMetadataByUrl(imageLinksByWorkId.values(), {
      includeTitle: false,
      includeImage: true,
      timeoutMs: null,
      waitForCompleteImageFetch: true,
    }),
    resolveLinkMetadataByUrl(articleLinks, {
      includeTitle: true,
      includeImage: false,
      timeoutMs: null,
    }),
  ]);

  const workImagesById: Record<string, string> = {};
  for (const [workId, link] of imageLinksByWorkId) {
    workImagesById[workId] = imageMetadataByUrl.get(link)?.image ?? "";
  }

  const articleTitlesByLink: Record<string, string> = {};
  for (const link of articleLinks) {
    articleTitlesByLink[link] = articleMetadataByUrl.get(link)?.title ?? "";
  }

  return NextResponse.json({
    workImagesById,
    articleTitlesByLink,
  } satisfies WorksMetadataResponse);
}
