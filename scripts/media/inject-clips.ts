import fs from "fs/promises";
import path from "path";

const CATEGORY_ORDER = [
    "calli",
    "kiara",
    "ina",
    "gura",
    "ame",
    "irys",
    "kronii",
    "fauna",
    "mumei",
    "bae",
    "shiori",
    "nerissa",
    "fuwawa",
    "mococo",
    "bijou",
    "liz",
    "raora",
    "gigi",
    "cecilia",
];

interface ClipMetadata {
    id: string;
    originalUrl: string;
    title: string;
    thumbnailSrc: string;
    author: string;
    duration: number;
    uploadDate: string;
    category: string;
    chapter: number;
    contentType: "clip" | "stream";
}

interface ClipsCache {
    [videoId: string]: {
        title: string;
        author: string;
        thumbnailSrc: string;
        duration: number;
        uploadDate: string;
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
    uploadDate: string;
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
        let uploadDate = "";

        // Try to get duration and upload date from video page metadata
        try {
            const pageResponse = await fetch(
                `https://www.youtube.com/watch?v=${videoId}`,
            );
            const html = await pageResponse.text();

            // Look for duration in seconds
            const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
            if (durationMatch) {
                duration = parseInt(durationMatch[1]);
            }

            // Look for upload date
            const uploadDateMatch = html.match(/"uploadDate":"([^"]+)"/);
            if (uploadDateMatch) {
                uploadDate = uploadDateMatch[1];
            }
        } catch {
            console.warn(
                `  Could not fetch duration/uploadDate for ${videoId}`,
            );
        }

        const thumbnailSrc = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

        return {
            title: data.title || "Unknown Title",
            author: data.author_name || "Unknown Author",
            thumbnailSrc,
            duration,
            uploadDate: uploadDate || new Date().toISOString(),
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
    locale: string,
): Promise<{ clips: ClipMetadata[]; streams: ClipMetadata[] }> {
    const content = await fs.readFile(categoryPath, "utf-8");
    const lines = content.split("\n").map((l) => l.trim());

    const clips: ClipMetadata[] = [];
    const streams: ClipMetadata[] = [];
    let currentChapter = 1;
    let currentContentType: "clip" | "stream" = "clip";
    let newClipsCount = 0;

    for (const line of lines) {
        // Check for content type sections
        if (line.match(/^##\s*Clips/i)) {
            currentContentType = "clip";
            continue;
        }
        if (line.match(/^##\s*Streams/i)) {
            currentContentType = "stream";
            continue;
        }

        // Check for chapter headers
        const chapterMatch = line.match(/^###\s*Chapter\s*(\d+)/i);
        if (chapterMatch) {
            currentChapter = parseInt(chapterMatch[1]);
            console.log(
                `  📖 Processing Chapter ${currentChapter} (${currentContentType})`,
            );
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
            console.log(`  🔍 Fetching metadata for: ${videoId}`);
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

            console.log(
                `  ✅ Added: "${metadata.title}" by ${metadata.author}`,
            );

            // Rate limiting to avoid being blocked
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
            console.log(`  ♻️  Using cached: ${videoId}`);
        }

        const clipEntry: ClipMetadata = {
            id: `${locale}-${categoryName}-${videoId}`,
            originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
            title: metadata.title,
            thumbnailSrc: metadata.thumbnailSrc,
            author: metadata.author,
            duration: metadata.duration,
            uploadDate: metadata.uploadDate,
            category: categoryName,
            chapter: currentChapter,
            contentType: currentContentType,
        };

        if (currentContentType === "clip") {
            clips.push(clipEntry);
        } else {
            streams.push(clipEntry);
        }
    }

    if (newClipsCount > 0) {
        console.log(`  💾 Added ${newClipsCount} new items to cache`);
    }

    return { clips, streams };
}

function sortByCategory(items: ClipMetadata[]): ClipMetadata[] {
    return items.sort((a, b) => {
        // First, sort by category order
        const categoryIndexA = CATEGORY_ORDER.indexOf(a.category);
        const categoryIndexB = CATEGORY_ORDER.indexOf(b.category);

        // If categories are different, sort by category order
        if (categoryIndexA !== categoryIndexB) {
            // Handle categories not in the order list (put them at the end)
            if (categoryIndexA === -1) return 1;
            if (categoryIndexB === -1) return -1;
            return categoryIndexA - categoryIndexB;
        }

        // If same category, sort by upload date (newest first)
        return (
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );
    });
}

async function main() {
    const locale = process.argv[2] || "en";
    const baseDir = path.resolve(
        process.cwd(),
        locale === "en" ? "clips-data" : `clips-data_${locale}`,
    );
    const cacheFile = path.join(baseDir, `.clips-cache_${locale}.json`);

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
        console.log(
            `📦 Loaded cache with ${Object.keys(globalCache).length} videos\n`,
        );
    } catch {
        console.log(`📦 Creating new cache file\n`);
    }

    const categoryDirs = (await fs.readdir(baseDir, { withFileTypes: true }))
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

    if (categoryDirs.length === 0) {
        console.error(
            `❌ No category directories found in ${baseDir}\nCreate directories like: clips-data/myth/`,
        );
        process.exit(1);
    }

    console.log(
        `🎬 Processing clips from ${categoryDirs.length} categories...\n`,
    );

    const allClips: ClipMetadata[] = [];
    const allStreams: ClipMetadata[] = [];
    let totalNewItems = 0;

    for (const categoryDir of categoryDirs) {
        const categoryPath = path.join(baseDir, categoryDir);
        const files = (await fs.readdir(categoryPath, { withFileTypes: true }))
            .filter((d) => d.isFile() && d.name.endsWith(".md"))
            .map((d) => d.name);

        for (const fileName of files) {
            const categoryName = path.basename(fileName, "-clips.md");
            const filePath = path.join(categoryPath, fileName);

            console.log(`\n📁 Processing: ${categoryDir}/${categoryName}`);

            const beforeCount = Object.keys(globalCache).length;
            const { clips, streams } = await processCategoryFile(
                filePath,
                categoryName,
                globalCache,
                locale,
            );
            const afterCount = Object.keys(globalCache).length;
            const newInFile = afterCount - beforeCount;

            allClips.push(...clips);
            allStreams.push(...streams);
            totalNewItems += newInFile;

            console.log(
                `  ✅ Total: ${clips.length} clips, ${streams.length} streams`,
            );
        }
    }

    await fs.writeFile(
        cacheFile,
        JSON.stringify(globalCache, null, 2),
        "utf-8",
    );
    console.log(
        `\n💾 Saved cache with ${Object.keys(globalCache).length} videos`,
    );

    // Sort by category order, then by upload date (newest first) within each category
    const sortedClips = sortByCategory(allClips);
    const sortedStreams = sortByCategory(allStreams);

    const outputData = {
        clips: sortedClips,
        streams: sortedStreams,
    };

    const outPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        locale,
        `clips_${locale}.json`,
    );

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(outputData, null, 2), "utf-8");

    console.log(
        `\n✅ Successfully processed ${allClips.length} clips and ${allStreams.length} streams`,
    );
    console.log(`   🆕 ${totalNewItems} new items fetched this run`);
    console.log(`📁 Output: ${outPath}`);

    console.log(`\n📊 Clips breakdown by category (sorted by CATEGORY_ORDER):`);
    const clipsCategoryCounts = sortedClips.reduce(
        (acc, clip) => {
            acc[clip.category] = (acc[clip.category] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    // Display in category order
    CATEGORY_ORDER.forEach((category) => {
        const count = clipsCategoryCounts[category];
        if (count) {
            console.log(`   ${category}: ${count} clips`);
        }
    });

    console.log(
        `\n📊 Streams breakdown by category (sorted by CATEGORY_ORDER):`,
    );
    const streamsCategoryCounts = sortedStreams.reduce(
        (acc, stream) => {
            acc[stream.category] = (acc[stream.category] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    // Display in category order
    CATEGORY_ORDER.forEach((category) => {
        const count = streamsCategoryCounts[category];
        if (count) {
            console.log(`   ${category}: ${count} streams`);
        }
    });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
