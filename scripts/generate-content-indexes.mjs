import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_DIRECTORY_PATH = path.join(process.cwd(), "src/content");

async function findJsonFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        return findJsonFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith(".json") ? [entryPath] : [];
    }),
  );

  return files.flat().sort((a, b) => a.localeCompare(b));
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf-8"));
  } catch (error) {
    throw new Error(`Invalid JSON: ${path.relative(process.cwd(), filePath)}`, { cause: error });
  }
}

function getItemId(filePath) {
  return path.basename(filePath, ".json");
}

function assertUniqueItemIds(files, contentType) {
  const fileById = new Map();

  for (const filePath of files) {
    const id = getItemId(filePath);
    const existingFile = fileById.get(id);
    if (existingFile) {
      throw new Error(
        `Duplicate ${contentType} id "${id}": ${path.relative(process.cwd(), existingFile)} and ${path.relative(process.cwd(), filePath)}`,
      );
    }
    fileById.set(id, filePath);
  }
}

function assertExactIndexCoverage(files, indexedItems, contentType) {
  const fileIds = new Set(files.map(getItemId));
  const indexedIds = new Set();

  for (const { id, location } of indexedItems) {
    if (!fileIds.has(id)) {
      throw new Error(`Unknown ${contentType} id "${id}" in ${location}`);
    }
    if (indexedIds.has(id)) {
      throw new Error(`Duplicate ${contentType} id "${id}" in index`);
    }
    indexedIds.add(id);
  }

  const unindexedIds = [...fileIds].filter((id) => !indexedIds.has(id));
  if (unindexedIds.length > 0) {
    throw new Error(`Unindexed ${contentType} items: ${unindexedIds.join(", ")}`);
  }
}

async function validateWorks(files) {
  const indexPath = path.join(CONTENT_DIRECTORY_PATH, "works/index.json");
  const index = await readJson(indexPath);
  if (!Array.isArray(index.yearSections)) {
    throw new Error("Invalid works/index.json: yearSections must be an array");
  }

  const indexedItems = index.yearSections.flatMap((section) => {
    if (!Number.isInteger(section.year) || !Array.isArray(section.itemIds)) {
      throw new Error("Invalid works/index.json: each year section requires year and itemIds");
    }
    return section.itemIds.map((id) => ({
      id,
      location: `works/index.json year ${section.year}`,
      expectedDirectory: String(section.year),
    }));
  });

  assertExactIndexCoverage(files, indexedItems, "work");

  const fileById = new Map(files.map((filePath) => [getItemId(filePath), filePath]));
  for (const { id, expectedDirectory } of indexedItems) {
    const actualDirectory = path.basename(path.dirname(fileById.get(id)));
    if (actualDirectory !== expectedDirectory) {
      throw new Error(
        `Work "${id}" is listed under ${expectedDirectory}, but its file is in ${actualDirectory}`,
      );
    }
  }

  const featuredIds = index.featuredIds;
  if (!Array.isArray(featuredIds)) {
    throw new Error("Invalid works/index.json: featuredIds must be an array");
  }
  for (const id of featuredIds) {
    if (!fileById.has(id)) {
      throw new Error(`Unknown work id "${id}" in works/index.json featuredIds`);
    }
  }
}

async function validateInterests(files) {
  const indexPath = path.join(CONTENT_DIRECTORY_PATH, "interests/index.json");
  const index = await readJson(indexPath);
  if (!Array.isArray(index)) {
    throw new Error("Invalid interests/index.json: expected an array");
  }

  const indexedItems = index.flatMap((section) => {
    if (typeof section.category !== "string" || !Array.isArray(section.itemIds)) {
      throw new Error("Invalid interests/index.json: each category requires category and itemIds");
    }
    return section.itemIds.map((id) => ({
      id,
      location: `interests/index.json category ${section.category}`,
      expectedDirectory: section.category.toLowerCase(),
    }));
  });

  assertExactIndexCoverage(files, indexedItems, "interest");

  const fileById = new Map(files.map((filePath) => [getItemId(filePath), filePath]));
  for (const { id, expectedDirectory } of indexedItems) {
    const actualDirectory = path.basename(path.dirname(fileById.get(id)));
    if (actualDirectory !== expectedDirectory) {
      throw new Error(
        `Interest "${id}" is listed under ${expectedDirectory}, but its file is in ${actualDirectory}`,
      );
    }
  }
}

function buildGeneratedModule(files, outputPath, exportName, scriptName) {
  const outputDirectoryPath = path.dirname(outputPath);
  const imports = files.map((filePath, index) => {
    const relativePath = path.relative(outputDirectoryPath, filePath).replaceAll(path.sep, "/");
    return `import item${index} from "./${relativePath}";`;
  });
  const entries = files.map(
    (filePath, index) => `  [${JSON.stringify(getItemId(filePath))}, item${index}],`,
  );

  return [
    `// This file is auto-generated by ${scriptName}.`,
    "// Do not edit manually.",
    "",
    ...imports,
    "",
    `export const ${exportName} = [`,
    ...entries,
    "] as const;",
    "",
  ].join("\n");
}

async function generateContentIndex({
  contentType,
  itemsDirectoryPath,
  outputPath,
  exportName,
  validate,
}) {
  const files = await findJsonFiles(itemsDirectoryPath);
  assertUniqueItemIds(files, contentType);
  await validate(files);

  const scriptName = "scripts/generate-content-indexes.mjs";
  const output = buildGeneratedModule(files, outputPath, exportName, scriptName);
  await writeFile(outputPath, output, "utf-8");
  console.log(`Generated ${path.relative(process.cwd(), outputPath)} (${files.length} items)`);
}

await Promise.all([
  generateContentIndex({
    contentType: "work",
    itemsDirectoryPath: path.join(CONTENT_DIRECTORY_PATH, "works/items"),
    outputPath: path.join(CONTENT_DIRECTORY_PATH, "works/generated.ts"),
    exportName: "workItemEntries",
    validate: validateWorks,
  }),
  generateContentIndex({
    contentType: "interest",
    itemsDirectoryPath: path.join(CONTENT_DIRECTORY_PATH, "interests/items"),
    outputPath: path.join(CONTENT_DIRECTORY_PATH, "interests/generated.ts"),
    exportName: "interestItemEntries",
    validate: validateInterests,
  }),
]);
