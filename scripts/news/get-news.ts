import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

const NEWS_MD = path.resolve(process.cwd(), "apps", "news-data", "news.md");
const OUT_DIR = path.resolve(process.cwd(), "apps", "news-data", "entries");

async function extractTwitterLinks(mdPath: string): Promise<string[]> {
    const text = await fs.readFile(mdPath, "utf-8");
    const links: string[] = [];

    // Match Twitter/X links
    const LINK_RE =
        /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^\/]+\/status\/\d+/gi;

    let match;
    while ((match = LINK_RE.exec(text))) {
        links.push(match[0]);
    }

    return links;
}

async function scrapeNewsPost(url: string, page: any): Promise<any | null> {
    try {
        console.log(`→ Scraping ${url}`);

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 60000,
        });

        // Wait for the article to load
        await page.waitForSelector("article", { timeout: 10000 });

        // Extract post data
        const postData = await page.evaluate(() => {
            const article = document.querySelector("article");
            if (!article) return null;

            // Get post text/content
            const contentDiv = article.querySelector(
                '[data-testid="tweetText"]',
            );
            const content = contentDiv ? contentDiv.textContent || "" : "";

            // Get author
            const authorLink = article.querySelector(
                'a[href*="/"] [dir="ltr"]',
            );
            const author = authorLink ? authorLink.textContent || "" : "";

            // Get avatar - look for profile image within the article
            let avatarSrc = "";
            const avatarImg = article.querySelector(
                'img[src*="pbs.twimg.com/profile_images"]',
            );
            if (avatarImg) {
                avatarSrc = (avatarImg as HTMLImageElement).src;
                // Convert to _bigger size if it's not already
                avatarSrc = avatarSrc.replace(/_normal\./, "_bigger.");
                avatarSrc = avatarSrc.replace(/_mini\./, "_bigger.");
                avatarSrc = avatarSrc.replace(/_400x400\./, "_bigger.");
                // If it doesn't have a size suffix, add _bigger
                if (!avatarSrc.match(/_bigger\./)) {
                    avatarSrc = avatarSrc.replace(/\.([^.]+)$/, "_bigger.$1");
                }
            }

            // Get date
            const timeElement = article.querySelector("time");
            const datetime = timeElement
                ? timeElement.getAttribute("datetime")
                : null;

            // Get media (images or videos)
            const mediaImages = article.querySelectorAll(
                'img[src*="pbs.twimg.com/media"]',
            );
            const hasVideo = article.querySelector("video") !== null;

            let mediaSrc = "";
            let mediaType: "image" | "video" | "youtube" = "image";

            if (hasVideo) {
                mediaType = "video";
                const videoSource = article.querySelector("video source");
                mediaSrc = videoSource
                    ? videoSource.getAttribute("src") || ""
                    : "";
            } else if (mediaImages.length > 0) {
                mediaType = "image";
                const firstImage = mediaImages[0] as HTMLImageElement;
                mediaSrc = firstImage.src;
                // Force high-res
                if (mediaSrc.includes("name=")) {
                    mediaSrc = mediaSrc.replace(/name=[^&]*/, "name=orig");
                } else {
                    mediaSrc +=
                        (mediaSrc.includes("?") ? "&" : "?") + "name=orig";
                }
            }

            return {
                content,
                author,
                avatarSrc,
                datetime,
                mediaSrc,
                mediaType,
            };
        });

        if (!postData) {
            console.warn(`  ⚠ No post data found for ${url}`);
            return null;
        }

        console.log(`  ✅ Scraped: ${postData.author} - ${postData.datetime}`);
        return {
            content: postData.content,
            date: postData.datetime,
            author: postData.author,
            avatarSrc: postData.avatarSrc,
            mediaType: postData.mediaType,
            mediaSrc: postData.mediaSrc,
            src: url,
        };
    } catch (err: any) {
        console.warn(`  ✖ Failed to scrape ${url}: ${err.message}`);
        return null;
    }
}

function formatDateForFilename(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

async function saveAsMarkdown(postData: any, outDir: string): Promise<void> {
    const dateSlug = formatDateForFilename(postData.date);
    const filename = `news-${dateSlug}.md`;
    const filepath = path.join(outDir, filename);

    // Check if file already exists
    try {
        await fs.access(filepath);
        console.log(`  ↻ Skipping ${filename} (already exists)`);
        return;
    } catch {
        // File doesn't exist, continue
    }

    const lines = [
        `<!-- date: ${postData.date} -->`,
        `<!-- author: ${postData.author} -->`,
    ];

    // Add avatarSrc only if it exists
    if (postData.avatarSrc) {
        lines.push(`<!-- avatarSrc: ${postData.avatarSrc} -->`);
    }

    lines.push(
        `<!-- src: ${postData.src} -->`,
        `<!-- mediaType: ${postData.mediaType} -->`,
        `<!-- mediaSrc: ${postData.mediaSrc} -->`,
        "",
        postData.content,
    );

    await fs.writeFile(filepath, lines.join("\n"), "utf-8");
    console.log(`  💾 Saved ${filename}`);
}

async function main() {
    console.log("📰 Starting news scraper...");

    // Ensure output directory exists
    await fs.mkdir(OUT_DIR, { recursive: true });

    // Get list of existing markdown files
    const existingFiles = await fs.readdir(OUT_DIR);
    const existingCount = existingFiles.filter((f) =>
        f.startsWith("news-"),
    ).length;
    console.log(`📦 Found ${existingCount} existing news markdown files`);

    // Extract links from news.md
    const links = await extractTwitterLinks(NEWS_MD);
    console.log(`📊 Found ${links.length} Twitter/X links in news.md`);

    if (links.length === 0) {
        console.log("⚠ No links found. Exiting.");
        return;
    }

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

    let scrapedCount = 0;
    let skippedCount = 0;

    for (const link of links) {
        const postData = await scrapeNewsPost(link, page);

        if (postData) {
            const dateSlug = formatDateForFilename(postData.date);
            const filename = `news-${dateSlug}.md`;
            const filepath = path.join(OUT_DIR, filename);

            try {
                await fs.access(filepath);
                console.log(`  ↻ Skipping ${filename} (already exists)`);
                skippedCount++;
            } catch {
                await saveAsMarkdown(postData, OUT_DIR);
                scrapedCount++;
            }
        }

        // Throttle to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    await browser.close();

    console.log(`✅ Scraped ${scrapedCount} new news posts`);
    console.log(`↻ Skipped ${skippedCount} existing posts`);
    console.log(`📁 Saved to ${OUT_DIR}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
