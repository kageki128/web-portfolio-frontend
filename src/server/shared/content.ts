import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { type ZodType, z } from "zod";

function parseJson(text: string, context: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Invalid JSON syntax: ${context}`);
  }
}

function formatZodIssue(issue: z.ZodIssue): string {
  const issuePath = issue.path.map(String).join(".");
  const pathLabel = issuePath.length > 0 ? issuePath : "<root>";
  return `${pathLabel}: ${issue.message}`;
}

export function formatValidationError(context: string, error: z.ZodError): string {
  const details = error.issues.map(formatZodIssue).join("; ");
  return `Invalid JSON shape: ${context} (${details})`;
}

export async function readJsonFileWithSchema<T>(
  filePath: string,
  schema: ZodType<T>,
  context: string,
): Promise<T> {
  const raw = await readFile(filePath, "utf-8");
  const parsed = parseJson(raw, context);
  const validated = schema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(formatValidationError(context, validated.error));
  }
  return validated.data;
}

export async function collectJsonFilePaths(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const nestedLists = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        return collectJsonFilePaths(entryPath);
      }
      if (entry.isFile() && entry.name.endsWith(".json")) {
        return [entryPath];
      }
      return [];
    }),
  );
  return nestedLists.flat().sort((a, b) => a.localeCompare(b));
}

export function getJsonFileId(filePath: string): string {
  const fileName = path.basename(filePath);
  const id = fileName.replace(/\.json$/, "");
  if (!id) {
    throw new Error(`Invalid JSON file name: ${fileName}`);
  }
  return id;
}
