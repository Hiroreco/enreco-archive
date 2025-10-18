import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const RECAP_DATA_DIR = path.resolve(
    process.cwd(),
    "recap-data",
    "media-archive",
);
const SHARED_RESOURCES_DIR = path.resolve(
    process.cwd(),
    "shared-resources",
    "images",
    "media-archive",
);

async function getAllMarkdownFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        entries.map((entry) => {
            const fullPath = path.join(dir, entry.name);
            return entry.isDirectory()
                ? getAllMarkdownFiles(fullPath)
                : fullPath;
        }),
    );
    return files.flat().filter((file) => file.endsWith(".md"));
}

async function extractOriginalUrl(filePath: string): Promise<string | null> {
    const content = await fs.readFile(filePath, "utf-8");
    const match = content.match(
        /<!--\s*originalUrl:\s*(https:\/\/(?:www\.youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)[^ ]+)\s*-->/,
    );
    return match ? match[1] : null;
}

async function downloadThumbnail(
    youtubeUrl: string,
    outputPath: string,
): Promise<void> {
    const url = new URL(youtubeUrl);
    let videoId: string | null = null;

    if (url.hostname === "www.youtube.com" && url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
    } else if (
        url.hostname === "www.youtube.com" &&
        url.pathname.startsWith("/live/")
    ) {
        videoId = url.pathname.split("/")[2];
    } else if (url.hostname === "youtu.be") {
        videoId = url.pathname.slice(1); // Extract the video ID from the path
    }

    if (!videoId) throw new Error(`Invalid YouTube URL: ${youtubeUrl}`);

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const response = await fetch(thumbnailUrl);

    if (!response.ok) {
        throw new Error(
            `Failed to download thumbnail for ${youtubeUrl}: ${response.statusText}`,
        );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, buffer);
    console.log(`✅ Thumbnail saved: ${outputPath}`);
}

async function processMarkdownFiles() {
    const markdownFiles = await getAllMarkdownFiles(RECAP_DATA_DIR);

    for (const file of markdownFiles) {
        if (file.includes("-index")) {
            continue;
        }
        try {
            const originalUrl = await extractOriginalUrl(file);
            if (!originalUrl) {
                console.warn(`⚠ No originalUrl found in ${file}`);
                continue;
            }

            const relativePath = path.relative(RECAP_DATA_DIR, file);
            const chapterMatch = relativePath.match(/chapter(\d+)/i);
            const chapterPrefix = chapterMatch ? `c${chapterMatch[1]}-` : "";

            const baseName = path.basename(file, ".md");
            const outputFilePath = path.join(
                SHARED_RESOURCES_DIR,
                relativePath
                    .replace(/\.md$/, `.webp`)
                    .replace(baseName, `${chapterPrefix}${baseName}`),
            );

            // Skip if the thumbnail already exists
            if (existsSync(outputFilePath)) {
                continue;
            }

            console.log(`→ Processing ${file}`);
            await downloadThumbnail(originalUrl, outputFilePath);
        } catch (error: any) {
            console.error(`✖ Failed to process ${file}: ${error.message}`);
        }
    }
}

processMarkdownFiles().catch((error) => {
    console.error(`✖ Script failed: ${error.message}`);
    process.exit(1);
});
