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

const EN_FANART_HEADINGS = ["Fanart", "Fanwork"];
const EN_MEME_HEADINGS = ["Meme", "Memes"];

interface Section {
    startIndex: number;
    endIndex: number;
    heading: string;
    content: string[];
}

function extractSections(text: string): { fanart: Section | null; memes: Section | null } {
    const lines = text.split("\n");
    let fanartSection: Section | null = null;
    let memesSection: Section | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for fanart/fanwork heading
        const fanartMatch = new RegExp(`^##\\s+(${EN_FANART_HEADINGS.join("|")})\\s*$`, "i").test(line);
        if (fanartMatch && !fanartSection) {
            const heading = line.match(/^##\s+(.+?)\s*$/)?.[1] || "Fanart";
            const levelMatch = line.match(/^(#{1,6})/);
            const headingLevel = levelMatch ? levelMatch[1].length : 2;

            let endIndex = lines.length;
            for (let j = i + 1; j < lines.length; j++) {
                const nextHeading = lines[j].match(/^(#{1,6})\s+/);
                if (nextHeading && nextHeading[1].length <= headingLevel) {
                    endIndex = j;
                    break;
                }
            }

            fanartSection = {
                startIndex: i,
                endIndex,
                heading,
                content: lines.slice(i + 1, endIndex),
            };
        }

        // Check for memes heading
        const memeMatch = new RegExp(`^##\\s+(${EN_MEME_HEADINGS.join("|")})\\s*$`, "i").test(line);
        if (memeMatch && !memesSection) {
            const heading = line.match(/^##\s+(.+?)\s*$/)?.[1] || "Memes";
            const levelMatch = line.match(/^(#{1,6})/);
            const headingLevel = levelMatch ? levelMatch[1].length : 2;

            let endIndex = lines.length;
            for (let j = i + 1; j < lines.length; j++) {
                const nextHeading = lines[j].match(/^(#{1,6})\s+/);
                if (nextHeading && nextHeading[1].length <= headingLevel) {
                    endIndex = j;
                    break;
                }
            }

            memesSection = {
                startIndex: i,
                endIndex,
                heading,
                content: lines.slice(i + 1, endIndex),
            };
        }
    }

    return { fanart: fanartSection, memes: memesSection };
}

function getJapaneseHeading(enHeading: string): string {
    const headingMap: { [key: string]: string } = {
        fanart: "## ファンアート",
        fanwork: "## ファンワーク",
        meme: "## ミーム",
        memes: "## ミーム",
    };

    const normalized = enHeading.toLowerCase();
    return headingMap[normalized] || `## ${enHeading}`;
}

function replaceSectionInJa(jaText: string, sectionName: "fanart" | "memes", newContent: string[]): string {
    const lines = jaText.split("\n");
    const jaHeadings =
        sectionName === "fanart"
            ? ["ファンアート", "ファンワーク", "ファン作品"]
            : ["ミーム"];

    for (let i = 0; i < lines.length; i++) {
        const pattern = new RegExp(`^##\\s+(${jaHeadings.join("|")})\\s*$`);
        if (pattern.test(lines[i])) {
            // Found the section heading
            const heading = lines[i].match(/^##\s+(.+?)\s*$/)?.[1] || jaHeadings[0];
            const levelMatch = lines[i].match(/^(#{1,6})/);
            const headingLevel = levelMatch ? levelMatch[1].length : 2;

            // Find end of section
            let endIndex = lines.length;
            for (let j = i + 1; j < lines.length; j++) {
                const nextHeading = lines[j].match(/^(#{1,6})\s+/);
                if (nextHeading && nextHeading[1].length <= headingLevel) {
                    endIndex = j;
                    break;
                }
            }

            // Replace the section content, keeping the Japanese heading
            const newLines = [
                ...lines.slice(0, i),
                lines[i],
                ...newContent,
                ...lines.slice(endIndex),
            ];

            return newLines.join("\n");
        }
    }

    // Section doesn't exist, create it
    if (!jaText.endsWith("\n")) {
        jaText += "\n";
    }

    const heading = sectionName === "fanart" ? "## ファンアート" : "## ミーム";
    return jaText + "\n" + heading + "\n" + newContent.join("\n");
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

        // Extract sections from English
        const { fanart: enFanart, memes: enMemes } = extractSections(enText);

        if (!enFanart && !enMemes) {
            skipped++;
            continue; // No fanart/meme sections in English file
        }

        // Update Japanese file
        let updatedJaText = jaText;

        if (enFanart && enFanart.content.length > 0) {
            updatedJaText = replaceSectionInJa(updatedJaText, "fanart", enFanart.content);
        }

        if (enMemes && enMemes.content.length > 0) {
            updatedJaText = replaceSectionInJa(updatedJaText, "memes", enMemes.content);
        }

        // Only write if there were changes
        if (updatedJaText !== jaText) {
            await fs.writeFile(jaFile, updatedJaText, "utf-8");
            console.log(`✓ ${relPath}`);
            updated++;
        } else {
            skipped++;
        }
    }

    console.log(`\n✅ Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped (no changes): ${skipped}`);
    console.log(`   Not found (Japanese file): ${notFound}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
