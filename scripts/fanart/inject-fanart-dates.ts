import fs from "fs/promises";
import path from "path";

const FANART_JSON = path.resolve(
    process.cwd(),
    "apps/website/data/fanart.json",
);
const FAILED_DATES_MD = path.resolve(process.cwd(), "failed_dates.md");

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
    postDate?: string;
}

interface FailedEntry {
    url: string;
    reason: string;
}

// Twitter Snowflake epoch: Nov 4, 2010 01:42:54.657 UTC
const TWITTER_EPOCH = 1288834974657n;

// Extract tweet status ID from an x.com or twitter.com URL
function extractStatusId(url: string): string | null {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
}

// Derive ISO date directly from the Snowflake ID — no network needed.
// Works for all tweets posted after Nov 2010 (when Snowflake IDs were introduced).
function snowflakeToDate(statusId: string): string {
    const id = BigInt(statusId);
    const timestampMs = (id >> 22n) + TWITTER_EPOCH;
    return new Date(Number(timestampMs)).toISOString();
}

// Fallback: fetch date from the free FxTwitter API (no login required).
// Used only when the status ID can't be extracted from the URL.
async function fetchDateFromFxTwitter(url: string): Promise<string | null> {
    const match = url.match(/(?:x\.com|twitter\.com)\/([^/]+)\/status\/(\d+)/);
    if (!match) return null;

    const [, username, statusId] = match;
    const apiUrl = `https://api.fxtwitter.com/${username}/status/${statusId}`;

    try {
        const res = await fetch(apiUrl, {
            headers: { "User-Agent": "fanart-date-fetcher/1.0" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const ts = data?.tweet?.created_timestamp;
        if (!ts) throw new Error("No created_timestamp in response");
        return new Date(ts * 1000).toISOString();
    } catch (err: any) {
        throw new Error(`FxTwitter API failed: ${err.message}`);
    }
}

async function getPostDate(url: string): Promise<string> {
    const statusId = extractStatusId(url);

    if (statusId) {
        // Fast path: decode directly from the Snowflake ID, no network needed
        return snowflakeToDate(statusId);
    }

    // Slow path: status ID not in URL (shouldn't normally happen), hit the API
    console.log(
        `  ⚠ No status ID in URL, falling back to FxTwitter API: ${url}`,
    );
    const date = await fetchDateFromFxTwitter(url);
    if (!date) throw new Error("Could not extract date via any method");
    return date;
}

async function writeFailedDates(failed: FailedEntry[]): Promise<void> {
    if (failed.length === 0) return;
    const timestamp = new Date().toISOString();
    const lines = [
        `# Failed Date Lookups`,
        ``,
        `Generated: ${timestamp}`,
        ``,
        ...failed.map((f) => `- ${f.url}\n  - Reason: ${f.reason}`),
        ``,
    ];
    await fs.writeFile(FAILED_DATES_MD, lines.join("\n"), "utf-8");
    console.log(
        `\n⚠ Wrote ${failed.length} failed entry(ies) to failed_dates.md`,
    );
}

async function main() {
    const fanartEntries: FanartEntry[] = JSON.parse(
        await fs.readFile(FANART_JSON, "utf-8"),
    );

    console.log(`📊 Processing ${fanartEntries.length} fanart entries...`);

    const blacklist = [
        "https://x.com/yppah1060/status/1830867181598580907",
        "https://x.com/diodio49/status/1832145126912590148",
        "https://x.com/daiyaekaku/status/1920683282439516582",
        "https://x.com/daiyaekaku/status/1923920501631578438",
        "https://x.com/yakimi27/status/1925898088876568829",
        "https://x.com/fukuinu_daddy/status/2058922197264294016",
        "https://x.com/legz0s/status/2058813041404457219",
        "https://x.com/dasdokter/status/2058789765709975701",
    ];

    let processedCount = 0;
    let skippedCount = 0;
    const failedEntries: FailedEntry[] = [];

    for (const entry of fanartEntries) {
        if (entry.postDate) {
            skippedCount++;
            continue;
        }

        if (blacklist.includes(entry.url)) {
            skippedCount++;
            continue;
        }

        try {
            const postDate = await getPostDate(entry.url);
            entry.postDate = postDate;
            processedCount++;
            console.log(`  ✅ ${entry.url} → ${postDate}`);
        } catch (err: any) {
            console.warn(`  ✖ Failed ${entry.url}: ${err.message}`);
            failedEntries.push({ url: entry.url, reason: err.message });
        }
    }

    await fs.writeFile(
        FANART_JSON,
        JSON.stringify(fanartEntries, null, 2),
        "utf-8",
    );

    await writeFailedDates(failedEntries);

    console.log(`\n✅ Updated ${processedCount} entries with dates`);
    console.log(
        `↻ Skipped ${skippedCount} entries (already had dates or blacklisted)`,
    );
    if (failedEntries.length > 0) {
        console.log(
            `✖ Failed ${failedEntries.length} entries (see failed_dates.md)`,
        );
    }
    console.log(`📊 Total entries: ${fanartEntries.length}`);
    console.log(`💾 Updated ${FANART_JSON}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
