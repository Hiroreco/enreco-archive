import {
    readdirSync,
    readFileSync,
    writeFileSync,
    existsSync,
    mkdirSync,
} from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { CommonItemData, GalleryImage } from "../src/lib/type";
import { validateGlossary } from "./validateGlossary";

import metadata from "../src/data/metadata.json";

const fileArg = process.argv[2];
if (!fileArg) {
    console.error("Usage: pnpm run inject-glossary-data <folderName>");
    process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Input folder: data/glossary/<fileArg>/
const inputDir = join(__dirname, "..", "data", "glossary", fileArg);
if (!existsSync(inputDir)) {
    console.error(`Directory not found: ${inputDir}`);
    process.exit(1);
}

// Output JSON: src/data/glossary/<fileArg>.json
const outputDir = join(__dirname, "..", "src", "data", "glossary");
const outputFile = join(outputDir, `${fileArg}.json`);
if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
}

function parseMdFile(md: string, id: string): CommonItemData {
    const lines = md.split(/\r?\n/);
    const tags: Record<string, string> = {};
    let i = 0;

    const TAG_RE = /^\[([^\]]+)\]:\s*(.*?)\s*$/;

    // 1) extract tags until first blank line
    for (; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed === "") {
            i++;
            break;
        }
        const m = lines[i].match(TAG_RE);
        if (m) {
            tags[m[1].trim()] = m[2].trim();
        }
    }

    // 2) everything after is content
    const content = lines.slice(i).join("\n").trim();

    // 3) build galleryImages from tags["images"]
    const imageTitles = (tags["images"] || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    const galleryImages: GalleryImage[] = imageTitles.map((title, idx) => ({
        title,
        source: `/images-opt/${id}-${idx}.webp`,
    }));

    //do checks here, for example (if isEmptyChapter())

    return {
        id,
        name: tags["name"] || "",
        chapter: Number(tags["chapter"] || "0"),
        quote: tags["quote"] || "",
        content,
        thumbnailSrc: `/images-opt/${id}-thumb.webp`,
        galleryImages,
    };
}

// 3) Read all .md, parse, collect
const items = readdirSync(inputDir)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
        const id = filename.replace(/\.md$/, "");
        const md = readFileSync(join(inputDir, filename), "utf-8");
        return parseMdFile(md, id);
    });

// 4) validate data before injecting them in
const CURRENT_CHAPTER_MAX = metadata.numChapters;

const { valid, invalid } = validateGlossary(items, CURRENT_CHAPTER_MAX);

// Log out any problems
if (Object.keys(invalid).length) {
    console.warn("⚠️  Validation errors detected:");
    for (const [id, errs] of Object.entries(invalid)) {
        console.warn(`  • ${id}: ${errs.join("; ")}`);
    }
    console.log(`Injection aborted`);
} else {
    console.log("✅ All items passed validation");
    writeFileSync(outputFile, JSON.stringify(valid, null, 2), "utf-8");
    console.log(
        `Injected ${valid.length}/${items.length} items into ${outputFile}`,
    );
}
