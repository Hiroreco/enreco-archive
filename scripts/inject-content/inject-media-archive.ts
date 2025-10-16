import type {
    MediaEntry,
    RecollectionArchiveEntry,
} from "../../apps/website/src/components/view/recollection-archive/types.js";
import fs from "fs/promises";
import path from "path";

const CDN_PREFIX = "https://cdn.enreco-archive.net/";

// Type for index file metadata
type IndexMetadata = {
    title: string;
    entries: string[];
    description?: string;
};

// Type for media file metadata
type MediaMetadata = {
    title: string;
    type: "video" | "image" | "youtube";
    originalUrl?: string;
};

// Recursively collect all file paths under `dir`
async function walkDir(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            files.push(...(await walkDir(full)));
        } else if (ent.isFile() && ent.name.endsWith(".md")) {
            files.push(full);
        }
    }
    return files;
}

// Parse metadata from markdown comments
function parseMetadata(content: string): Record<string, string> {
    const lines = content.split(/\r?\n/);
    const metadata: Record<string, string> = {};

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("<!--")) continue;
        const match = trimmed.match(/^<!--\s*(\w+)\s*:\s*(.*?)\s*-->$/);
        if (!match) continue;
        const [, key, val] = match;
        metadata[key] = val;
    }

    return metadata;
}

// Get content after metadata comments
function getContent(raw: string): string {
    const lines = raw.split(/\r?\n/);
    let idx = 0;
    while (idx < lines.length && lines[idx].trim().startsWith("<!--")) idx++;
    if (lines[idx]?.trim() === "") idx++;
    return lines.slice(idx).join("\n").trim();
}

// Process a single entry directory (e.g., recollections)
async function processEntry(
    entryDir: string,
    chapterNum: number,
    category: string,
    entryId: string,
): Promise<RecollectionArchiveEntry | null> {
    const mdPaths = await walkDir(entryDir);

    // Find index file
    const indexPath = mdPaths.find((p) =>
        path.basename(p, ".md").endsWith("-index"),
    );
    if (!indexPath) {
        console.warn(`No index file found in ${entryDir}`);
        return null;
    }

    // Parse index metadata
    const indexRaw = await fs.readFile(indexPath, "utf-8");
    const indexMeta = parseMetadata(indexRaw);
    const indexContent = getContent(indexRaw);

    const title = indexMeta.title || entryId;
    const description = indexMeta.description || "";
    const entryList = indexMeta.entries?.split(",").map((s) => s.trim()) || [];
    const info = indexContent || "";

    // Process media files
    const mediaEntries: MediaEntry[] = [];
    const mediaPaths = mdPaths.filter(
        (p) => !path.basename(p, ".md").endsWith("-index"),
    );

    for (const mediaPath of mediaPaths) {
        const mediaId = path
            .basename(mediaPath, ".md")
            .replace(/(_jp|_ja)$/i, "")
            .replace(/-jp$|-ja$/i, "");

        // Skip if not in entry list (if entry list exists)
        if (entryList.length > 0 && !entryList.includes(mediaId)) {
            continue;
        }

        const mediaRaw = await fs.readFile(mediaPath, "utf-8");
        const mediaMeta = parseMetadata(mediaRaw);
        const mediaContent = getContent(mediaRaw);

        const mediaType = (mediaMeta.type || "image") as
            | "video"
            | "image"
            | "youtube";
        const mediaTitle = mediaMeta.title || mediaId;
        const originalUrl = mediaMeta.originalUrl || "";

        // Construct paths for thumbnails and sources
        const thumbnailUrl = `/images-opt/${mediaId}-opt-thumb.webp`;
        const src =
            mediaType === "video"
                ? `${CDN_PREFIX}/${mediaId}-opt.mp4`
                : mediaType === "youtube"
                  ? originalUrl
                  : `/images-opt/${mediaId}-opt.webp`;

        mediaEntries.push({
            title: mediaTitle,
            originalUrl,
            thumbnailUrl,
            info: mediaContent,
            src,
            type: mediaType,
        });
    }

    // Sort media entries by the order in index file
    if (entryList.length > 0) {
        mediaEntries.sort((a, b) => {
            const aIndex = entryList.findIndex(
                (id) => a.src.includes(id) || a.thumbnailUrl.includes(id),
            );
            const bIndex = entryList.findIndex(
                (id) => b.src.includes(id) || b.thumbnailUrl.includes(id),
            );
            return aIndex - bIndex;
        });
    }

    return {
        id: `${category}-${entryId}`,
        title,
        description,
        info,
        chapter: chapterNum,
        category,
        entries: mediaEntries,
    };
}

async function main() {
    const locale = process.argv[2] || "en";
    const baseDir = path.resolve(
        process.cwd(),
        locale === "en" ? "recap-data" : `recap-data_${locale}`,
        "media-archive",
    );

    let chapterDirs: string[];
    try {
        chapterDirs = (await fs.readdir(baseDir, { withFileTypes: true }))
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
    } catch {
        console.error(`Directory not found: ${baseDir}`);
        process.exit(1);
    }

    const allEntries: RecollectionArchiveEntry[] = [];

    for (const chapterDir of chapterDirs) {
        // Extract chapter number from directory name (e.g., "chapter1" -> 1)
        const chapterMatch = chapterDir.match(/chapter(\d+)/i);
        if (!chapterMatch) {
            console.warn(`Skipping non-chapter directory: ${chapterDir}`);
            continue;
        }
        const chapterNum = parseInt(chapterMatch[1], 10);

        const chapterPath = path.join(baseDir, chapterDir);
        const categoryDirs = (
            await fs.readdir(chapterPath, { withFileTypes: true })
        )
            .filter((d) => d.isDirectory())
            .map((d) => d.name);

        for (const categoryDir of categoryDirs) {
            const categoryPath = path.join(chapterPath, categoryDir);
            const entryDirs = (
                await fs.readdir(categoryPath, { withFileTypes: true })
            )
                .filter((d) => d.isDirectory())
                .map((d) => d.name);

            for (const entryDir of entryDirs) {
                const entryPath = path.join(categoryPath, entryDir);
                const entry = await processEntry(
                    entryPath,
                    chapterNum,
                    categoryDir,
                    entryDir,
                );

                if (entry) {
                    allEntries.push(entry);
                    console.log(
                        `✅ Processed entry: ${entry.id} (${entry.entries.length} media files)`,
                    );
                }
            }
        }
    }

    // Write output JSON
    const localeSuffix = `_${locale}`;
    const outPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        locale,
        `media-archive${localeSuffix}.json`,
    );

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(allEntries, null, 2), "utf-8");

    console.log(
        `\n✅ Successfully created media archive with ${allEntries.length} entries`,
    );
    console.log(`📁 Output: ${outPath}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
