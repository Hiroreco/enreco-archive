import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LINKS_JSON = path.resolve(__dirname, "../src/data/twitter-links.json");
const IMAGE_DIR = path.resolve(__dirname, "../shared-resources/images/fanart");
const OUT_JSON = path.resolve(__dirname, "../apps/website/data/fanart.json");
const IMAGE_PREFIX = "images-opt/";

interface LinkEntry {
    url: string;
    label: string;
    author: string;
    chapter: string;
    day: string;
    characters: string[];
}

interface ExtendedEntry extends Omit<LinkEntry, "chapter" | "day"> {
    chapter: number;
    day: number;
    images: Array<{ src: string; width: number; height: number }>;
}

async function main() {
    // 1) Load base entries
    const baseEntries: LinkEntry[] = JSON.parse(
        await fs.readFile(LINKS_JSON, "utf-8"),
    );

    // 2) List all image files
    const allImages = await fs.readdir(IMAGE_DIR);

    const extended: ExtendedEntry[] = [];

    for (const e of baseEntries) {
        const postIdMatch = e.url.match(/status\/(\d+)/);
        const postId = postIdMatch ? postIdMatch[1] : "";
        const prefix = `${e.author}-${postId}`;

        // Filter images belonging to this entry
        const matches = allImages.filter(
            (f) => f.startsWith(prefix) && /\.webp$/i.test(f),
        );

        const images = [];
        for (const fname of matches) {
            const fullPath = path.join(IMAGE_DIR, fname);
            try {
                const meta = await sharp(fullPath).metadata();
                images.push({
                    src: `${IMAGE_PREFIX}${fname}`,
                    width: meta.width || 0,
                    height: meta.height || 0,
                });
            } catch (err) {
                console.warn(`⚠ Could not read metadata for ${fname}:`, err);
            }
        }
        if (images.length === 0) {
            console.warn(`⚠ No images found for ${e.url}`);
            continue;
        }

        extended.push({
            url: e.url,
            label: e.label,
            author: e.author,
            chapter: Number(e.chapter),
            day: Number(e.day),
            characters: e.characters,
            images: images,
        });
    }

    // 3) Write out
    await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
    await fs.writeFile(OUT_JSON, JSON.stringify(extended, null, 2), "utf-8");
    console.log(`✅ Wrote ${extended.length} entries to ${OUT_JSON}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
