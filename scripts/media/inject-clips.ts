import fs from "fs/promises";
import path from "path";

interface ClipMetadata {
    id: string;
    originalUrl: string;
    title: string;
    thumbnailSrc: string;
    author: string;
    duration: number;
    category: string;
    chapter: number;
}

interface ClipsCache {
    [videoId: string]: {
        title: string;
        author: string;
        thumbnailSrc: string;
        duration: number;
        fetchedAt: string;
    };
}

function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

async function fetchYouTubeMetadata(videoId: string): Promise<{
    title: string;
    author: string;
    thumbnailSrc: string;
    duration: number;
} | null> {
    try {
        const response = await fetch(
            `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`,
        );

        if (!response.ok) {
            console.warn(`Failed to fetch metadata for ${videoId}`);
            return null;
        }

        const data = await response.json();

        let duration = 0;

        // Try to get duration from video page metadata since noembed doesn't provide it
        try {
            const pageResponse = await fetch(
                `https://www.youtube.com/watch?v=${videoId}`,
            );
            const html = await pageResponse.text();

            // Look for duration in seconds from meta tags or JSON-LD
            const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
            if (durationMatch) {
                duration = parseInt(durationMatch[1]);
            }
        } catch {
            console.warn(`  Could not fetch duration for ${videoId}`);
        }

        const thumbnailSrc = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

        return {
            title: data.title || "Unknown Title",
            author: data.author_name || "Unknown Author",
            thumbnailSrc,
            duration,
        };
    } catch (error) {
        console.error(`Error fetching metadata for ${videoId}:`, error);
        return null;
    }
}

async function processCategoryFile(
    categoryPath: string,
    categoryName: string,
    globalCache: ClipsCache,
): Promise<ClipMetadata[]> {
    const content = await fs.readFile(categoryPath, "utf-8");
    const lines = content.split("\n").map((l) => l.trim());

    const clips: ClipMetadata[] = [];
    let currentChapter = 1;
    let newClipsCount = 0;

    for (const line of lines) {
        // Check for chapter headers
        const chapterMatch = line.match(/^##\s*Chapter\s*(\d+)/i);
        if (chapterMatch) {
            currentChapter = parseInt(chapterMatch[1]);
            continue;
        }

        if (!line || line.startsWith("#")) continue;

        const videoId = extractVideoId(line);
        if (!videoId) {
            console.warn(`  ⚠️  Invalid YouTube URL: ${line}`);
            continue;
        }

        let metadata = globalCache[videoId];

        if (!metadata) {
            // Fetch new metadata
            const fetched = await fetchYouTubeMetadata(videoId);

            if (!fetched) {
                console.warn(`  ❌ Failed to fetch metadata for: ${videoId}`);
                continue;
            }

            metadata = {
                ...fetched,
                fetchedAt: new Date().toISOString(),
            };

            globalCache[videoId] = metadata;
            newClipsCount++;

            // Rate limiting to avoid being blocked
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
            console.log(`  ♻️  Using cached: ${videoId}`);
        }

        clips.push({
            id: videoId,
            originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
            title: metadata.title,
            thumbnailSrc: metadata.thumbnailSrc,
            author: metadata.author,
            duration: metadata.duration,
            category: categoryName,
            chapter: currentChapter,
        });
    }

    return clips;
}

async function main() {
    const baseDir = path.resolve(process.cwd(), "clips-data");
    const cacheFile = path.join(baseDir, ".clips-cache.json");

    try {
        await fs.access(baseDir);
    } catch {
        console.error(
            `❌ Directory not found: ${baseDir}\nPlease create it and add category markdown files.`,
        );
        process.exit(1);
    }

    let globalCache: ClipsCache = {};
    try {
        const cacheContent = await fs.readFile(cacheFile, "utf-8");
        globalCache = JSON.parse(cacheContent);
    } catch {}

    const files = (await fs.readdir(baseDir, { withFileTypes: true }))
        .filter((d) => d.isFile() && d.name.endsWith(".md"))
        .map((d) => d.name);

    if (files.length === 0) {
        process.exit(1);
    }

    const allClips: ClipMetadata[] = [];
    let totalNewClips = 0;

    for (const fileName of files) {
        const categoryName = path.basename(fileName, ".md");
        const categoryPath = path.join(baseDir, fileName);

        console.log(`\n📁 Processing category: ${categoryName}`);

        const beforeCount = Object.keys(globalCache).length;
        const clips = await processCategoryFile(
            categoryPath,
            categoryName,
            globalCache,
        );
        const afterCount = Object.keys(globalCache).length;
        const newInCategory = afterCount - beforeCount;

        allClips.push(...clips);
        totalNewClips += newInCategory;

        console.log(`  ✅ Total clips in ${categoryName}: ${clips.length}`);
    }

    await fs.writeFile(
        cacheFile,
        JSON.stringify(globalCache, null, 2),
        "utf-8",
    );

    allClips.sort((a, b) => {
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return a.title.localeCompare(b.title);
    });

    // Only need EN since there's no content for JA
    // _ja version can be made manually
    const outPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        "en",
        "clips_en.json",
    );

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(allClips, null, 2), "utf-8");

    console.log(`\n✅ Successfully processed ${allClips.length} total clips`);
    console.log(`   🆕 ${totalNewClips} new clips fetched this run`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
