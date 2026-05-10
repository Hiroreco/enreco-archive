import fs from "fs/promises";
import path from "path";

const CHANGELOG_DIR = path.resolve(process.cwd(), "changelogs");

interface ChangelogEntry {
    date: string;
    content: { en: string; ja: string };
}

async function main() {
    try {
        const changelogMap = new Map<string, { en: string; ja: string }>();

        // Process both EN and JA locales
        for (const locale of ["en", "ja"] as const) {
            const localizedChangelogDir =
                locale === "en" ? CHANGELOG_DIR : `${CHANGELOG_DIR}_${locale}`;

            // Read all files in the localized changelog directory
            let files = await fs.readdir(localizedChangelogDir);

            // Filter only .md files
            files = files.filter((file) => file.endsWith(".md"));

            // Sort files descending by filename (assuming YYYY-MM-DD format)
            files.sort((a, b) => b.localeCompare(a));

            // Process files, limiting to latest 2 dates
            let dateCount = 0;
            for (const file of files) {
                if (dateCount >= 1) break;
                const date = file.replace(
                    new RegExp(`_${locale}\\.md$|.md$`),
                    "",
                );
                const filePath = path.join(localizedChangelogDir, file);
                const content = await fs.readFile(filePath, "utf-8");

                // Initialize entry if not exists
                if (!changelogMap.has(date)) {
                    changelogMap.set(date, { en: "", ja: "" });
                }

                // Populate this locale's content
                const entry = changelogMap.get(date)!;
                (entry as any)[locale] = content;
                dateCount++;
            }

            console.log(`✅ Processed ${locale.toUpperCase()} changelogs`);
        }

        // Convert map to array, sorted by date descending
        const changelogs: ChangelogEntry[] = Array.from(changelogMap.entries())
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([date, content]) => ({ date, content }));

        const OUTPUT_PATH = path.resolve(
            process.cwd(),
            "apps",
            "website",
            "data",
        );

        // Ensure the output directory exists
        await fs.mkdir(OUTPUT_PATH, { recursive: true });

        // Write to single merged JSON file
        const outputFile = path.join(OUTPUT_PATH, "changelogs.json");
        await fs.writeFile(
            outputFile,
            JSON.stringify(changelogs, null, 2),
            "utf-8",
        );
        console.log(
            `✅ Successfully created changelogs with ${changelogs.length} merged entries`,
        );
        console.log(`📁 Output: ${outputFile}`);
    } catch (error) {
        console.error("Error injecting changelogs:", error);
    }
}

main();
