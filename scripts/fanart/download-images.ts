import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
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

interface FxTwitterPhoto {
    url: string;
    width: number;
    height: number;
}

interface FxTwitterVideo {
    url: string;
    type: string;
}

interface FxTwitterMedia {
    photos?: FxTwitterPhoto[];
    videos?: FxTwitterVideo[];
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

// Fetch media URLs from the FxTwitter API (no login required)
async function fetchMediaFromFxTwitter(
    tweetUrl: string,
): Promise<FxTwitterMedia | null> {
    const match = tweetUrl.match(
        /(?:x\.com|twitter\.com)\/([^/]+)\/status\/(\d+)/,
    );
    if (!match) return null;

    const [, username, statusId] = match;
    const apiUrl = `https://api.fxtwitter.com/${username}/status/${statusId}`;

    const res = await fetch(apiUrl, {
        headers: { "User-Agent": "fanart-downloader/1.0" },
    });
    if (!res.ok)
        throw new Error(`FxTwitter API returned ${res.status} for ${tweetUrl}`);

    const data = await res.json();
    return (data?.tweet?.media as FxTwitterMedia) ?? null;
}

async function run() {
    const data: LinkEntry[] = JSON.parse(
        await fs.readFile(LINKS_JSON, "utf-8"),
    );
    await fs.mkdir(OUT_DIR, { recursive: true });
    await fs.mkdir(VIDEO_CHECK_DIR, { recursive: true });

    const downloadedVideos = await loadDownloadedVideos();
    const failedDownloads: FailedEntry[] = [];

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
        const blacklist: string[] = [];
        if (blacklist.includes(entry.url)) {
            console.log(`↻ Skipping ${entry.url} (blacklisted)`);
            continue;
        }

        console.log(`→ Fetching ${entry.url}`);

        try {
            const media = await fetchMediaFromFxTwitter(entry.url);

            const photos = media?.photos ?? [];
            const videos = media?.videos ?? [];

            console.log(
                `Found ${photos.length} images${videos.length > 0 ? ` and ${videos.length} video(s)` : ""}`,
            );

            let mediaIndex = 0;

            for (const photo of photos) {
                // FxTwitter already returns original-resolution URLs
                const imageUrl = photo.url;

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

            if (videos.length > 0 && !SKIP_VIDEOS) {
                const videoFileName = `${baseName}-${mediaIndex}.mp4`;
                const videoOutPath = path.join(VIDEO_OUT_DIR, videoFileName);

                if (downloadedVideos.has(entry.url)) {
                    console.log(
                        `  ↻ Skipping already-logged video for ${entry.url}`,
                    );
                } else {
                    // Try to download via direct URL first; fall back to yt-dlp
                    const videoUrl = videos[0].url;
                    console.log(`  ↳ Downloading video: ${videoUrl}`);
                    try {
                        const buffer = await downloadBuffer(videoUrl);
                        await fs.mkdir(VIDEO_OUT_DIR, { recursive: true });
                        await fs.writeFile(videoOutPath, buffer);
                        console.log(`  ✅ Saved ${videoFileName}`);
                        await markVideoDownloaded(entry.url);
                        downloadedVideos.add(entry.url);
                    } catch {
                        // Direct fetch failed — fall back to yt-dlp using the original tweet URL
                        console.log(
                            `  ↳ Direct fetch failed, trying yt-dlp...`,
                        );
                        try {
                            await downloadVideoWithYtDlp(
                                entry.url,
                                videoOutPath,
                            );

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
            }

            if (photos.length === 0 && videos.length === 0) {
                console.warn(`  ⚠ No media found at ${entry.url}`);
            }
        } catch (err: any) {
            console.warn(`  ✖ Failed ${entry.url}: ${err.message}`);
            failedDownloads.push({
                url: entry.url,
                reason: err.message,
            });
        }

        await new Promise((r) => setTimeout(r, 500));
    }

    await writeFailedDownloads(failedDownloads);
    console.log("✅ All done.");
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
