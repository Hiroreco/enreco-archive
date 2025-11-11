import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const LINKS_JSON = path.resolve(
    process.cwd(),
    "src",
    "data",
    "twitter-links.json",
);
const OUT_DIR = path.resolve(
    process.cwd(),
    "shared-resources",
    "images",
    "fanart",
);
const VIDEO_CHECK_DIR = path.resolve(
    process.cwd(),
    "shared-resources",
    "videos",
);
const VIDEO_OUT_DIR = path.resolve(
    process.cwd(),
    "shared-resources",
    "new-videos",
);
const EXTENSIONS = ["jpg", "png", "webp", "gif"];

interface LinkEntry {
    url: string;
    label: string;
    author: string;
    chapter: string;
    day: string;
    character: string;
}

async function downloadBuffer(url: string): Promise<Buffer> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed ${res.status} for ${url}`);
    return Buffer.from(await res.arrayBuffer());
}

async function downloadVideoWithYtDlp(
    url: string,
    outputPath: string,
): Promise<void> {
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

    const command = `yt-dlp "${url}" -o "${path.join(outputDir, outputName)}.%(ext)s" --format "best[ext=mp4]" --no-playlist`;

    await execAsync(command);
}

async function run() {
    const data: LinkEntry[] = JSON.parse(
        await fs.readFile(LINKS_JSON, "utf-8"),
    );
    await fs.mkdir(OUT_DIR, { recursive: true });
    await fs.mkdir(VIDEO_CHECK_DIR, { recursive: true });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/120.0.0.0 Safari/537.36",
    );

    for (const entry of data) {
        // derive base name from author + postId
        const postIdMatch = entry.url.match(/status\/(\d+)/);
        const postId = postIdMatch ? postIdMatch[1] : "unknown";
        const baseName = `${entry.author}-${postId}`;

        // PRE-CHECK: skip if already downloaded (including videos)
        const videoExtensions = ["mp4", "webm", "mov"];
        const allExtensions = [...EXTENSIONS, ...videoExtensions];
        const already = allExtensions.some((ext) => {
            const noIdx = path.join(OUT_DIR, `${baseName}.${ext}`);
            const idx0 = path.join(OUT_DIR, `${baseName}-0.${ext}`);
            const noIdxOpt = path.join(OUT_DIR, `${baseName}-opt.${ext}`);
            const idx0Opt = path.join(OUT_DIR, `${baseName}-0-opt.${ext}`);
            // Also check video directory
            const videoNoIdx = path.join(VIDEO_CHECK_DIR, `${baseName}.${ext}`);
            const videoIdx0 = path.join(
                VIDEO_CHECK_DIR,
                `${baseName}-0.${ext}`,
            );
            const videoNoIdxOpt = path.join(
                VIDEO_CHECK_DIR,
                `${baseName}-opt.${ext}`,
            );
            const videoIdx0Opt = path.join(
                VIDEO_CHECK_DIR,
                `${baseName}-0-opt.${ext}`,
            );
            return (
                existsSync(noIdx) ||
                existsSync(idx0) ||
                existsSync(noIdxOpt) ||
                existsSync(idx0Opt) ||
                existsSync(videoNoIdx) ||
                existsSync(videoIdx0) ||
                existsSync(videoNoIdxOpt) ||
                existsSync(videoIdx0Opt)
            );
        });
        if (already) {
            // console.lzog(`↻ Skipping ${baseName} (already downloaded)`);
            continue;
        }

        console.log(`→ Visiting ${entry.url}`);

        // Set up request interception to capture image URLs only
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

        try {
            await page.goto(entry.url, {
                waitUntil: "networkidle2",
                timeout: 60000,
            });

            // Wait for either images or videos
            await Promise.race([
                page.waitForSelector('article img[src*="twimg.com/media"]', {
                    timeout: 10000,
                }),
                page.waitForSelector("article video", {
                    timeout: 10000,
                }),
            ]).catch(() => {
                // If neither selector is found, continue anyway
            });

            // Wait a bit more to ensure all media requests are captured
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Also get images from the DOM as fallback
            const domImages = await page.evaluate(() => {
                const imgs = document.querySelectorAll(
                    'article img[src*="twimg.com/media"]',
                );
                return Array.from(imgs).map(
                    (img) => (img as HTMLImageElement).src,
                );
            });

            // Check for videos in the DOM
            const hasVideo = await page.evaluate(() => {
                const videos = document.querySelectorAll("article video");
                return videos.length > 0;
            });

            // Combine and deduplicate image URLs
            const allImageUrls = [...new Set([...imageUrls, ...domImages])];

            console.log(
                `Found ${allImageUrls.length} images${hasVideo ? " and 1 video" : ""}`,
            );

            let mediaIndex = 0;

            // Download images
            for (const rawUrl of allImageUrls) {
                let imageUrl = rawUrl;

                // Force high-res for images
                if (imageUrl.includes("name=")) {
                    imageUrl = imageUrl.replace(/name=[^&]*/, "name=orig");
                } else {
                    imageUrl +=
                        (imageUrl.includes("?") ? "&" : "?") + "name=orig";
                }

                const extMatch = imageUrl.match(
                    /\.(jpg|png|gif|webp)(?:\?|$)/i,
                );
                const ext = extMatch ? extMatch[1] : "jpg";

                const fileName = `${baseName}-${mediaIndex}.${ext}`;
                const outPath = path.join(OUT_DIR, fileName);

                if (existsSync(outPath)) {
                    console.log(`  ↻ Skipping existing ${fileName}`);
                    mediaIndex++;
                    continue;
                }

                console.log(
                    `  ↳ Downloading image [${mediaIndex + 1}]: ${imageUrl}`,
                );
                try {
                    const buffer = await downloadBuffer(imageUrl);
                    await fs.writeFile(outPath, buffer);
                    console.log(`  ✅ Saved ${fileName}`);
                } catch (err: any) {
                    console.warn(
                        `  ✖ Failed to download image: ${err.message}`,
                    );
                }

                mediaIndex++;
            }

            // Download video using yt-dlp if video is present
            if (hasVideo) {
                const videoFileName = `${baseName}-${mediaIndex}.mp4`;
                const videoOutPath = path.join(VIDEO_OUT_DIR, videoFileName);

                if (existsSync(videoOutPath)) {
                    console.log(`  ↻ Skipping existing ${videoFileName}`);
                } else {
                    console.log(
                        `  ↳ Downloading video with yt-dlp: ${entry.url}`,
                    );
                    try {
                        await downloadVideoWithYtDlp(entry.url, videoOutPath);

                        // Find the downloaded file (yt-dlp might change the extension)
                        const files = await fs.readdir(VIDEO_OUT_DIR);
                        const downloadedFile = files.find((f) =>
                            f.startsWith(`${baseName}-${mediaIndex}.`),
                        );

                        if (downloadedFile) {
                            console.log(`  ✅ Saved ${downloadedFile}`);
                        } else {
                            console.warn(
                                `  ⚠ Video downloaded but file not found`,
                            );
                        }
                    } catch (err: any) {
                        console.warn(
                            `  ✖ Failed to download video: ${err.message}`,
                        );
                    }
                }
            }

            if (allImageUrls.length === 0 && !hasVideo) {
                console.warn(`  ⚠ No media found at ${entry.url}`);
            }
        } catch (err: any) {
            console.warn(`  ✖ Failed ${entry.url}: ${err.message}`);
        } finally {
            // Clean up request interception
            await page.setRequestInterception(false);
            page.removeAllListeners("request");
        }

        // throttle 2s
        await new Promise((r) => setTimeout(r, 2000));
    }

    await browser.close();
    console.log("✅ All done.");
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
