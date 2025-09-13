import fs from "fs/promises";
import path from "path";

const CHANGELOG_DIR = path.resolve(process.cwd(), "changelogs");

interface ChangelogEntry {
    date: string;
    content: string;
}

async function main() {
    const locale = process.argv[2] || "en";
    const localeSuffix = `_${locale}`;
    const localizedChangelogDir =
        locale === "en" ? CHANGELOG_DIR : `${CHANGELOG_DIR}_${locale}`;

    try {
        // Read all files in the localized changelog directory
        let files = await fs.readdir(localizedChangelogDir);

        // Filter only .md files
        files = files.filter((file) => file.endsWith(".md"));

        // Sort files descending by filename (assuming YYYY-MM-DD format, lexicographical sort works for descending)
        files.sort((a, b) => b.localeCompare(a));

        const changelogs: ChangelogEntry[] = [];

        for (let i = 0; i < files.length; i++) {
            if (i >= 2) break; // Limit to the latest 2 changelogs
            const file = files[i];
            const date = file.replace(".md", "");
            const filePath = path.join(localizedChangelogDir, file);
            const content = await fs.readFile(filePath, "utf-8");
            changelogs.push({ date, content });
        }

        const OUTPUT_PATH = path.resolve(
            process.cwd(),
            "apps",
            "website",
            "data",
            locale,
        );

        // Write to JSON file
        const outputFile = path.join(
            OUTPUT_PATH,
            `changelogs${localeSuffix}.json`,
        );
        // Ensure the output directory exists
        await fs.mkdir(OUTPUT_PATH, { recursive: true });
        await fs.writeFile(
            outputFile,
            JSON.stringify(changelogs, null, 2),
            "utf-8",
        );
        console.log(
            `Changelogs for locale "${locale}" injected successfully into ${outputFile}`,
        );
    } catch (error) {
        console.error(
            `Error injecting changelogs for locale "${locale}":`,
            error,
        );
    }
}

main();
