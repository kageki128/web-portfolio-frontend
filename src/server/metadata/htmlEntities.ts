const HTML_ENTITY_BY_NAME: Record<string, string> = {
  amp: "&",
  quot: "\"",
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
};

function decodeNumericEntity(value: string, radix: number): string | null {
  const codePoint = Number.parseInt(value, radix);
  if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
    return null;
  }
  return String.fromCodePoint(codePoint);
}

export function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (entity, name: string) => {
    const normalizedName = name.toLowerCase();
    if (normalizedName.startsWith("#x")) {
      return decodeNumericEntity(normalizedName.slice(2), 16) ?? entity;
    }
    if (normalizedName.startsWith("#")) {
      return decodeNumericEntity(normalizedName.slice(1), 10) ?? entity;
    }
    return HTML_ENTITY_BY_NAME[normalizedName] ?? entity;
  });
}
