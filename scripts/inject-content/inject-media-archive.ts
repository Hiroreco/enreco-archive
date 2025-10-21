import type {
    MediaEntry,
    RecollectionArchiveEntry,
} from "../../apps/website/src/components/view/recollection-archive/types.js";
import fs from "fs/promises";
import path from "path";

const CDN_PREFIX = "https://cdn.enreco-archive.net";

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

function getContent(raw: string): string {
    const lines = raw.split(/\r?\n/);
    let idx = 0;
    while (idx < lines.length && lines[idx].trim().startsWith("<!--")) idx++;
    if (lines[idx]?.trim() === "") idx++;
    return lines.slice(idx).join("\n").trim();
}

async function processEntry(
    entryDir: string,
    chapterNum: number,
    category: string,
    entryId: string,
): Promise<RecollectionArchiveEntry | null> {
    const mdPaths = await walkDir(entryDir);

    let indexPath: string | null = null;
    for (const p of mdPaths) {
        const base = path.basename(p, ".md");
        if (base.startsWith(entryId) && base.includes("-index")) {
            indexPath = p;
            break;
        }
    }

    if (!indexPath) {
        console.warn(`No index file found in ${entryDir}`);
        return null;
    }

    const indexRaw = await fs.readFile(indexPath, "utf-8");
    const indexMeta = parseMetadata(indexRaw);
    const indexContent = getContent(indexRaw);

    const title = indexMeta.title || entryId;
    const description = indexMeta.description || "";
    const entryList = indexMeta.entries?.split(",").map((s) => s.trim()) || [];
    const info = indexContent || "";

    // Determine the thumbnail for the entry
    const chapterPrefix = `c${chapterNum}-`;
    const thumbnailBase = indexMeta.thumbnail
        ? `${chapterPrefix}${indexMeta.thumbnail}`
        : `${chapterPrefix}recaps-index`;
    const thumbnailUrl = `/images-opt/${thumbnailBase}-opt.webp`;

    const mediaEntries: MediaEntry[] = [];
    const mediaPaths = mdPaths.filter(
        (p) => !path.basename(p, ".md").endsWith("-index"),
    );

    for (const mediaPath of mediaPaths) {
        const baseName = path.basename(mediaPath, ".md");
        const mediaId = `${chapterPrefix}${baseName}`;

        if (entryList.length > 0 && !entryList.includes(baseName)) {
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

        const mediaIdWithNoLocaleSuffix = mediaId.replace(/_([a-z]{2})$/, "");

        const mediaThumbnailUrl = `/images-opt/${mediaIdWithNoLocaleSuffix}-opt.webp`;
        const src =
            mediaType === "video"
                ? `${CDN_PREFIX}/${mediaIdWithNoLocaleSuffix}-opt.mp4`
                : mediaType === "youtube"
                  ? originalUrl
                  : `/images-opt/${mediaIdWithNoLocaleSuffix}-opt.webp`;

        mediaEntries.push({
            title: mediaTitle,
            originalUrl,
            thumbnailUrl: mediaThumbnailUrl,
            info: mediaContent,
            src,
            type: mediaType,
        });
    }

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
        id: `${chapterPrefix}${entryId}`,
        title,
        description,
        info,
        chapter: chapterNum,
        category,
        thumbnailUrl,
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
