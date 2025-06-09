// scripts/inject-glossary.ts
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type {
    CommonItemData,
    GalleryImage,
} from "@enreco-archive/common/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GlossaryPageData keyed by subcategory (immediate child of fileArg)
type GlossaryPageData = { [subcategory: string]: CommonItemData[] };

// Recursively collect all file paths under `dir`
async function walkDir(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            files.push(...(await walkDir(full)));
        } else if (ent.isFile() && ent.name.endsWith(".md")) {
            files.push(full);
        }
    }
    return files;
}

async function processSubfolder(fileArg: string) {
    const baseDir = path.resolve(
        __dirname,
        "..",
        "recap-data",
        "glossary",
        fileArg,
    );

    // Ensure it exists and is a directory
    let stat;
    try {
        stat = await fs.stat(baseDir);
        if (!stat.isDirectory()) throw new Error();
    } catch {
        console.warn(`Skipping non-directory: ${fileArg}`);
        return;
    }

    // List immediate subdirectories (these become keys in the output JSON)
    const subEntries = await fs.readdir(baseDir, { withFileTypes: true });
    const subfolders = subEntries
        .filter((e) => e.isDirectory())
        .map((e) => e.name);

    const result: GlossaryPageData = {};

    for (const subcat of subfolders) {
        const subDir = path.join(baseDir, subcat);
        // Find every .md under subDir (recursively)
        const mdPaths = await walkDir(subDir);

        const items: CommonItemData[] = [];
        for (const fullPath of mdPaths) {
            const id = path.basename(fullPath, ".md");
            const raw = await fs.readFile(fullPath, "utf-8");
            const lines = raw.split(/\r?\n/);

            // parse HTML comments
            let title = "";
            let quote = "";
            let chapterArr: number[] = [];
            let imageTitles: string[] = [];
            let model = false;

            for (let i = 0; i < lines.length; i++) {
                const l = lines[i].trim();
                if (!l.startsWith("<!--")) continue;
                const m = l.match(/^<!--\s*(\w+)\s*:\s*(.*?)\s*-->$/);
                if (!m) continue;
                const [, key, val] = m;

                switch (key) {
                    case "title":
                        title = val;
                        break;

                    case "quote":
                        quote = val;
                        break;

                    case "chapters":
                        // split on commas, parse each as integer
                        chapterArr =
                            val
                                .split(",")
                                .map((s) => parseInt(s.trim(), 10))
                                .filter((n) => !isNaN(n)) || [];
                        break;

                    case "images":
                        const t: string[] = [];
                        for (const m2 of val.matchAll(/\((.*?)\)/g)) {
                            t.push(m2[1]);
                        }
                        imageTitles = t;
                        break;

                    case "model":
                        model = val.toLowerCase() === "true";
                        break;
                }
            }

            // find where comments end, skip blank line, then rest is content
            let idx = 0;
            while (idx < lines.length && lines[idx].trim().startsWith("<!--"))
                idx++;
            if (lines[idx]?.trim() === "") idx++;
            const content = lines.slice(idx).join("\n").trim();

            // build galleryImages
            const galleryImages: GalleryImage[] = imageTitles.map((t, i) => ({
                title: t,
                source: `/images-opt/${id}-${i}.webp`,
            }));

            const thumbnailSrc = `/images-opt/${id}-thumb.webp`;
            const modelSrc = model ? `/models/${id}.glb` : undefined;
            const imageSrc = model ? undefined : `/images-opt/${id}.webp`;

            items.push({
                id,
                title,
                chapters: chapterArr,
                quote: quote || undefined,
                content,
                thumbnailSrc,
                galleryImages,
                ...(model ? { modelSrc } : { imageSrc }),
            });
        }

        result[subcat] = items;
    }

    // Write JSON to apps/website/data/glossary/<fileArg>.json
    const outPath = path.resolve(
        __dirname,
        "..",
        "apps",
        "website",
        "data",
        "glossary",
        `${fileArg}.json`,
    );
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`✅ Injected subcategories of '${fileArg}' into ${outPath}`);
}

async function main() {
    const fileArg = process.argv[2];
    if (!fileArg) {
        console.error(
            "Usage: pnpm run inject-glossary <folderName> or '.' for all",
        );
        process.exit(1);
    }

    const baseGlossary = path.resolve(
        __dirname,
        "..",
        "recap-data",
        "glossary",
    );
    let subfolders: string[];

    if (fileArg === ".") {
        try {
            subfolders = (
                await fs.readdir(baseGlossary, { withFileTypes: true })
            )
                .filter((d) => d.isDirectory())
                .map((d) => d.name);
        } catch {
            console.error(`Directory not found: ${baseGlossary}`);
            process.exit(1);
        }

        for (const sub of subfolders) {
            await processSubfolder(sub);
        }
    } else {
        await processSubfolder(fileArg);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
