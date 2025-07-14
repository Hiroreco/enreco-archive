import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { CHARACTER_ORDER, sortByPredefinedOrder } from "../orders.js";

const LINKS_JSON = path.resolve(process.cwd(), "src/data/twitter-links.json");
const IMAGE_DIR = path.resolve(process.cwd(), "shared-resources/images/fanart");
const OUT_JSON = path.resolve(process.cwd(), "apps/website/data/fanart.json");
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
    images: Array<{
        src: string;
        width: number;
        height: number;
        type: "image";
    }>;
    videos: Array<{ src: string; type: "video" }>;
}

async function main() {
    // 1) Load base entries
    const baseEntries: LinkEntry[] = JSON.parse(
        await fs.readFile(LINKS_JSON, "utf-8"),
    );

    // 2) List all media files
    const allFiles = await fs.readdir(IMAGE_DIR);

    const extended: ExtendedEntry[] = [];

    for (const e of baseEntries) {
        const postIdMatch = e.url.match(/status\/(\d+)/);
        const postId = postIdMatch ? postIdMatch[1] : "";
        const prefix = `${e.author}-${postId}`;

        // Filter images
        const imageMatches = allFiles.filter(
            (f) => f.startsWith(prefix) && /\.webp$/i.test(f),
        );

        // Filter videos
        const videoMatches = allFiles.filter(
            (f) => f.startsWith(prefix) && /\.mp4$/i.test(f),
        );

        const images = [];
        for (const fname of imageMatches) {
            const fullPath = path.join(IMAGE_DIR, fname);
            try {
                const meta = await sharp(fullPath).metadata();
                images.push({
                    src: `${IMAGE_PREFIX}${fname}`,
                    width: meta.width || 0,
                    height: meta.height || 0,
                    type: "image" as const,
                });
            } catch (err) {
                console.warn(`⚠ Could not read metadata for ${fname}:`, err);
            }
        }

        const videos = [];
        for (const fname of videoMatches) {
            videos.push({
                src: `${IMAGE_PREFIX}${fname}`,
                type: "video" as const,
            });
        }

        if (images.length === 0 && videos.length === 0) {
            console.warn(`⚠ No media found for ${e.url}`);
            continue;
        }

        const sortedCharacters = sortByPredefinedOrder(
            e.characters,
            CHARACTER_ORDER,
            (char) => char,
            "alphabetical",
        );

        extended.push({
            url: e.url,
            label: e.label,
            author: e.author,
            chapter: Number(e.chapter),
            day: Number(e.day),
            characters: sortedCharacters,
            images: images,
            videos: videos,
        });
    }

    // Sort the entire fanart array - you can define your own logic here
    // For example, sort by chapter, then day, then by first character in the predefined order
    const sortedExtended = extended.sort((a, b) => {
        // First by chapter
        if (a.chapter !== b.chapter) {
            return a.chapter - b.chapter;
        }

        // Then by day
        if (a.day !== b.day) {
            return a.day - b.day;
        }

        // Then by first character's position in CHARACTER_ORDER
        const aFirstChar = a.characters[0] || "";
        const bFirstChar = b.characters[0] || "";

        const aIndex = CHARACTER_ORDER.indexOf(aFirstChar);
        const bIndex = CHARACTER_ORDER.indexOf(bFirstChar);

        // If both characters are in the order array
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }

        // If only one is in the order array, prioritize it
        if (aIndex !== -1 && bIndex === -1) return -1;
        if (aIndex === -1 && bIndex !== -1) return 1;

        // If neither is in the order array, sort alphabetically
        return aFirstChar.localeCompare(bFirstChar);
    });
    // const sortedExtended = extended;
    // 3) Write out
    await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
    await fs.writeFile(
        OUT_JSON,
        JSON.stringify(sortedExtended, null, 2),
        "utf-8",
    );
    console.log(
        `✅ Wrote ${sortedExtended.length} sorted entries to ${OUT_JSON}`,
    );
    console.log(
        `📊 Sorted fanart entries by chapter, day, and character order`,
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
