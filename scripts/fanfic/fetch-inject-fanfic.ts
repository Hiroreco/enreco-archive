import * as fs from "fs";
import puppeteer from "puppeteer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

interface FanficChapter {
    number: number;
    title: string;
    storyKey: string;
    summary: string;
}

interface FanficEntry {
    author: string;
    title: string;
    characters: string[];
    tags: string[];
    summary: string;
    src: string;
    chapters: FanficChapter[];
    totalChapters: number;
}

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME || "fanfic";

function extractLinks(markdown: string): string[] {
    const urlRegex = /https:\/\/archiveofourown\.org\/works\/[^\s\)]+/g;
    return markdown.match(urlRegex) || [];
}

function getWorkIdFromUrl(url: string): string {
    const match = url.match(/works\/(\d+)/);
    return match ? match[1] : "";
}

async function uploadToR2(content: string, key: string): Promise<void> {
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: content,
        ContentType: "text/html",
    });
    await r2.send(command);
}

async function getChapterCount(page: any): Promise<number> {
    const chapterCount = await page.evaluate(() => {
        const chapterSelect = document.querySelector("#selected_id");
        if (chapterSelect) {
            const options = chapterSelect.querySelectorAll("option");
            return options.length;
        }
        return 1;
    });
    return chapterCount;
}

async function scrapeChapter(
    page: any,
    chapterUrl: string,
): Promise<{
    title: string;
    content: string;
    summary: string;
    nextChapterUrl: string | null;
}> {
    console.log(`    Fetching: ${chapterUrl}`);
    await page.goto(chapterUrl, { waitUntil: "networkidle2" });

    const data = await page.evaluate(() => {
        const chapterTitleEl = document.querySelector(
            ".chapter .title.heading",
        );
        const chapterTitle = chapterTitleEl?.textContent?.trim() || "";

        // Get chapter summary
        const chapterSummaryEl = document.querySelector(
            ".summary blockquote.userstuff",
        );
        let chapterSummary = chapterSummaryEl?.innerHTML.trim() || "";
        chapterSummary = chapterSummary.replace(
            /<\/p>(?!<p>&nbsp;<\/p>)/g,
            "</p><p>&nbsp;</p>",
        );

        // Target the specific div with role="article"
        const contentDiv = document.querySelector('div[role="article"]');

        let storyHtml = "";
        if (contentDiv) {
            // Remove the h3 landmark heading if it exists
            const landmarkHeading = contentDiv.querySelector(
                'h3.landmark.heading[id="work"]',
            );
            if (landmarkHeading) {
                landmarkHeading.remove();
            }

            storyHtml = contentDiv.innerHTML.replace(
                /<\/p>(?!<p>&nbsp;<\/p>)/g,
                "</p><p>&nbsp;</p>",
            );
        }

        // Find the "Next Chapter" link
        let nextChapterHref: string | null = null;

        // Look for all chapter links
        const allChapterLinks = Array.from(
            document.querySelectorAll('a[href*="/chapters/"]'),
        );

        console.log(`Found ${allChapterLinks.length} chapter links`);

        // Find the one with "Next Chapter" text
        for (const link of allChapterLinks) {
            const text = link.textContent?.trim() || "";
            console.log(
                `Link text: "${text}", href: ${link.getAttribute("href")}`,
            );

            if (
                text.toLowerCase().includes("next chapter") ||
                text === "Next Chapter →" ||
                text.includes("→")
            ) {
                nextChapterHref = link.getAttribute("href");
                console.log(`Found next chapter link: ${nextChapterHref}`);
                break;
            }
        }

        return {
            title: chapterTitle,
            content: storyHtml,
            summary: chapterSummary,
            nextChapterUrl: nextChapterHref,
        };
    });

    // Log on Node side as well
    console.log(`    Next chapter URL: ${data.nextChapterUrl || "None found"}`);
    console.log(`    Chapter summary: ${data.summary ? "Found" : "None"}`);

    return data;
}

async function scrapeFanfic(page: any, url: string): Promise<FanficEntry> {
    // Navigate to the first chapter
    await page.goto(url, { waitUntil: "networkidle2" });

    const metadata = await page.evaluate(() => {
        const titleEl = document.querySelector(".preface .title");
        const title = titleEl?.textContent?.trim() || "";

        const authorEl = document.querySelector(
            '.preface .byline a[rel="author"]',
        );
        const author = authorEl?.textContent?.trim() || "";

        const characters: string[] = [];
        document
            .querySelectorAll("dd.character.tags a.tag")
            .forEach((el: Element) => {
                characters.push(el.textContent?.trim() || "");
            });

        const tags: string[] = [];
        document
            .querySelectorAll("dd.freeform.tags a.tag")
            .forEach((el: Element) => {
                tags.push(el.textContent?.trim() || "");
            });

        const summaryEl = document.querySelector(
            ".summary blockquote.userstuff",
        );
        let summary = summaryEl?.innerHTML.trim() || "";
        summary = summary.replace(
            /<\/p>(?!<p>&nbsp;<\/p>)/g,
            "</p><p>&nbsp;</p>",
        );

        return {
            title,
            author,
            characters,
            tags,
            summary,
        };
    });

    const totalChapters = await getChapterCount(page);
    console.log(`  📚 Found ${totalChapters} chapter(s)`);

    const workId = getWorkIdFromUrl(url);
    const chapters: FanficChapter[] = [];

    let currentChapterUrl: string | null = url;
    let chapterNum = 1;

    // Follow the chapter links until there are no more
    while (currentChapterUrl) {
        console.log(`  📖 Scraping chapter ${chapterNum}/${totalChapters}...`);

        const chapterData = await scrapeChapter(page, currentChapterUrl);
        const storyKey = `stories/${workId}/chapter-${chapterNum}.html`;

        console.log(`  📤 Uploading chapter ${chapterNum} to R2: ${storyKey}`);
        await uploadToR2(chapterData.content, storyKey);

        chapters.push({
            number: chapterNum,
            title: chapterData.title || `Chapter ${chapterNum}`,
            summary: chapterData.summary,
            storyKey,
        });

        // Move to next chapter if it exists
        if (chapterData.nextChapterUrl) {
            currentChapterUrl = `https://archiveofourown.org${chapterData.nextChapterUrl}`;
            chapterNum++;
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
            // No more chapters
            currentChapterUrl = null;
        }
    }

    console.log(`  ✅ Scraped ${chapters.length} chapters total`);

    return {
        title: metadata.title,
        author: metadata.author,
        characters: metadata.characters,
        tags: metadata.tags,
        summary: chapters[0]?.summary || metadata.summary, // Use first chapter's summary or work summary
        src: url,
        chapters,
        totalChapters: chapters.length,
    };
}

async function scrapeAO3Fanfics() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    );

    try {
        const markdown = fs.readFileSync("fanfic-data/fanfics.md", "utf-8");
        const links = extractLinks(markdown);
        console.log(`Found ${links.length} AO3 links`);

        let fanfics: FanficEntry[] = [];
        const outputPath = "apps/website/data/en/fanfics.json";

        if (fs.existsSync(outputPath)) {
            const existingData = fs.readFileSync(outputPath, "utf-8");
            fanfics = JSON.parse(existingData);
            console.log(`Loaded ${fanfics.length} existing entries`);
        }

        const processedUrls = new Set(fanfics.map((f) => f.src));

        for (let i = 0; i < links.length; i++) {
            const url = links[i];

            if (processedUrls.has(url)) {
                console.log(
                    `Skipping ${i + 1}/${links.length}: ${url} (already processed)`,
                );
                continue;
            }

            console.log(`Processing ${i + 1}/${links.length}: ${url}`);

            try {
                const entry = await scrapeFanfic(page, url);
                fanfics.push(entry);
                processedUrls.add(url);
                console.log(
                    `  ✓ "${entry.title}" by ${entry.author} (${entry.totalChapters} chapters)`,
                );

                await new Promise((resolve) => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`  ✗ Error processing ${url}:`, error);
            }
        }

        fs.writeFileSync(outputPath, JSON.stringify(fanfics, null, 2), "utf-8");
        console.log(
            `\nSuccessfully scraped ${fanfics.length} fanfics to ${outputPath}`,
        );
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
}

scrapeAO3Fanfics();
