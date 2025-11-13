import fs from "fs/promises";
import path from "path";

const CATEGORY_ORDER = [
    "animatics",
    "calli",
    "kiara",
    "ina",
    "gura",
    "ame",
    "irys",
    "kronii",
    "fauna",
    "moom",
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

const ALL_C1 = CATEGORY_ORDER.filter((cat) => cat !== "animatics");
const ALL_C2 = ALL_C1.filter(
    (cat) =>
        cat !== "ame" && cat !== "fauna" && cat !== "gura" && cat !== "moom",
);

interface ClipMetadata {
    id: string;
    originalUrl: string;
    title: string;
    thumbnailSrc: string;
    author: string;
    duration: number;
    uploadDate: string;
    categories: string[];
    chapter: number;
    contentType: "clip" | "stream";
}

interface OutputData {
    clips: ClipMetadata[];
    streams: ClipMetadata[];
}

interface MetadataCache {
    [videoId: string]: {
        title: string;
        author: string;
        thumbnailSrc: string;
        duration: number;
        uploadDate: string;
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

function extractCategoriesFromComment(comment: string): string[] {
    const categories = comment
        .replace(/<!--\s*/, "")
        .replace(/\s*-->/, "")
        .split(",")
        .map((cat) => cat.trim())
        .filter((cat) => cat.length > 0);

    if (categories.includes("all-c1")) {
        return ALL_C1;
    }
    if (categories.includes("all-c2")) {
        return ALL_C2;
    }

    return categories;
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

        try {
            const pageResponse = await fetch(
                `https://www.youtube.com/watch?v=${videoId}`,
            );
            const html = await pageResponse.text();

            const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
            if (durationMatch) {
                duration = parseInt(durationMatch[1]);
            }

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

function buildMetadataCache(existingData: OutputData): MetadataCache {
    const cache: MetadataCache = {};

    const allEntries = [...existingData.clips, ...existingData.streams];

    for (const entry of allEntries) {
        const videoId = extractVideoId(entry.originalUrl);
        if (videoId && !cache[videoId]) {
            cache[videoId] = {
                title: entry.title,
                author: entry.author,
                thumbnailSrc: entry.thumbnailSrc,
                duration: entry.duration,
                uploadDate: entry.uploadDate,
            };
        }
    }

    return cache;
}

async function processClipsFile(
    clipsPath: string,
    metadataCache: MetadataCache,
    locale: string,
): Promise<ClipMetadata[]> {
    const content = await fs.readFile(clipsPath, "utf-8");
    const lines = content.split("\n");

    const clips: ClipMetadata[] = [];
    let currentChapter = 1;
    let newClipsCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        const chapterMatch = line.match(/^###\s*Chapter\s*(\d+)/i);
        if (chapterMatch) {
            currentChapter = parseInt(chapterMatch[1]);
            console.log(`  📖 Processing Chapter ${currentChapter}`);
            continue;
        }

        if (!line || line.startsWith("#")) continue;

        const videoId = extractVideoId(line);
        if (!videoId) {
            continue;
        }

        let categories: string[] = [];
        if (i + 2 < lines.length) {
            const nextLine = lines[i + 2].trim();
            if (nextLine.startsWith("<!--") && nextLine.includes("-->")) {
                categories = extractCategoriesFromComment(nextLine);
                i++;
            }
        }

        if (categories.length === 0) {
            console.warn(
                `  ⚠️  No categories found for video: ${videoId}, skipping`,
            );
            continue;
        }

        if (!validateCategories(categories, videoId)) {
            console.warn(
                `  ❌ Skipping video ${videoId} due to invalid categories`,
            );
            continue;
        }

        let metadata = metadataCache[videoId];

        if (!metadata) {
            console.log(`  🔍 Fetching metadata for: ${videoId}`);
            const fetched = await fetchYouTubeMetadata(videoId);

            if (!fetched) {
                console.warn(`  ❌ Failed to fetch metadata for: ${videoId}`);
                continue;
            }

            metadata = fetched;
            metadataCache[videoId] = metadata;
            newClipsCount++;

            console.log(
                `  ✅ Added: "${metadata.title}" (${categories.join(", ")})`,
            );

            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const clipEntry: ClipMetadata = {
            id: `${locale}-${videoId}`,
            originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
            title: metadata.title,
            thumbnailSrc: metadata.thumbnailSrc,
            author: metadata.author,
            duration: metadata.duration,
            uploadDate: metadata.uploadDate,
            categories: categories,
            chapter: currentChapter,
            contentType: "clip",
        };

        clips.push(clipEntry);
    }

    if (newClipsCount > 0) {
        console.log(`  💾 Fetched ${newClipsCount} new clips`);
    }

    return clips;
}

async function processAnimaticsFile(
    animaticsPath: string,
    metadataCache: MetadataCache,
    locale: string,
): Promise<ClipMetadata[]> {
    const content = await fs.readFile(animaticsPath, "utf-8");
    const lines = content.split("\n");

    const animatics: ClipMetadata[] = [];
    let currentChapter = 1;
    let newAnimaticsCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        const chapterMatch = line.match(/^###\s*Chapter\s*(\d+)/i);
        if (chapterMatch) {
            currentChapter = parseInt(chapterMatch[1]);
            console.log(
                `  📖 Processing Chapter ${currentChapter} (Animatics)`,
            );
            continue;
        }

        if (!line || line.startsWith("#")) continue;

        const videoId = extractVideoId(line);
        if (!videoId) {
            console.warn(`  ⚠️  Invalid YouTube URL: ${line}`);
            continue;
        }

        let metadata = metadataCache[videoId];

        if (!metadata) {
            console.log(`  🔍 Fetching metadata for: ${videoId}`);
            const fetched = await fetchYouTubeMetadata(videoId);

            if (!fetched) {
                console.warn(`  ❌ Failed to fetch metadata for: ${videoId}`);
                continue;
            }

            metadata = fetched;
            metadataCache[videoId] = metadata;
            newAnimaticsCount++;

            console.log(`  ✅ Added: "${metadata.title}" (Animatics)`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const animaticEntry: ClipMetadata = {
            id: `${locale}-animatics-${videoId}`,
            originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
            title: metadata.title,
            thumbnailSrc: metadata.thumbnailSrc,
            author: metadata.author,
            duration: metadata.duration,
            uploadDate: metadata.uploadDate,
            categories: ["animatics"],
            chapter: currentChapter,
            contentType: "clip",
        };

        animatics.push(animaticEntry);
    }

    if (newAnimaticsCount > 0) {
        console.log(`  💾 Fetched ${newAnimaticsCount} new animatics`);
    }

    return animatics;
}

function validateCategories(categories: string[], videoId: string): boolean {
    const invalidCategories = categories.filter(
        (cat) =>
            !CATEGORY_ORDER.includes(cat) &&
            cat !== "all-c1" &&
            cat !== "all-c2" &&
            cat !== "highlight",
    );

    if (invalidCategories.length > 0) {
        console.warn(
            `  ⚠️  Invalid categories found for video ${videoId}: ${invalidCategories.join(", ")}`,
        );
        console.warn(`     Valid categories are: ${CATEGORY_ORDER.join(", ")}`);
        return false;
    }

    return true;
}

async function processStreamsFile(
    streamsPath: string,
    categoryName: string,
    metadataCache: MetadataCache,
    locale: string,
): Promise<ClipMetadata[]> {
    const content = await fs.readFile(streamsPath, "utf-8");
    const lines = content.split("\n").map((l) => l.trim());

    const streams: ClipMetadata[] = [];
    let currentChapter = 1;
    let newStreamsCount = 0;

    if (!CATEGORY_ORDER.includes(categoryName)) {
        console.warn(`  ⚠️  Invalid category in filename: ${categoryName}`);
        console.warn(`     Valid categories are: ${CATEGORY_ORDER.join(", ")}`);
        console.warn(`  ❌ Skipping file: ${streamsPath}`);
        return [];
    }

    for (const line of lines) {
        const chapterMatch = line.match(/^###\s*Chapter\s*(\d+)/i);
        if (chapterMatch) {
            currentChapter = parseInt(chapterMatch[1]);
            console.log(
                `  📖 Processing Chapter ${currentChapter} (${categoryName})`,
            );
            continue;
        }

        if (!line || line.startsWith("#")) continue;

        const videoId = extractVideoId(line);
        if (!videoId) {
            console.warn(`  ⚠️  Invalid YouTube URL: ${line}`);
            continue;
        }

        let metadata = metadataCache[videoId];

        if (!metadata) {
            console.log(`  🔍 Fetching metadata for: ${videoId}`);
            const fetched = await fetchYouTubeMetadata(videoId);

            if (!fetched) {
                console.warn(`  ❌ Failed to fetch metadata for: ${videoId}`);
                continue;
            }

            metadata = fetched;
            metadataCache[videoId] = metadata;
            newStreamsCount++;

            console.log(
                `  ✅ Added: "${metadata.title}" by ${metadata.author}`,
            );

            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const streamEntry: ClipMetadata = {
            id: `${locale}-${categoryName}-${videoId}`,
            originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
            title: metadata.title,
            thumbnailSrc: metadata.thumbnailSrc,
            author: metadata.author,
            duration: metadata.duration,
            uploadDate: metadata.uploadDate,
            categories: [categoryName],
            chapter: currentChapter,
            contentType: "stream",
        };

        streams.push(streamEntry);
    }

    if (newStreamsCount > 0) {
        console.log(`  💾 Fetched ${newStreamsCount} new streams`);
    }

    return streams;
}

function sortByCategory(items: ClipMetadata[]): ClipMetadata[] {
    return items.sort((a, b) => {
        const primaryCategoryA = a.categories[0];
        const primaryCategoryB = b.categories[0];

        const categoryIndexA = CATEGORY_ORDER.indexOf(primaryCategoryA);
        const categoryIndexB = CATEGORY_ORDER.indexOf(primaryCategoryB);

        if (categoryIndexA !== categoryIndexB) {
            if (categoryIndexA === -1) return 1;
            if (categoryIndexB === -1) return -1;
            return categoryIndexA - categoryIndexB;
        }

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

    try {
        await fs.access(baseDir);
    } catch {
        console.error(
            `❌ Directory not found: ${baseDir}\nPlease create it and add clips.md`,
        );
        process.exit(1);
    }

    const outPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        locale,
        `clips_${locale}.json`,
    );

    // Load existing output file to build metadata cache
    let existingData: OutputData = { clips: [], streams: [] };
    try {
        const existingContent = await fs.readFile(outPath, "utf-8");
        existingData = JSON.parse(existingContent);
        console.log(
            `📦 Loaded existing data with ${existingData.clips.length} clips and ${existingData.streams.length} streams\n`,
        );
    } catch {
        console.log(`📦 No existing output file found, starting fresh\n`);
    }

    // Build metadata cache from existing data
    const metadataCache = buildMetadataCache(existingData);
    console.log(
        `📦 Built metadata cache with ${Object.keys(metadataCache).length} videos\n`,
    );

    // Process clips.md
    console.log(`\n📁 Processing clips.md`);
    const clipsPath = path.join(baseDir, "clips.md");
    let allClips: ClipMetadata[] = [];
    try {
        allClips = await processClipsFile(clipsPath, metadataCache, locale);
        console.log(`  ✅ Total clips: ${allClips.length}`);
    } catch (error) {
        console.error(`❌ Error processing clips.md:`, error);
    }

    // Process animatics.md
    console.log(`\n📁 Processing animatics.md`);
    const animaticsPath = path.join(baseDir, "animatics.md");
    let allAnimatics: ClipMetadata[] = [];
    try {
        allAnimatics = await processAnimaticsFile(
            animaticsPath,
            metadataCache,
            locale,
        );
        console.log(`  ✅ Total animatics: ${allAnimatics.length}`);
    } catch (error) {
        console.error(`❌ Error processing animatics.md:`, error);
    }

    const combinedClips = [...allClips, ...allAnimatics];

    // Process stream files from category directories
    const categoryDirs = (await fs.readdir(baseDir, { withFileTypes: true }))
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

    let allStreams: ClipMetadata[] = [];

    for (const categoryDir of categoryDirs) {
        const categoryPath = path.join(baseDir, categoryDir);
        const files = (await fs.readdir(categoryPath, { withFileTypes: true }))
            .filter((d) => d.isFile() && d.name.endsWith("-streams.md"))
            .map((d) => d.name);

        for (const fileName of files) {
            const categoryName = path.basename(fileName, "-streams.md");
            const filePath = path.join(categoryPath, fileName);

            console.log(
                `\n📁 Processing: ${categoryDir}/${categoryName} streams`,
            );

            const streams = await processStreamsFile(
                filePath,
                categoryName,
                metadataCache,
                locale,
            );

            allStreams.push(...streams);

            console.log(`  ✅ Total: ${streams.length} streams`);
        }
    }

    // Sort by category order, then by upload date (newest first) within each category
    const sortedClips = sortByCategory(combinedClips);
    const sortedStreams = sortByCategory(allStreams);

    const outputData = {
        clips: sortedClips,
        streams: sortedStreams,
    };

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(outputData, null, 2), "utf-8");

    console.log(
        `\n✅ Successfully processed ${sortedClips.length} clips and ${sortedStreams.length} streams`,
    );
    console.log(`📁 Output: ${outPath}`);

    console.log(
        `\n📊 Clips breakdown by primary category (sorted by CATEGORY_ORDER):`,
    );
    const clipsCategoryCounts = sortedClips.reduce(
        (acc, clip) => {
            const primaryCategory = clip.categories[0];
            acc[primaryCategory] = (acc[primaryCategory] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    CATEGORY_ORDER.concat("animatics").forEach((category) => {
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
            const primaryCategory = stream.categories[0];
            acc[primaryCategory] = (acc[primaryCategory] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

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
