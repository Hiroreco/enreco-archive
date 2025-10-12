import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

const FANART_JSON = path.resolve(
    process.cwd(),
    "apps/website/data/fanart.json",
);

interface FanartEntry {
    url: string;
    label: string;
    author: string;
    chapter: number;
    day: number;
    characters: string[];
    images: Array<{
        src: string;
        width: number;
        height: number;
        type: "image";
    }>;
    videos: Array<{ src: string; type: "video" }>;
    type: "art" | "meme";
    postDate?: string; // ISO date string
}

async function getPostDate(url: string, page: any): Promise<string | null> {
    try {
        console.log(`→ Fetching date for ${url}`);

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 30000,
        });

        // Wait for the time element to be present
        await page.waitForSelector("time[datetime]", { timeout: 10000 });

        // Extract the datetime attribute from the time element
        const datetime = await page.evaluate(() => {
            const timeElement = document.querySelector("time[datetime]");
            return timeElement ? timeElement.getAttribute("datetime") : null;
        });

        if (datetime) {
            console.log(`  ✅ Found date: ${datetime}`);
            return datetime;
        } else {
            console.warn(`  ⚠ No datetime found for ${url}`);
            return null;
        }
    } catch (err: any) {
        console.warn(`  ✖ Failed to get date for ${url}: ${err.message}`);
        return null;
    }
}

async function main() {
    // Load existing fanart data
    const fanartEntries: FanartEntry[] = JSON.parse(
        await fs.readFile(FANART_JSON, "utf-8"),
    );

    console.log(`📊 Processing ${fanartEntries.length} fanart entries...`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/120.0.0.0 Safari/537.36",
    );

    const blacklist = [
        "https://x.com/yppah1060/status/1830867181598580907",
        "https://x.com/diodio49/status/1832145126912590148",
        "https://x.com/daiyaekaku/status/1920683282439516582",
        "https://x.com/daiyaekaku/status/1923920501631578438",
        "https://x.com/yakimi27/status/1925898088876568829",
    ];

    let processedCount = 0;
    let skippedCount = 0;

    for (const entry of fanartEntries) {
        // Skip if already has postDate
        if (entry.postDate) {
            console.log(
                `↻ Skipping ${entry.url} (already has date: ${entry.postDate})`,
            );
            skippedCount++;
            continue;
        }

        // Skip blacklisted URLs
        if (blacklist.includes(entry.url)) {
            console.log(`⚠ Skipping blacklisted URL: ${entry.url}`);
            skippedCount++;
            continue;
        }

        const postDate = await getPostDate(entry.url, page);

        if (postDate) {
            entry.postDate = postDate;
            processedCount++;
        }

        // Throttle requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    await browser.close();

    // Sort by postDate (newest first, then by existing sorting for entries without dates)

    // Write back to fanart.json
    await fs.writeFile(
        FANART_JSON,
        JSON.stringify(fanartEntries, null, 2),
        "utf-8",
    );

    console.log(`✅ Updated ${processedCount} entries with dates`);
    console.log(`↻ Skipped ${skippedCount} entries (already had dates)`);
    console.log(`📊 Sorted ${fanartEntries.length} total entries by date`);
    console.log(`💾 Updated ${FANART_JSON}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
