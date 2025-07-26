import fs from "fs/promises";
import path from "path";

// Path to text-data.json
const TEXT_DATA_PATH = path.resolve(
    process.cwd(),
    "apps/website/data/text-data.json",
);
// Root directory to scan
const RECAP_DATA_DIR = path.resolve(process.cwd(), "recap-data");

// Load all valid text IDs
async function loadTextIds(): Promise<Set<string>> {
    const raw = await fs.readFile(TEXT_DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    return new Set(Object.keys(data));
}

// Recursively collect all .md files under a directory
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

// Main validation logic
async function main() {
    const textIds = await loadTextIds();
    const mdFiles = await getMarkdownFiles(RECAP_DATA_DIR);

    const TEXT_REF_RE = /\[[^\]]+\]\(#text:([^)]+)\)/g;
    let hasErrors = false;

    for (const file of mdFiles) {
        const content = await fs.readFile(file, "utf-8");
        let match;
        while ((match = TEXT_REF_RE.exec(content)) !== null) {
            const refId = match[1].trim();
            if (!textIds.has(refId)) {
                const relPath = path.relative(process.cwd(), file);
                console.warn(
                    `Warning: In file '${relPath}', reference to missing #text:${refId}`,
                );
                hasErrors = true;
            }
        }
    }

    if (hasErrors) {
        console.error("Validation completed with missing #text: references.");
        process.exit(1);
    } else {
        console.log("All #text: references are valid.");
        process.exit(0);
    }
}

main();
