import * as fs from "fs";
import puppeteer from "puppeteer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

interface FanficEntry {
    author: string;
    title: string;
    characters: string[];
    tags: string[];
    summary: string;
    src: string;
    storyKey: string; // R2 object key
}

// const r2 = new S3Client({
//     region: "auto",
//     endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
//     credentials: {
//         accessKeyId: process.env.R2_ACCESS_KEY_ID!,
//         secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
//     },
// });

const R2_BUCKET = process.env.R2_BUCKET_NAME || "fanfic";

function extractLinks(markdown: string): string[] {
    const urlRegex = /https:\/\/archiveofourown\.org\/works\/[^\s\)]+/g;
    return markdown.match(urlRegex) || [];
}

function getWorkIdFromUrl(url: string): string {
    const match = url.match(/works\/(\d+)/);
    return match ? match[1] : "";
}

// async function uploadToR2(content: string, key: string): Promise<void> {
//     const command = new PutObjectCommand({
//         Bucket: R2_BUCKET,
//         Key: key,
//         Body: content,
//         ContentType: "text/html",
//     });
//     await r2.send(command);
// }

async function scrapeFanfic(page: any, url: string): Promise<FanficEntry> {
    await page.goto(url, { waitUntil: "networkidle2" });
    const data = await page.evaluate(() => {
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
            ".preface .summary blockquote.userstuff",
        );
        const summary = summaryEl?.textContent?.trim() || "";
        const storyHtml: string[] = [];
        document
            .querySelectorAll("#chapters .userstuff")
            .forEach((el: Element) => {
                storyHtml.push(el.innerHTML);
            });
        return {
            title,
            author,
            characters,
            tags,
            summary,
            storyHtml: storyHtml.join("\n\n"),
        };
    });
    const workId = getWorkIdFromUrl(url);
    const storyKey = `stories/${workId}.html`;
    // console.log(`  📤 Uploading story to R2: ${storyKey}`);
    // await uploadToR2(data.storyHtml, storyKey);
    return {
        title: data.title,
        author: data.author,
        characters: data.characters,
        tags: data.tags,
        summary: data.summary,
        src: url,
        storyKey,
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
                console.log(`  ✓ "${entry.title}" by ${entry.author}`);
                await new Promise((resolve) => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`  ✗ Error processing ${url}:`, error);
            }
        }
        fs.writeFileSync(outputPath, JSON.stringify(fanfics, null, 2), "utf-8");
        console.log(
            `\nSuccessfully scraped ${fanfics.length} fanfics to fanfic-data/fanfics.json`,
        );
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
}

scrapeAO3Fanfics();
