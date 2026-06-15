import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import { exec } from "child_process";
import { promisify } from "util";

const SKIP_VIDEOS = true;

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
const DOWNLOADED_VIDEOS_MD = path.resolve(
    process.cwd(),
    "scripts",
    "fanart",
    "downloaded_videos.md",
);
const FAILED_DOWNLOADS_MD = path.resolve(
    process.cwd(),
    "scripts",
    "fanart",
    "failed_downloads.md",
);

interface LinkEntry {
    url: string;
    label: string;
    author: string;
    chapter: string;
    day: string;
    character: string;
}

async function loadDownloadedVideos(): Promise<Set<string>> {
    try {
        const content = await fs.readFile(DOWNLOADED_VIDEOS_MD, "utf-8");
        const urls = content
            .split("\n")
            .map((line) => line.replace(/^-\s*/, "").trim())
            .filter((line) => line.startsWith("http"));
        return new Set(urls);
    } catch {
        return new Set();
    }
}

async function markVideoDownloaded(url: string): Promise<void> {
    const line = `- ${url}\n`;
    await fs.appendFile(DOWNLOADED_VIDEOS_MD, line, "utf-8");
}

interface FailedEntry {
    url: string;
    reason: string;
}

async function writeFailedDownloads(failed: FailedEntry[]): Promise<void> {
    if (failed.length === 0) return;
    const timestamp = new Date().toISOString();
    const lines = [
        `# Failed Downloads`,
        ``,
        `Generated: ${timestamp}`,
        ``,
        ...failed.map((f) => `- ${f.url}\n  - Reason: ${f.reason}`),
        ``,
    ];
    await fs.writeFile(FAILED_DOWNLOADS_MD, lines.join("\n"), "utf-8");
    console.log(
        `\n⚠ Wrote ${failed.length} failed download(s) to failed_downloads.md`,
    );
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

    const downloadedVideos = await loadDownloadedVideos();
    const failedDownloads: FailedEntry[] = [];

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/120.0.0.0 Safari/537.36",
    );

    for (const entry of data) {
        const postIdMatch = entry.url.match(/status\/(\d+)/);
        const postId = postIdMatch ? postIdMatch[1] : "unknown";
        const baseName = `${entry.author}-${postId}`;

        // PRE-CHECK: skip if already downloaded
        const videoExtensions = ["mp4", "webm", "mov"];
        const already =
            EXTENSIONS.some((ext) => {
                const noIdx = path.join(OUT_DIR, `${baseName}.${ext}`);
                const idx0 = path.join(OUT_DIR, `${baseName}-0.${ext}`);
                const noIdxOpt = path.join(OUT_DIR, `${baseName}-opt.${ext}`);
                const idx0Opt = path.join(OUT_DIR, `${baseName}-0-opt.${ext}`);
                return (
                    existsSync(noIdx) ||
                    existsSync(idx0) ||
                    existsSync(noIdxOpt) ||
                    existsSync(idx0Opt)
                );
            }) ||
            videoExtensions.some((ext) => {
                const noIdx = path.join(OUT_DIR, `${baseName}.${ext}`);
                const idx0 = path.join(OUT_DIR, `${baseName}-0.${ext}`);
                const noIdxOpt = path.join(OUT_DIR, `${baseName}-opt.${ext}`);
                const idx0Opt = path.join(OUT_DIR, `${baseName}-0-opt.${ext}`);
                return (
                    existsSync(noIdx) ||
                    existsSync(idx0) ||
                    existsSync(noIdxOpt) ||
                    existsSync(idx0Opt)
                );
            }) ||
            downloadedVideos.has(entry.url);

        if (already) {
            // console.log(`↻ Skipping ${baseName} (already downloaded)`);
            continue;
        }

        // TODO: remove this
        const blacklist = [
            "https://x.com/gaby_joestar/status/2059100327647801566",
            "https://x.com/kenjikokun/status/2058892291201441835",
            "https://x.com/Legz0s/status/2058813041404457219",
            "https://x.com/rikuje/status/2059591111849758865",
            "https://x.com/seapupu290495/status/2059279544922911168",
            "https://x.com/werocosmiko/status/2058800535583522856",
            "https://x.com/kurxkur/status/2059745113660699001",
            "https://x.com/vvtoll/status/2059823321966116895",
            "https://x.com/koizumi_arata/status/2059890256988488105",
            "https://x.com/yerbmeow/status/2059706394303996057",
        ];
        if (blacklist.includes(entry.url)) {
            console.log(`↻ Skipping ${entry.url} (blacklisted)`);
            continue;
        }

        console.log(`→ Visiting ${entry.url}`);

        const imageUrls: string[] = [];

        await page.setRequestInterception(true);

        page.on("request", (request) => {
            const url = request.url();

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

            await Promise.race([
                page.waitForSelector('article img[src*="twimg.com/media"]', {
                    timeout: 10000,
                }),
                page.waitForSelector("article video", {
                    timeout: 10000,
                }),
            ]).catch(() => {});

            await new Promise((resolve) => setTimeout(resolve, 3000));

            const domImages = await page.evaluate(() => {
                const imgs = document.querySelectorAll(
                    'article img[src*="twimg.com/media"]',
                );
                return Array.from(imgs).map(
                    (img) => (img as HTMLImageElement).src,
                );
            });

            const hasVideo = await page.evaluate(() => {
                const videos = document.querySelectorAll("article video");
                return videos.length > 0;
            });

            const allImageUrls = [...new Set([...imageUrls, ...domImages])];

            console.log(
                `Found ${allImageUrls.length} images${hasVideo ? " and 1 video" : ""}`,
            );

            let mediaIndex = 0;

            for (const rawUrl of allImageUrls) {
                let imageUrl = rawUrl;

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
                    failedDownloads.push({
                        url: entry.url,
                        reason: `Image download failed (${fileName}): ${err.message}`,
                    });
                }

                mediaIndex++;
            }

            if (hasVideo && !SKIP_VIDEOS) {
                const videoFileName = `${baseName}-${mediaIndex}.mp4`;
                const videoOutPath = path.join(VIDEO_OUT_DIR, videoFileName);

                if (downloadedVideos.has(entry.url)) {
                    console.log(
                        `  ↻ Skipping already-logged video for ${entry.url}`,
                    );
                } else {
                    console.log(
                        `  ↳ Downloading video with yt-dlp: ${entry.url}`,
                    );
                    try {
                        await downloadVideoWithYtDlp(entry.url, videoOutPath);

                        const files = await fs.readdir(VIDEO_OUT_DIR);
                        const downloadedFile = files.find((f) =>
                            f.startsWith(`${baseName}-${mediaIndex}.`),
                        );

                        if (downloadedFile) {
                            console.log(`  ✅ Saved ${downloadedFile}`);
                            await markVideoDownloaded(entry.url);
                            downloadedVideos.add(entry.url);
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
            await page.setRequestInterception(false);
            page.removeAllListeners("request");
        }

        await new Promise((r) => setTimeout(r, 2000));
    }

    await browser.close();
    console.log("✅ All done.");
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
