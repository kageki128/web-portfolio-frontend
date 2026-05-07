import { hasText, trimOrEmpty } from "@/lib/text";

const WORK_HASH_KEY = "work";

export function getWorkIdFromHash(hash: string): string | null {
  if (!hash.startsWith("#")) {
    return null;
  }

  const params = new URLSearchParams(hash.slice(1));
  const workId = trimOrEmpty(params.get(WORK_HASH_KEY));
  return hasText(workId) ? workId : null;
}

export function createWorkDetailHref(workId: string): string {
  const params = new URLSearchParams({ [WORK_HASH_KEY]: workId });
  return `/works#${params.toString()}`;
}
