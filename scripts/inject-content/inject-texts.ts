import { TextData, TextEntry, TextGroup } from "@enreco-archive/common/types";
import fs from "fs/promises";
import path from "path";

async function main() {
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
        "text.json",
    );

    // Process both locales and merge into single result
    const mergedResult: TextData = {};
    const audioFiles: Set<string> = new Set();

    // Load audio files once
    try {
        const files = await fs.readdir(audioDir);
        for (const file of files) {
            if (file.toLowerCase().endsWith(".mp3")) {
                audioFiles.add(path.basename(file, ".mp3"));
            }
        }
        console.log(`Found ${audioFiles.size} audio files in text directory`);
    } catch (err) {
        console.warn(`Audio directory not found: ${audioDir}`);
    }

    // Utility function to remove comments from content
    function removeComments(content: string): string {
        return content.replace(/<!--[\s\S]*?-->/g, "").trim();
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
        let inDescription = false;
        const contentLines: string[] = [];

        for (const line of lines) {
            if (line.trim() === "<!-- description -->") {
                inDescription = true;
                continue;
            }
            if (inDescription) {
                // Skip lines after the description marker
                continue;
            }
            contentLines.push(line);
        }

        return contentLines.join("\n").trim();
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

    // Process both locales
    for (const locale of ["en", "ja"] as const) {
        const baseDir = path.resolve(
            process.cwd(),
            locale === "en" ? "recap-data" : `recap-data_${locale}`,
            "texts",
        );

        // Check if base directory exists
        try {
            await fs.access(baseDir);
        } catch (err) {
            console.warn(
                `Base directory not found for locale ${locale}: ${baseDir}`,
            );
            continue;
        }

        // Walk chapter directories
        for (const chapterName of await fs.readdir(baseDir)) {
            const chapterPath = path.join(baseDir, chapterName);
            const chapterStat = await fs.stat(chapterPath);
            if (!chapterStat.isDirectory()) continue;
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
                        const indexFileName = `${groupKey}-index${locale === "ja" ? "_ja" : ""}.md`;
                        const indexPath = path.join(itemPath, indexFileName);

                        try {
                            const indexContent = await fs.readFile(
                                indexPath,
                                "utf-8",
                            );
                            const title = extractTitle(indexContent);
                            const description =
                                extractDescription(indexContent);
                            const entryNames = extractEntries(indexContent);

                            // Initialize group if not exists
                            if (!mergedResult[groupKey]) {
                                mergedResult[groupKey] = {
                                    chapter,
                                    category: categoryName,
                                    title: { en: "", ja: "" },
                                    description: { en: "", ja: "" },
                                    entries: [],
                                };
                            }

                            // Add localized title and description
                            (mergedResult[groupKey].title as any)[locale] =
                                title;
                            (mergedResult[groupKey].description as any)[
                                locale
                            ] = description;

                            // Process entries
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
                                    const entryTitle =
                                        extractTitle(entryContent);
                                    const content =
                                        extractContent(entryContent);
                                    const cleanedContent =
                                        removeComments(content);
                                    const entryId = entryName.replace(
                                        "_ja",
                                        "",
                                    );
                                    const hasAudio = audioFiles.has(entryId);

                                    // Find or create entry
                                    let entry = mergedResult[
                                        groupKey
                                    ].entries.find((e) => e.id === entryId);
                                    if (!entry) {
                                        entry = {
                                            id: entryId,
                                            title: { en: "", ja: "" },
                                            content: { en: "", ja: "" },
                                        };
                                        mergedResult[groupKey].entries.push(
                                            entry,
                                        );
                                    }

                                    // Add localized content
                                    (entry.title as any)[locale] = entryTitle;
                                    (entry.content as any)[locale] =
                                        cleanedContent;
                                    if (hasAudio) {
                                        entry.hasAudio = true;
                                    }
                                } catch (err) {
                                    console.warn(
                                        `Could not read entry file: ${entryPath}`,
                                    );
                                }
                            }
                        } catch (err) {
                            console.warn(
                                `Could not read index file: ${indexPath}`,
                            );
                        }
                    } else if (itemName.endsWith(".md")) {
                        // This is a standalone file
                        const key = path
                            .basename(itemName, ".md")
                            .replace("_ja", "");
                        const fileContent = await fs.readFile(
                            itemPath,
                            "utf-8",
                        );
                        const title = extractTitle(fileContent);
                        const description = extractDescription(fileContent);
                        const content = extractContent(fileContent);
                        const cleanedContent = removeComments(content);
                        const hasAudio = audioFiles.has(key);

                        // Initialize group if not exists
                        if (!mergedResult[key]) {
                            mergedResult[key] = {
                                chapter,
                                category: categoryName,
                                title: { en: "", ja: "" },
                                description: { en: "", ja: "" },
                                entries: [],
                            };
                        }

                        // Add localized title and description
                        (mergedResult[key].title as any)[locale] = title;
                        (mergedResult[key].description as any)[locale] =
                            description;

                        // Find or create entry
                        let entry = mergedResult[key].entries.find(
                            (e) => e.id === key,
                        );
                        if (!entry) {
                            entry = {
                                id: key,
                                title: { en: "", ja: "" },
                                content: { en: "", ja: "" },
                            };
                            mergedResult[key].entries.push(entry);
                        }

                        // Add localized content
                        (entry.title as any)[locale] = title;
                        (entry.content as any)[locale] = cleanedContent;
                        if (hasAudio) {
                            entry.hasAudio = true;
                        }
                    }
                }
            }
        }
    }

    await fs.writeFile(
        outputPath,
        JSON.stringify(mergedResult, null, 2),
        "utf-8",
    );

    const totalGroups = Object.keys(mergedResult).length;
    const totalEntries = Object.values(mergedResult).reduce(
        (sum, group) => sum + group.entries.length,
        0,
    );
    const entriesWithAudio = Object.values(mergedResult).reduce(
        (sum, group) =>
            sum + group.entries.filter((entry) => entry.hasAudio).length,
        0,
    );

    console.log(`🚀 Processing texts with merged EN/JA structure...`);
    console.log(`✅ Processed EN texts`);
    console.log(`✅ Processed JA texts`);
    console.log(
        `✅ Injected ${totalGroups} text groups with ${totalEntries} entries into ${outputPath}`,
    );
    console.log(`🎵 ${entriesWithAudio} entries have associated audio files`);
    console.log(`🎉 All texts processed with merged structure!`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
