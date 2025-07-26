import fs from "fs/promises";
import path from "path";

// Directory containing source markdown files
const GLOSSARY_SRC_DIR = path.resolve(process.cwd(), "recap-data/glossary");

// Recursively read all markdown files in a directory
async function getMarkdownFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await getMarkdownFiles(fullPath)));
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
            files.push(fullPath);
        }
    }
    return files;
}

async function main() {
    try {
        const mdFiles = await getMarkdownFiles(GLOSSARY_SRC_DIR);

        const entryRegex = /\[.*?\]\(#entry:([^)]+)\)/g;
        const allIds = new Set<string>();

        // Collect all IDs from markdown files
        for (const file of mdFiles) {
            const id = path.basename(file, ".md");
            allIds.add(id);
        }

        let hasErrors = false;

        for (const file of mdFiles) {
            const content = await fs.readFile(file, "utf-8");
            const lines = content.split(/\r?\n/);
            let match;

            while ((match = entryRegex.exec(content)) !== null) {
                const refId = match[1];
                if (!allIds.has(refId)) {
                    const fileName = path.relative(GLOSSARY_SRC_DIR, file);
                    console.warn(
                        `Warning: In file '${fileName}', reference to invalid entry ID '#entry:${refId}' not found.`,
                    );
                    hasErrors = true;
                }
            }
        }

        if (hasErrors) {
            console.error("Validation completed with warnings.");
            process.exit(1);
        } else {
            console.log("All entry references are valid.");
            process.exit(0);
        }
    } catch (err) {
        console.error("Error during validation:", err);
        process.exit(1);
    }
}

main();
