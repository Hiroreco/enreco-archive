// scripts/download-tweet-images-puppeteer.ts
import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

const LINKS_JSON = path.resolve(process.cwd(), "/src/data/twitter-links.json");
const OUT_DIR = path.resolve(process.cwd(), "/shared-resources/images/fanart");
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

async function run() {
    const data: LinkEntry[] = JSON.parse(
        await fs.readFile(LINKS_JSON, "utf-8"),
    );
    await fs.mkdir(OUT_DIR, { recursive: true });

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

        // PRE-CHECK: skip if already downloaded
        const already = EXTENSIONS.some((ext) => {
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
        });
        if (already) {
            console.log(`↻ Skipping ${baseName} (already downloaded)`);
            continue;
        }

        console.log(`→ Visiting ${entry.url}`);
        try {
            await page.goto(entry.url, {
                waitUntil: "networkidle2",
                timeout: 60000,
            });
            await page.waitForSelector('article img[src*="twimg.com/media"]', {
                timeout: 10000,
            });

            const srcs: string[] = await page.$$eval(
                'article img[src*="twimg.com/media"]',
                (imgs) =>
                    Array.from(
                        new Set(imgs.map((i) => (i as HTMLImageElement).src)),
                    ),
            );

            if (srcs.length === 0) {
                console.warn(`  ⚠ No media images found at ${entry.url}`);
            }

            for (let i = 0; i < srcs.length; i++) {
                let rawUrl = srcs[i];
                const idx = i;

                // force high-res
                if (rawUrl.includes("name=")) {
                    rawUrl = rawUrl.replace(/name=[^&]*/, "name=orig");
                } else {
                    rawUrl += (rawUrl.includes("?") ? "&" : "?") + "name=orig";
                }

                const extMatch = rawUrl.match(/\.(jpg|png|gif)(?:\?|$)/i);
                const ext = extMatch ? extMatch[1] : "jpg";

                const fileName = `${baseName}-${idx}.${ext}`;
                const outPath = path.join(OUT_DIR, fileName);

                // If somehow we already have this specific image, skip it
                if (existsSync(outPath)) {
                    console.log(`  ↻ Skipping existing ${fileName}`);
                    continue;
                }

                console.log(
                    `  ↳ Downloading [${idx + 1}/${srcs.length}]: ${rawUrl}`,
                );
                const buffer = await downloadBuffer(rawUrl);
                await fs.writeFile(outPath, buffer);
                console.log(`  ✅ Saved ${fileName.toLowerCase()}`);
            }
        } catch (err: any) {
            console.warn(`  ✖ Failed ${entry.url}: ${err.message}`);
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
