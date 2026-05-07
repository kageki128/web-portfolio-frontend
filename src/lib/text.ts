export function hasText(value: string): boolean {
  return value.trim().length > 0;
}

export function trimOrEmpty(value: string | null | undefined): string {
  return value?.trim() ?? "";
}
