import fs from "fs/promises";
import path from "path";
import { NewsData } from "@enreco-archive/common/types";

const NEWS_DIR = path.resolve(process.cwd(), "apps", "news-data", "entries");
const OUT_JSON = path.resolve(
    process.cwd(),
    "apps",
    "website",
    "data",
    "news.json",
);

function extractMetadata(content: string, key: string): string | null {
    const pattern = new RegExp(`<!--\\s*${key}:\\s*(.+?)\\s*-->`, "i");
    const match = content.match(pattern);
    return match ? match[1].trim() : null;
}

function extractContent(markdown: string): string {
    // Remove all comment lines and get the content after them
    const lines = markdown.split(/\r?\n/);
    const contentLines: string[] = [];
    let pastComments = false;

    for (const line of lines) {
        if (line.trim().startsWith("<!--") && line.trim().endsWith("-->")) {
            continue; // Skip comment lines
        }
        if (line.trim() === "" && !pastComments) {
            pastComments = true;
            continue; // Skip the blank line after comments
        }
        if (pastComments) {
            contentLines.push(line);
        }
    }

    return contentLines.join("\n").trim();
}

async function parseNewsMarkdown(filePath: string): Promise<NewsData | null> {
    try {
        const content = await fs.readFile(filePath, "utf-8");

        const date = extractMetadata(content, "date");
        const author = extractMetadata(content, "author");
        const avatarSrc = extractMetadata(content, "avatarSrc");
        const src = extractMetadata(content, "src");
        const mediaType = extractMetadata(content, "mediaType") as
            | "image"
            | "video"
            | "youtube";
        const mediaSrc = extractMetadata(content, "mediaSrc");
        const chapterStr = extractMetadata(content, "chapter");
        const category = extractMetadata(content, "category");

        if (!date || !author || !src) {
            console.warn(`⚠ Missing required metadata in ${filePath}`);
            return null;
        }

        const newsContent = extractContent(content);

        const newsData: NewsData = {
            content: newsContent,
            avatarSrc: avatarSrc || "",
            date: date,
            author,
            media: {
                type: mediaType || "image",
                src: mediaSrc || "",
            },
            src,
            chapter: chapterStr ? parseInt(chapterStr, 10) : 0,
            category: (category as NewsData["category"]) || "all",
        };

        return newsData;
    } catch (err: any) {
        console.warn(`✖ Failed to parse ${filePath}: ${err.message}`);
        return null;
    }
}

async function main() {
    console.log("📰 Starting news injection...");

    // Check if news directory exists
    try {
        await fs.access(NEWS_DIR);
    } catch {
        console.error(`❌ News directory not found: ${NEWS_DIR}`);
        process.exit(1);
    }

    // Read all markdown files
    const files = await fs.readdir(NEWS_DIR);
    const markdownFiles = files.filter(
        (f) => f.startsWith("news-") && f.endsWith(".md"),
    );

    console.log(`📊 Found ${markdownFiles.length} news markdown files`);

    const newsData: NewsData[] = [];

    for (const file of markdownFiles) {
        const filePath = path.join(NEWS_DIR, file);
        const news = await parseNewsMarkdown(filePath);

        if (news) {
            newsData.push(news);
        }
    }

    // Sort by date (newest first)
    newsData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Ensure output directory exists
    await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });

    // Write to news.json
    await fs.writeFile(OUT_JSON, JSON.stringify(newsData, null, 2), "utf-8");

    console.log(`✅ Injected ${newsData.length} news entries`);
    console.log(`💾 Saved to ${OUT_JSON}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
