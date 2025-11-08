import { TextData, TextEntry, TextGroup } from "@enreco-archive/common/types";
import fs from "fs/promises";
import path from "path";

async function main() {
    const locale = process.argv[2] || "en";
    const localeSuffix = `_${locale}`;

    const baseDir = path.resolve(
        process.cwd(),
        locale === "en" ? "recap-data" : `recap-data_${locale}`,
        "texts",
    );

    const audioDir = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "public-resources",
        "audio",
        "text",
    );

    const outputPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        locale,
        `text-data${localeSuffix}.json`,
    );

    // Check if base directory exists
    try {
        await fs.access(baseDir);
    } catch (err) {
        console.error(`Base directory not found: ${baseDir}`);
        process.exit(1);
    }

    const result: TextData = {};

    // Check if audio directory exists and get list of audio files
    let audioFiles: Set<string> = new Set();
    try {
        const files = await fs.readdir(audioDir);
        audioFiles = new Set(
            files
                .filter((file) => file.toLowerCase().endsWith(".mp3"))
                .map((file) => path.basename(file, ".mp3")),
        );
        console.log(`Found ${audioFiles.size} audio files in text directory`);
    } catch (err) {
        console.warn(`Audio directory not found: ${audioDir}`);
    }

    function extractDescription(content: string): string {
        const lines = content.split(/\r?\n/);
        let inDescription = false;
        const descLines: string[] = [];

        for (const line of lines) {
            if (line.trim() === "<!-- description -->") {
                inDescription = true;
                continue;
            }
            if (inDescription) {
                if (line.trim()) {
                    descLines.push(line.trim());
                }
            }
        }

        return descLines.join(" ");
    }

    function extractTitle(content: string): string {
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
            if (/^<!--\s*title:\s*(.+?)\s*-->$/.test(line)) {
                return line
                    .replace(/^<!--\s*title:\s*(.+?)\s*-->$/, "$1")
                    .trim();
            }
        }
        return "";
    }

    function extractContent(content: string): string {
        const lines = content.split(/\r?\n/);
        let i = 0;
        // Skip title comment
        if (/^<!--\s*title:\s*(.+?)\s*-->$/.test(lines[0])) {
            i = 1;
            if (lines[1]?.trim() === "") i++;
        }
        return lines.slice(i).join("\n").trim();
    }

    function extractEntries(content: string): string[] {
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
            const match = line.match(/^<!--\s*entries:\s*(.+?)\s*-->$/);
            if (match) {
                return match[1].split(",").map((entry) => entry.trim());
            }
        }
        return [];
    }

    // Walk chapter directories
    for (const chapterName of await fs.readdir(baseDir)) {
        const chapterPath = path.join(baseDir, chapterName);
        const chapterStat = await fs.stat(chapterPath);
        if (!chapterStat.isDirectory()) continue;
        // chapterName is "chapter1", "chapter2", etc.
        const chapter = parseInt(chapterName.replace("chapter", ""), 10);
        if (isNaN(chapter)) continue;

        // Walk category directories
        for (const categoryName of await fs.readdir(chapterPath)) {
            const categoryPath = path.join(chapterPath, categoryName);
            const categoryStat = await fs.stat(categoryPath);
            if (!categoryStat.isDirectory()) continue;

            // Check for group folders or standalone files
            for (const itemName of await fs.readdir(categoryPath)) {
                const itemPath = path.join(categoryPath, itemName);
                const itemStat = await fs.stat(itemPath);

                if (itemStat.isDirectory()) {
                    // This is a group folder
                    const groupKey = itemName;
                    const indexFileName = `${groupKey}-index.md`;
                    const indexPath = path.join(itemPath, indexFileName);

                    try {
                        const indexContent = await fs.readFile(
                            indexPath,
                            "utf-8",
                        );
                        const title = extractTitle(indexContent);
                        const description = extractDescription(indexContent);
                        const entryNames = extractEntries(indexContent);

                        const entries: TextEntry[] = [];
                        for (const entryName of entryNames) {
                            const entryFileName = `${entryName}.md`;
                            const entryPath = path.join(
                                itemPath,
                                entryFileName,
                            );
                            try {
                                const entryContent = await fs.readFile(
                                    entryPath,
                                    "utf-8",
                                );
                                const entryTitle = extractTitle(entryContent);
                                const content = extractContent(entryContent);
                                const hasAudio = audioFiles.has(entryName);

                                entries.push({
                                    id: entryName,
                                    content,
                                    title: entryTitle,
                                    ...(hasAudio && { hasAudio: true }),
                                });
                            } catch (err) {
                                console.warn(
                                    `Could not read entry file: ${entryPath}`,
                                );
                            }
                        }

                        result[groupKey] = {
                            chapter,
                            category: categoryName,
                            title,
                            description,
                            entries,
                        };
                    } catch (err) {
                        console.warn(`Could not read index file: ${indexPath}`);
                    }
                } else if (itemName.endsWith(".md")) {
                    // This is a standalone file
                    const key = path.basename(itemName, ".md");
                    const fileContent = await fs.readFile(itemPath, "utf-8");
                    const title = extractTitle(fileContent);
                    const description = extractDescription(fileContent);
                    const content = extractContent(fileContent);
                    const hasAudio = audioFiles.has(key);

                    result[key] = {
                        chapter,
                        category: categoryName,
                        title,
                        description,
                        entries: [
                            {
                                id: key,
                                content,
                                title,
                                ...(hasAudio && { hasAudio: true }),
                            },
                        ],
                    };
                }
            }
        }
    }

    await fs.writeFile(outputPath, JSON.stringify(result, null, 2), "utf-8");

    const totalGroups = Object.keys(result).length;
    const totalEntries = Object.values(result).reduce(
        (sum, group) => sum + group.entries.length,
        0,
    );
    const entriesWithAudio = Object.values(result).reduce(
        (sum, group) =>
            sum + group.entries.filter((entry) => entry.hasAudio).length,
        0,
    );

    console.log(
        `✅ Injected ${totalGroups} ${locale} text groups with ${totalEntries} entries into ${outputPath}`,
    );
    console.log(`🎵 ${entriesWithAudio} entries have associated audio files`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
