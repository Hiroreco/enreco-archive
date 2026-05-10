import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const ENTRIES_DIR = path.resolve(
    process.cwd(),
    "apps",
    "news-data",
    "entries",
);
const VIDEO_OUT_DIR = path.resolve(
    process.cwd(),
    "apps",
    "news-data",
    "videos",
);

interface NewsEntry {
    filePath: string;
    fileName: string;
    date: string;
    author: string;
    src: string;
    mediaType: string;
    mediaSrc: string;
}

function extractMetadata(content: string, key: string): string {
    const pattern = new RegExp(`<!--\\s*${key}:\\s*(.+?)\\s*-->`, "i");
    const match = content.match(pattern);
    return match ? match[1].trim() : "";
}

function extractPostIdFromUrl(url: string): string {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : "";
}

async function downloadVideoWithYtDlp(
    url: string,
    outputPath: string,
): Promise<boolean> {
    try {
        // Check if yt-dlp is installed
        await execAsync("yt-dlp --version");
    } catch (error) {
        throw new Error(
            "yt-dlp is not installed. Please install it: pip install yt-dlp",
        );
    }

    const outputDir = path.dirname(outputPath);
    const outputName = path.basename(outputPath, path.extname(outputPath));

    try {
        console.log(`  📹 Downloading with yt-dlp...`);
        const command = `yt-dlp "${url}" -o "${path.join(outputDir, outputName)}.%(ext)s" --format "best[ext=mp4]" --no-playlist`;
        await execAsync(command);
        return true;
    } catch (error: any) {
        console.warn(`  ⚠ Failed to download video: ${error.message}`);
        return false;
    }
}

async function parseNewsEntry(filePath: string): Promise<NewsEntry | null> {
    try {
        const content = await fs.readFile(filePath, "utf-8");
        const fileName = path.basename(filePath);

        const date = extractMetadata(content, "date");
        const author = extractMetadata(content, "author");
        const src = extractMetadata(content, "src");
        const mediaType = extractMetadata(content, "mediaType");
        const mediaSrc = extractMetadata(content, "mediaSrc");

        if (!src) {
            console.warn(`⚠ Missing src in ${fileName}`);
            return null;
        }

        return {
            filePath,
            fileName,
            date,
            author,
            src,
            mediaType,
            mediaSrc,
        };
    } catch (err: any) {
        console.warn(`✖ Failed to parse ${filePath}: ${err.message}`);
        return null;
    }
}

async function main() {
    console.log("🔍 Starting find-missing script...");

    // Ensure video output directory exists
    await fs.mkdir(VIDEO_OUT_DIR, { recursive: true });

    // Check if entries directory exists
    try {
        await fs.access(ENTRIES_DIR);
    } catch {
        console.error(`❌ Entries directory not found: ${ENTRIES_DIR}`);
        process.exit(1);
    }

    // Read all markdown files
    const files = await fs.readdir(ENTRIES_DIR);
    const markdownFiles = files.filter(
        (f) => f.startsWith("news-") && f.endsWith(".md"),
    );

    console.log(`📊 Found ${markdownFiles.length} news entries`);

    const entriesWithMissingMedia: NewsEntry[] = [];

    // Parse all entries and find those with missing mediaSrc
    for (const file of markdownFiles) {
        const filePath = path.join(ENTRIES_DIR, file);
        const entry = await parseNewsEntry(filePath);

        if (entry && entry.mediaType === "video" && !entry.mediaSrc) {
            entriesWithMissingMedia.push(entry);
        }
    }

    console.log(
        `\n🎯 Found ${entriesWithMissingMedia.length} entries with missing video mediaSrc`,
    );

    if (entriesWithMissingMedia.length === 0) {
        console.log("✅ All entries have mediaSrc. Nothing to do.");
        return;
    }

    let downloadedCount = 0;

    for (const entry of entriesWithMissingMedia) {
        console.log(`\n📹 Processing: ${entry.fileName}`);
        console.log(`  Source: ${entry.src}`);
        console.log(`  Author: ${entry.author}`);
        console.log(`  Date: ${entry.date}`);

        const postId = extractPostIdFromUrl(entry.src);

        if (!postId) {
            console.warn(`  ⚠ Could not extract post ID from ${entry.src}`);
            continue;
        }

        const videoFileName = `news-${postId}.mp4`;
        const videoPath = path.join(VIDEO_OUT_DIR, videoFileName);

        // Check if video already exists
        try {
            await fs.access(videoPath);
            console.log(`  ↻ Video already exists: ${videoFileName}`);
            continue;
        } catch {
            // Video doesn't exist, download it
        }

        const downloaded = await downloadVideoWithYtDlp(entry.src, videoPath);

        if (downloaded) {
            // Find the actual downloaded file (yt-dlp might change extension)
            const videoFiles = await fs.readdir(VIDEO_OUT_DIR);
            const downloadedFile = videoFiles.find((f) =>
                f.startsWith(`news-${postId}.`),
            );

            if (downloadedFile) {
                console.log(`  ✅ Downloaded: ${downloadedFile}`);
                downloadedCount++;
            } else {
                console.warn(`  ⚠ Video download reported success but file not found`);
            }
        }

        // Throttle to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log(`\n✅ Download complete!`);
    console.log(`📥 Downloaded ${downloadedCount} videos`);
    console.log(
        `📝 Run 'pnpm upload-news-to-r2' to upload videos and update markdown files`,
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});