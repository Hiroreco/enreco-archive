import fs from "fs/promises";
import path from "path";
const CHANGELOG_DIR = path.resolve(process.cwd(), "changelogs");
const OUTPUT_PATH = path.resolve(process.cwd(), "apps", "website", "data");

interface ChangelogEntry {
    date: string;
    content: string;
}

async function main() {
    try {
        // Read all files in the directory
        let files = await fs.readdir(CHANGELOG_DIR);

        // Filter only .md files
        files = files.filter((file) => file.endsWith(".md"));

        // Sort files descending by filename (assuming YYYY-MM-DD format, lexicographical sort works for descending)
        files.sort((a, b) => b.localeCompare(a));

        const changelogs: ChangelogEntry[] = [];

        for (let i = 0; i < files.length; i++) {
            if (i >= 2) break;
            const file = files[i];
            const date = file.replace(".md", "");
            const filePath = path.join(CHANGELOG_DIR, file);
            const content = await fs.readFile(filePath, "utf-8");
            changelogs.push({ date, content });
        }

        // Write to JSON file
        const outputFile = path.join(OUTPUT_PATH, "changelogs.json");
        // Ensure the output directory exists
        await fs.mkdir(OUTPUT_PATH, { recursive: true });
        await fs.writeFile(
            outputFile,
            JSON.stringify(changelogs, null, 2),
            "utf-8",
        );
        console.log(`Changelogs injected successfully into ${outputFile}`);
    } catch (error) {
        console.error("Error injecting changelogs:", error);
    }
}

main();
