import { NextResponse } from "next/server";
import { isAllowedMetadataLink } from "@/server/metadata/allowedLinks";
import { resolveLinkMetadata } from "@/server/metadata/link";

const DEFAULT_TIMEOUT_MS = 12_000;
const MAX_TIMEOUT_MS = 30_000;

function parseBooleanFlag(value: string | null, defaultValue: boolean): boolean {
  if (value === null) return defaultValue;
  return value !== "0";
}

function parseTimeoutMs(value: string | null): number {
  if (!value) return DEFAULT_TIMEOUT_MS;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_TIMEOUT_MS;
  return Math.min(parsed, MAX_TIMEOUT_MS);
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const url = searchParams.get("url")?.trim() ?? "";
  const includeTitle = parseBooleanFlag(searchParams.get("title"), true);
  const includeImage = parseBooleanFlag(searchParams.get("image"), true);
  const waitForCompleteImageFetch = parseBooleanFlag(searchParams.get("wait"), true);
  const timeoutMs = parseTimeoutMs(searchParams.get("timeoutMs"));

  if (!url) {
    return NextResponse.json({ title: "", image: "" });
  }

  if (!(await isAllowedMetadataLink(url))) {
    return NextResponse.json(
      { title: "", image: "" },
      {
        status: 403,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  }

  const metadata = await resolveLinkMetadata(url, {
    includeTitle,
    includeImage,
    timeoutMs,
    waitForCompleteImageFetch,
  });

  return NextResponse.json(metadata, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
