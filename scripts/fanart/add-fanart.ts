import fs from "fs/promises";
import path from "path";

interface TwitterLink {
    url: string;
    label: string;
    author: string;
    chapter: number;
    day: number;
    characters: string[];
    type: "art" | "meme";
}

interface FanartEntry {
    filename: string;
    title: string;
    link: string;
    characters: string[];
    type: "fanart" | "meme";
}

async function readTwitterLinks(): Promise<TwitterLink[]> {
    const filePath = path.resolve(
        process.cwd(),
        "src",
        "data",
        "twitter-links.json",
    );
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
}

function parseFanartMd(content: string): FanartEntry[] {
    const entries: FanartEntry[] = [];
    const lines = content.split("\n");

    let i = 0;
    while (i < lines.length) {
        // Skip empty lines
        while (i < lines.length && lines[i].trim() === "") {
            i++;
        }

        if (i >= lines.length) break;

        // Parse entry: filename [meme], title, link, optional characters
        const filenameLine = lines[i].trim();
        let filename = filenameLine;
        let type: "fanart" | "meme" = "fanart";

        // Check if it ends with " meme"
        if (filenameLine.endsWith(" meme")) {
            type = "meme";
            filename = filenameLine.slice(0, -5).trim();
        }

        if (!filename.match(/^[a-z-]+-c\d+d\d+$/)) {
            // Not a valid filename, skip this line
            i++;
            continue;
        }

        i++;

        // Get title
        if (i >= lines.length) break;
        const title = lines[i].trim();
        if (!title) {
            i++;
            continue;
        }
        i++;

        // Get link
        if (i >= lines.length) break;
        const linkLine = lines[i].trim();
        if (!linkLine.startsWith("http")) {
            i++;
            continue;
        }
        const link = linkLine.toLowerCase();
        i++;

        // Collect characters until next blank line or next filename
        const characters: string[] = [];
        while (
            i < lines.length &&
            lines[i].trim() !== "" &&
            !lines[i].trim().match(/^[a-z-]+-c\d+d\d+/)
        ) {
            const charLine = lines[i].trim();
            if (!charLine.startsWith("http")) {
                // Split by spaces and commas, excluding URLs
                const chars = charLine
                    .split(/[\s,]+/)
                    .filter((c) => c.length > 0 && !c.startsWith("http"));
                characters.push(...chars);
            }
            i++;
        }

        entries.push({
            filename,
            title,
            link,
            characters,
            type,
        });
    }

    return entries;
}

function extractAuthorFromLink(link: string): string {
    // Extract author from https://x.com/authorname/status/...
    const match = link.match(
        /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/([^\/]+)/i,
    );
    return match ? match[1].toLowerCase() : "unknown";
}

function parseFilename(filename: string): {
    character: string;
    chapter: number;
    day: number;
} | null {
    // Parse format: {character}-c{chapter}d{day}
    const match = filename.match(/^(.+)-c(\d+)d(\d+)$/);
    if (!match) return null;

    return {
        character: match[1],
        chapter: parseInt(match[2], 10),
        day: parseInt(match[3], 10),
    };
}

async function findRecapFile(
    character: string,
    chapter: number,
    day: number,
): Promise<string | null> {
    // Try nodes directory first
    const nodesDir = path.resolve(
        process.cwd(),
        "recap-data",
        `chapter${chapter}`,
        `day${day}`,
        "nodes",
    );

    try {
        const files = await fs.readdir(nodesDir);
        const found = files.find(
            (f) => f.startsWith(character) && f.endsWith(".md"),
        );
        if (found) {
            return path.join(nodesDir, found);
        }
    } catch {
        // nodes directory doesn't exist, try edges
    }

    // Try edges directory
    const edgesDir = path.resolve(
        process.cwd(),
        "recap-data",
        `chapter${chapter}`,
        `day${day}`,
        "edges",
    );

    try {
        const files = await fs.readdir(edgesDir);
        const found = files.find(
            (f) => f.startsWith(character) && f.endsWith(".md"),
        );
        if (found) {
            return path.join(edgesDir, found);
        }
    } catch {
        // edges directory doesn't exist either
    }

    return null;
}

async function addFanartToRecap(
    recapPath: string,
    title: string,
    link: string,
    characters: string[],
    type: "fanart" | "meme" = "fanart",
): Promise<void> {
    const content = await fs.readFile(recapPath, "utf-8");
    const author = extractAuthorFromLink(link);

    // Determine which section to add to
    const sectionHeading = type === "meme" ? "## Memes" : "## Fanart";

    // Build the new entry
    let newEntry = `\n\n["${title}" by ${author}](${link})`;
    if (characters.length > 0) {
        const characterList = characters.join(", ");
        newEntry += `\n\n<!-- ${characterList} -->`;
    }

    // Find the section
    const sectionMatch = content.match(
        new RegExp(
            `^${sectionHeading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`,
            "m",
        ),
    );

    let updatedContent: string;

    if (sectionMatch) {
        // Section exists - insert after heading
        const insertPos = sectionMatch.index! + sectionMatch[0].length;
        const afterHeading = content.slice(insertPos);

        // Check if there's already content after the heading
        const firstContentMatch = afterHeading.match(/\n(\[|##)/);

        if (firstContentMatch) {
            // Insert before the first entry or next section
            const insertAt = insertPos + firstContentMatch.index!;
            updatedContent =
                content.slice(0, insertAt) +
                newEntry +
                "\n" +
                content.slice(insertAt);
        } else {
            // Just append to end of section
            updatedContent =
                content.slice(0, insertPos) +
                newEntry +
                content.slice(insertPos);
        }
    } else {
        // Section doesn't exist - create it at the end of the file
        const endsWithNewline = content.endsWith("\n");
        const separator = endsWithNewline ? "" : "\n";
        updatedContent = content + separator + "\n" + sectionHeading + newEntry;
    }

    await fs.writeFile(recapPath, updatedContent, "utf-8");
}

async function main() {
    // Read fanart.md
    const fanartMdPath = path.resolve(
        process.cwd(),
        "scripts",
        "fanart",
        "fanart.md",
    );
    const fanartMdContent = await fs.readFile(fanartMdPath, "utf-8");

    // Parse fanart entries
    const entries = parseFanartMd(fanartMdContent);
    console.log(`Found ${entries.length} fanart entries in fanart.md`);

    // Read existing twitter links
    const twitterLinks = await readTwitterLinks();
    const existingUrls = new Set(twitterLinks.map((l) => l.url));

    let addedCount = 0;
    let skippedCount = 0;
    const successfullyAddedUrls = new Set<string>();

    // Process each entry
    for (const entry of entries) {
        // Check if URL already exists in twitter-links.json
        if (existingUrls.has(entry.link)) {
            console.log(
                `⏭️  Skipping "${entry.title}" - already in twitter-links.json`,
            );
            skippedCount++;
            continue;
        }

        // Parse filename to get chapter and day
        const parsed = parseFilename(entry.filename);
        if (!parsed) {
            console.warn(`⚠️  Invalid filename format: ${entry.filename}`);
            continue;
        }

        // Find the recap file
        const recapPath = await findRecapFile(
            parsed.character,
            parsed.chapter,
            parsed.day,
        );
        if (!recapPath) {
            console.warn(`⚠️  Could not find recap file for ${entry.filename}`);
            continue;
        }

        // Add fanart to recap file
        try {
            await addFanartToRecap(
                recapPath,
                entry.title,
                entry.link,
                entry.characters,
                entry.type,
            );
            console.log(
                `✅ Added "${entry.title}" to ${path.basename(recapPath)}`,
            );
            addedCount++;
            successfullyAddedUrls.add(entry.link);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.warn(`⚠️  ${errorMsg}`);
        }
    }

    // Clear processed entries from fanart.md (only those that were successfully added)
    if (successfullyAddedUrls.size > 0) {
        console.log(
            `\n🧹 Removing ${successfullyAddedUrls.size} processed entries from fanart.md...`,
        );

        // Re-parse and filter out successfully processed entries
        const lines = fanartMdContent.split("\n");
        const remainingLines: string[] = [];

        let i = 0;
        while (i < lines.length) {
            // Check if this is the start of an entry
            let filenameLine = lines[i].trim();
            let type: "fanart" | "meme" = "fanart";

            // Check for " meme" suffix
            if (filenameLine.endsWith(" meme")) {
                type = "meme";
                filenameLine = filenameLine.slice(0, -5).trim();
            }

            if (filenameLine.match(/^[a-z-]+-c\d+d\d+$/)) {
                // This is a potential entry start
                let link = "";

                // Look ahead to find the link
                let j = i + 1;
                while (j < lines.length && j < i + 5) {
                    const line = lines[j].trim();
                    if (line.startsWith("http")) {
                        link = line.toLowerCase();
                        break;
                    }
                    j++;
                }

                // If we found a link, check if it was successfully processed
                if (link && successfullyAddedUrls.has(link)) {
                    // Skip this entire entry
                    i = j + 1;
                    // Skip any following character lines
                    while (
                        i < lines.length &&
                        lines[i].trim() !== "" &&
                        !lines[i].trim().match(/^[a-z-]+-c\d+d\d+/)
                    ) {
                        i++;
                    }
                    // Skip blank lines after entry
                    while (i < lines.length && lines[i].trim() === "") {
                        i++;
                    }
                    continue;
                }
            }

            remainingLines.push(lines[i]);
            i++;
        }

        // Clean up extra blank lines at the end
        while (
            remainingLines.length > 0 &&
            remainingLines[remainingLines.length - 1].trim() === ""
        ) {
            remainingLines.pop();
        }

        const newContent = remainingLines.join("\n").trim();

        await fs.writeFile(fanartMdPath, newContent, "utf-8");
        console.log("✅ fanart.md cleaned up");
    }

    console.log(`\n📊 Summary: Added ${addedCount}, Skipped ${skippedCount}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
