import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type {
    CommonItemData,
    GalleryImage,
} from "@enreco-archive/common/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const fileArg = process.argv[2];
    if (!fileArg) {
        console.error(
            "Usage: pnpm run inject-misc-data <jsonFileNameWithoutExt>",
        );
        process.exit(1);
    }

    const inputDir = path.resolve(
        __dirname,
        "..",
        "recap-data",
        "glossary",
        fileArg,
    );
    let files: string[];
    try {
        files = await fs.readdir(inputDir);
    } catch {
        console.error(`Directory not found: ${inputDir}`);
        process.exit(1);
    }

    const items: CommonItemData[] = [];

    for (const file of files.filter((f) => f.endsWith(".md"))) {
        const id = path.basename(file, ".md");
        const full = path.join(inputDir, file);
        const raw = await fs.readFile(full, "utf-8");
        const lines = raw.split(/\r?\n/);

        // parse comments
        let title = "";
        let quote = "";
        let chapter = 0;
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
                case "chapter":
                    chapter = parseInt(val, 10) || 0;
                    break;
                case "images":
                    // extract all (...) groups
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

        // content: everything after the first blank line following comments
        let idx = 0;
        // skip all comment lines
        while (idx < lines.length && lines[idx].trim().startsWith("<!--"))
            idx++;
        // skip one blank
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
            chapter,
            quote: quote || undefined,
            content,
            thumbnailSrc,
            galleryImages,
            ...(model ? { modelSrc } : { imageSrc }),
        });
    }

    // write back to JSON
    const jsonPath = path.resolve(
        __dirname,
        "..",
        "apps",
        "website",
        "data",
        "glossary",
        `${fileArg}.json`,
    );
    await fs.writeFile(jsonPath, JSON.stringify(items, null, 2), "utf-8");
    console.log(`✅ Injected ${items.length} items into ${jsonPath}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
