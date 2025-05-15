import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { CommonItemData } from "../src/lib/type";

const fileArg = process.argv[2];
if (!fileArg) {
    console.error("Please provide the target file");
    console.error(
        "Usage: pnpm run export-glossary-data <fileNameWithoutExtension>",
    );
    process.exit(1);
}

// resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ← Only one “..” to get from scripts/ → enreco-chart/
const jsonFilePath = join(
    __dirname,
    "..",
    "src",
    "data",
    "glossary",
    `${fileArg}.json`,
);

let jsonData: CommonItemData[];
try {
    jsonData = JSON.parse(readFileSync(jsonFilePath, "utf-8"));
} catch (err) {
    console.error(`Failed to read or parse ${jsonFilePath}:`, err.message);
    process.exit(1);
}

const outputDir = join(__dirname, "..", "data", "glossary", fileArg);

if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
}

const writeToFile = (name: string, content: string) => {
    writeFileSync(join(outputDir, name + ".md"), content, "utf-8");
};

const generateFileContent = (item: CommonItemData) => {
    return [
        `[chapter]: # (${item.chapter})`,
        `[quote]:   # (${item.quote})`,
        `[name]:    # (${item.name})`,
        `[images]:  # (${item.galleryImages.map((imageItem) => imageItem.title)})`,
        ``,
        item.content,
    ].join("\n");
};

jsonData.forEach((item) => {
    writeToFile(`${item.id}`, generateFileContent(item));
});

console.log(`Export completed for chapter ${fileArg}!`);
