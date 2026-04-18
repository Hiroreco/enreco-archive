import fs from "fs/promises";
import path from "path";

async function walkDir(dir: string, base: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        const rel = path.relative(base, full);

        if (rel.split(path.sep)[0] === "glossary") continue;
        if (rel.split(path.sep)[0] === "media-archive") continue;

        if (ent.isDirectory()) {
            files.push(...(await walkDir(full, base)));
        } else if (ent.isFile() && full.endsWith(".md") && !full.endsWith("_ja.md")) {
            files.push(full);
        }
    }
    return files;
}

const EN_FANART_HEADINGS = ["Fanart", "Fanwork", "Meme", "Memes"];
const JA_FANART_HEADINGS = ["ファンアート", "ファンワーク", "ミーム", "ファン作品"];

function extractFanartSection(
    text: string,
): {
    startIndex: number;
    endIndex: number;
    lines: string[];
}[] {
    const lines = text.split("\n");
    const sections: Array<{
        startIndex: number;
        endIndex: number;
        lines: string[];
    }> = [];

    // Look for ## Fanart/Fanwork/Meme/Memes
    for (let i = 0; i < lines.length; i++) {
        const headingPattern = EN_FANART_HEADINGS.join("|");
        const headingMatch = new RegExp(`^##\\s+(${headingPattern})`, "i").test(
            lines[i],
        );

        if (headingMatch) {
            // Get heading level to find section end
            const levelMatch = lines[i].match(/^(#{1,6})/);
            const headingLevel = levelMatch ? levelMatch[1].length : 2;

            // Find end of section
            let endIndex = lines.length;
            for (let j = i + 1; j < lines.length; j++) {
                const nextHeadingMatch = lines[j].match(/^(#{1,6})\s+/);
                if (
                    nextHeadingMatch &&
                    nextHeadingMatch[1].length <= headingLevel
                ) {
                    endIndex = j;
                    break;
                }
            }

            sections.push({
                startIndex: i,
                endIndex,
                lines: lines.slice(i + 1, endIndex),
            });

            // Skip to end of this section
            i = endIndex - 1;
        }
    }

    return sections;
}

function extractFanartSectionJa(text: string): {
    startIndex: number;
    endIndex: number;
    lines: string[];
}[] {
    const lines = text.split("\n");
    const sections: Array<{
        startIndex: number;
        endIndex: number;
        lines: string[];
    }> = [];

    // Look for ## ファンアート/ファンワーク/ミーム
    for (let i = 0; i < lines.length; i++) {
        const headingPattern = JA_FANART_HEADINGS.join("|");
        const headingMatch = new RegExp(`^##\\s+(${headingPattern})`).test(
            lines[i],
        );

        if (headingMatch) {
            // Get heading level
            const levelMatch = lines[i].match(/^(#{1,6})/);
            const headingLevel = levelMatch ? levelMatch[1].length : 2;

            // Find end of section
            let endIndex = lines.length;
            for (let j = i + 1; j < lines.length; j++) {
                const nextHeadingMatch = lines[j].match(/^(#{1,6})\s+/);
                if (
                    nextHeadingMatch &&
                    nextHeadingMatch[1].length <= headingLevel
                ) {
                    endIndex = j;
                    break;
                }
            }

            sections.push({
                startIndex: i,
                endIndex,
                lines: lines.slice(i + 1, endIndex),
            });

            // Skip to end of this section
            i = endIndex - 1;
        }
    }

    return sections;
}

function extractUrlFromLine(line: string): string | null {
    const match = line.match(
        /\((https?:\/\/(?:www\.)?(?:twitter|x)\.com[^\)]+)\)/,
    );
    return match ? match[1].toLowerCase() : null;
}

function extractLinkWithComment(
    lines: string[],
    startIndex: number,
): { lines: string[]; endIndex: number; url: string } | null {
    const url = extractUrlFromLine(lines[startIndex]);
    if (!url) return null;

    const result: string[] = [lines[startIndex]];
    let endIndex = startIndex + 1;

    // Scan forward for blank lines and comments
    while (endIndex < lines.length) {
        const trimmed = lines[endIndex].trim();
        
        // Add blank lines
        if (trimmed === "") {
            result.push(lines[endIndex]);
            endIndex++;
        } 
        // Add HTML comments
        else if (trimmed.startsWith("<!--") && trimmed.endsWith("-->")) {
            result.push(lines[endIndex]);
            endIndex++;
        } 
        // Stop at any other content
        else {
            break;
        }
    }

    return { lines: result, endIndex, url };
}

async function main() {
    const enBase = path.resolve(process.cwd(), "recap-data");
    const jaBase = path.resolve(process.cwd(), "recap-data_ja");

    let mdFiles: string[];
    try {
        mdFiles = await walkDir(enBase, enBase);
    } catch (err) {
        console.error(`Error reading base folder "${enBase}":`, err);
        process.exit(1);
    }

    let updated = 0;
    let created = 0;
    let skipped = 0;
    let notFound = 0;

    for (const enFile of mdFiles) {
        const relPath = path.relative(enBase, enFile);
      
        const jaFile = path.join(jaBase, relPath.replace(/\.md$/, "_ja.md"));

        // Check if Japanese file exists
        let jaText: string;
        try {
            jaText = await fs.readFile(jaFile, "utf-8");
        } catch {
            notFound++;
            continue;
        }

        // Read English file
        const enText = await fs.readFile(enFile, "utf-8");

        // Extract all fanart/meme sections
        const enSections = extractFanartSection(enText);
        if (enSections.length === 0) {
            continue; // No fanart sections in English file
        }

        const jaSections = extractFanartSectionJa(jaText);

        // Collect all entries (link + comment) from English sections
        const enEntries = new Map<
            string,
            { lines: string[]; originalIndex: number }
        >();
        for (const section of enSections) {
            let i = 0;
            let originalIndex = 0;
            while (i < section.lines.length) {
                const linkEntry = extractLinkWithComment(section.lines, i);
                if (linkEntry) {
                    enEntries.set(linkEntry.url, {
                        lines: linkEntry.lines,
                        originalIndex,
                    });
                    i = linkEntry.endIndex;
                    originalIndex = i;
                } else {
                    i++;
                    originalIndex = i;
                }
            }
        }

        // Collect all URLs from Japanese sections (for comparison)
        const jaUrls = new Set<string>();
        for (const section of jaSections) {
            let i = 0;
            while (i < section.lines.length) {
                const linkEntry = extractLinkWithComment(section.lines, i);
                if (linkEntry) {
                    jaUrls.add(linkEntry.url);
                    i = linkEntry.endIndex;
                } else {
                    i++;
                }
            }
        }

        // Find missing entries
        const missingEntries: string[] = [];
        for (const [url, entry] of enEntries) {
            if (!jaUrls.has(url)) {
                missingEntries.push(...entry.lines);
            }
        }

        if (missingEntries.length === 0) {
            skipped++;
            continue;
        }

        // Update Japanese file
        const jaLines = jaText.split("\n");

        if (jaSections.length === 0) {
            // No fanart sections exist, create one at the end
            if (jaLines[jaLines.length - 1] !== "") {
                jaLines.push("");
            }
            jaLines.push("## ファンアート", "", ...missingEntries);
            console.log(
                `+ ${relPath} - created ファンアート section with ${enEntries.size} link${enEntries.size !== 1 ? "s" : ""}`,
            );
            created++;
        } else {
            // Add missing entries to the last fanart section
            const lastSection = jaSections[jaSections.length - 1];
            // Add blank line separator if not already there
            const insertLines =
                jaLines[lastSection.endIndex - 1] === ""
                    ? missingEntries
                    : ["", ...missingEntries];
            jaLines.splice(lastSection.endIndex, 0, ...insertLines);
            console.log(
                `✓ ${relPath} - added ${Math.round(missingEntries.length / 2)} missing link${Math.round(missingEntries.length / 2) !== 1 ? "s" : ""}`,
            );
            updated++;
        }

        await fs.writeFile(jaFile, jaLines.join("\n"), "utf-8");
    }

    console.log(`\n✅ Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped (already complete): ${skipped}`);
    console.log(`   Not found (Japanese file): ${notFound}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
