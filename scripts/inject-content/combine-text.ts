import { TextData, TextEntry, TextGroup } from "@enreco-archive/common/types";
import fs from "fs/promises";
import path from "path";

interface LocalizedTextEntry extends Omit<TextEntry, "title" | "content"> {
    title: {
        en: string;
        ja: string;
    };
    content: {
        en: string;
        ja: string;
    };
}

interface LocalizedTextGroup extends Omit<TextGroup, "title" | "description" | "entries"> {
    title: {
        en: string;
        ja: string;
    };
    description: {
        en: string;
        ja: string;
    };
    entries: LocalizedTextEntry[];
}

type LocalizedTextData = Record<string, LocalizedTextGroup>;

async function main() {
    const enPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        "en",
        "text-data_en.json",
    );

    const jaPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        "ja",
        "text-data_ja.json",
    );

    const outputPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        "text.json",
    );

    console.log("Reading English text data...");
    const enContent = await fs.readFile(enPath, "utf-8");
    const enData = JSON.parse(enContent) as TextData;

    console.log("Reading Japanese text data...");
    const jaContent = await fs.readFile(jaPath, "utf-8");
    const jaData = JSON.parse(jaContent) as TextData;

    console.log("Combining data structures...");
    const combined: LocalizedTextData = {};

    // Iterate through English data and merge with Japanese data
    for (const [key, enGroup] of Object.entries(enData)) {
        // Try to find the group in Japanese data (might have _ja suffix)
        let jaGroup = jaData[key];
        if (!jaGroup) {
            // Try with _ja suffix
            jaGroup = jaData[`${key}_ja`];
        }

        if (!jaGroup) {
            console.warn(`Warning: Key "${key}" not found in Japanese data`);
            continue;
        }

        // Merge entries by ID
        const mergedEntries: LocalizedTextEntry[] = [];

        for (const enEntry of enGroup.entries) {
            const jaEntry = jaGroup.entries.find((e) => e.id === enEntry.id);

            if (!jaEntry) {
                console.warn(
                    `Warning: Entry "${enEntry.id}" not found in Japanese data for group "${key}"`,
                );
                continue;
            }

            mergedEntries.push({
                id: enEntry.id,
                title: {
                    en: enEntry.title,
                    ja: jaEntry.title,
                },
                content: {
                    en: enEntry.content,
                    ja: jaEntry.content,
                },
                ...(enEntry.hasAudio && { hasAudio: true }),
            });
        }

        combined[key] = {
            chapter: enGroup.chapter,
            category: enGroup.category,
            title: {
                en: enGroup.title,
                ja: jaGroup.title,
            },
            description: {
                en: enGroup.description,
                ja: jaGroup.description,
            },
            entries: mergedEntries,
        };
    }

    console.log("Writing combined data to file...");
    await fs.writeFile(outputPath, JSON.stringify(combined, null, 2), "utf-8");

    const totalGroups = Object.keys(combined).length;
    const totalEntries = Object.values(combined).reduce(
        (sum, group) => sum + group.entries.length,
        0,
    );

    console.log(
        `✅ Successfully combined text data files into ${outputPath}`,
    );
    console.log(`📊 Combined: ${totalGroups} text groups with ${totalEntries} entries`);
}

main().catch((err) => {
    console.error("Error combining text data:", err);
    process.exit(1);
});
