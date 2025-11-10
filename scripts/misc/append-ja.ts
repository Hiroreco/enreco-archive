import fs from "fs/promises";
import path from "path";

const RECAP_DATA_DIR = path.resolve(
    process.cwd(),
    "recap-data_ja",
    "media-archive",
);

async function getAllMarkdownFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        entries.map((entry) => {
            const fullPath = path.join(dir, entry.name);
            return entry.isDirectory()
                ? getAllMarkdownFiles(fullPath)
                : fullPath;
        }),
    );
    return files.flat().filter((file) => file.endsWith(".md"));
}

async function updateEntriesComment(filePath: string): Promise<void> {
    const content = await fs.readFile(filePath, "utf-8");

    // Match the `entries` comment and append `_ja` to each value
    const updatedContent = content.replace(
        /<!--\s*entries:\s*([^>]+)\s*-->/,
        (match, entries) => {
            const updatedEntries = entries
                .split(",")
                .map((entry) => entry.trim() + "_ja")
                .join(", ");
            return `<!-- entries: ${updatedEntries} -->`;
        },
    );

    // Write back the updated content
    if (updatedContent !== content) {
        await fs.writeFile(filePath, updatedContent, "utf-8");
        console.log(`Updated entries in: ${filePath}`);
    }
}

async function processMarkdownFiles() {
    const markdownFiles = await getAllMarkdownFiles(RECAP_DATA_DIR);

    for (const file of markdownFiles) {
        try {
            await updateEntriesComment(file);
        } catch (error) {
            console.error(`Failed to process ${file}: ${error.message}`);
        }
    }
}

processMarkdownFiles().catch((error) => {
    console.error(`Script failed: ${error.message}`);
    process.exit(1);
});
