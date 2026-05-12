import { NextResponse } from "next/server";
import { hasText } from "@/lib/text";
import { getAllInterests } from "@/server/interests/all";
import { resolveLinkMetadata, resolveLinkMetadataByUrl } from "@/server/metadata/link";

export const dynamic = "force-dynamic";

type InterestsMetadataResponse = {
  imagesByInterestId: Record<string, string>;
};

type InterestMetadataByUrlResponse = {
  image: string;
};

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const url = searchParams.get("url")?.trim() ?? "";

  if (hasText(url)) {
    const metadata = await resolveLinkMetadata(url, {
      includeTitle: false,
      includeImage: true,
      timeoutMs: null,
      waitForCompleteImageFetch: true,
    });

    return NextResponse.json({
      image: metadata.image,
    } satisfies InterestMetadataByUrlResponse);
  }

  const interests = await getAllInterests();
  const imageLinksByInterestId = new Map<string, string>();

  for (const category of interests) {
    for (const item of category.items) {
      if (!hasText(item.image) && hasText(item.link)) {
        imageLinksByInterestId.set(item.id, item.link);
      }
    }
  }

  const imageMetadataByUrl = await resolveLinkMetadataByUrl(
    imageLinksByInterestId.values(),
    {
      includeTitle: false,
      includeImage: true,
      timeoutMs: null,
      waitForCompleteImageFetch: true,
    },
  );

  const imagesByInterestId: Record<string, string> = {};
  for (const [interestId, link] of imageLinksByInterestId) {
    imagesByInterestId[interestId] = imageMetadataByUrl.get(link)?.image ?? "";
  }

  return NextResponse.json({ imagesByInterestId } satisfies InterestsMetadataResponse);
}
