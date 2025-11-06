import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import puppeteer from "puppeteer";

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
    const match = content.match(/<!--\s*originalUrl:\s*([^\s]+)\s*-->/);
    return match ? match[1] : null;
}

async function downloadYoutubeThumbnail(
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
        videoId = url.pathname.slice(1);
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
    console.log(`✅ YouTube thumbnail saved: ${outputPath}`);
}

async function downloadTwitterImage(
    twitterUrl: string,
    outputPath: string,
): Promise<void> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/120.0.0.0 Safari/537.36",
    );

    try {
        const imageUrls: string[] = [];

        await page.setRequestInterception(true);

        page.on("request", (request) => {
            const url = request.url();

            // Capture high-quality image requests
            if (
                url.includes("pbs.twimg.com/media") &&
                /\.(jpg|png|gif|webp)/i.test(url)
            ) {
                if (!imageUrls.includes(url)) {
                    imageUrls.push(url);
                }
            }

            request.continue();
        });

        await page.goto(twitterUrl, {
            waitUntil: "networkidle2",
            timeout: 60000,
        });

        // Wait for images
        await page.waitForSelector('article img[src*="twimg.com/media"]', {
            timeout: 10000,
        });

        // Wait a bit more to ensure all media requests are captured
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Also get images from the DOM as fallback
        const domImages = await page.evaluate(() => {
            const imgs = document.querySelectorAll(
                'article img[src*="twimg.com/media"]',
            );
            return Array.from(imgs).map((img) => (img as HTMLImageElement).src);
        });

        // Combine and deduplicate image URLs
        const allImageUrls = [...new Set([...imageUrls, ...domImages])];

        if (allImageUrls.length === 0) {
            throw new Error(`No images found in tweet: ${twitterUrl}`);
        }

        // Get the first image and force high-res
        let imageUrl = allImageUrls[0];
        if (imageUrl.includes("name=")) {
            imageUrl = imageUrl.replace(/name=[^&]*/, "name=orig");
        } else {
            imageUrl += (imageUrl.includes("?") ? "&" : "?") + "name=orig";
        }

        // Download the image
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(
                `Failed to download Twitter image: ${response.statusText}`,
            );
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, buffer);
        console.log(`✅ Twitter image saved: ${outputPath}`);
    } finally {
        await page.setRequestInterception(false);
        page.removeAllListeners("request");
        await browser.close();
    }
}

function isYoutubeUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return (
            urlObj.hostname === "www.youtube.com" ||
            urlObj.hostname === "youtu.be" ||
            urlObj.hostname === "youtube.com"
        );
    } catch {
        return false;
    }
}

function isTwitterUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return (
            urlObj.hostname === "twitter.com" ||
            urlObj.hostname === "x.com" ||
            urlObj.hostname === "www.twitter.com" ||
            urlObj.hostname === "www.x.com"
        );
    } catch {
        return false;
    }
}

async function downloadThumbnail(
    originalUrl: string,
    outputPath: string,
): Promise<void> {
    if (isYoutubeUrl(originalUrl)) {
        await downloadYoutubeThumbnail(originalUrl, outputPath);
    } else if (isTwitterUrl(originalUrl)) {
        await downloadTwitterImage(originalUrl, outputPath);
    }
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

            // Determine file extension based on URL type
            let extension = ".jpg";
            if (isYoutubeUrl(originalUrl)) {
                extension = ".webp";
            }

            const outputFilePath = path.join(
                SHARED_RESOURCES_DIR,
                relativePath
                    .replace(/\.md$/, extension)
                    .replace(baseName, `${chapterPrefix}${baseName}`),
            );
            const outputFilePathOpt = path.join(
                SHARED_RESOURCES_DIR,
                relativePath
                    .replace(/\.md$/, ".webp")
                    .replace(baseName, `${chapterPrefix}${baseName}-opt`),
            );

            // Skip if the thumbnail already exists
            if (existsSync(outputFilePathOpt) || existsSync(outputFilePath)) {
                continue;
            }

            console.log(`→ Processing ${file}`);
            console.log(`  URL: ${originalUrl}`);
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
