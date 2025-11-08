import fs from "fs/promises";
import path from "path";

async function main() {
    // Hardcoded inputs - modify these as needed
    const pattern = "book-of-prophecies";
    const groupName = "book-of-prophecies";

    const baseDir = path.resolve(process.cwd(), "recap-data", "texts");

    try {
        await fs.access(baseDir);
    } catch (err) {
        console.error(`Base directory not found: ${baseDir}`);
        process.exit(1);
    }

    console.log(`Searching for pattern: ${pattern}`);
    console.log(`Group name: ${groupName}\n`);

    // Find all matching files recursively
    const matchingFiles: string[] = [];

    async function walk(dir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await walk(fullPath);
            } else if (
                entry.isFile() &&
                entry.name.endsWith(".md") &&
                entry.name.includes(pattern)
            ) {
                matchingFiles.push(fullPath);
            }
        }
    }

    await walk(baseDir);

    if (matchingFiles.length === 0) {
        console.log(`No files found matching pattern: ${pattern}`);
        process.exit(0);
    }

    console.log(`Found ${matchingFiles.length} matching files:`);
    matchingFiles.forEach((file) => {
        console.log(`  - ${path.relative(baseDir, file)}`);
    });

    // Create group folder
    const groupDir = path.join(baseDir, groupName);
    await fs.mkdir(groupDir, { recursive: true });

    // Move files and collect entry names
    const entryNames: string[] = [];
    for (const file of matchingFiles) {
        const fileName = path.basename(file);
        const entryName = path.basename(file, ".md");
        entryNames.push(entryName);

        const destPath = path.join(groupDir, fileName);
        await fs.rename(file, destPath);
        console.log(
            `Moved: ${path.relative(baseDir, file)} -> ${path.relative(baseDir, destPath)}`,
        );
    }

    // Sort entry names (optional, for better organization)
    entryNames.sort();

    // Create index file
    const indexFileName = `${groupName}-index.md`;
    const indexFilePath = path.join(groupDir, indexFileName);
    const indexContent = `<!-- entries: ${entryNames.join(", ")} -->`;
    await fs.writeFile(indexFilePath, indexContent, "utf-8");

    console.log(
        `\n✅ Created index file: ${path.relative(baseDir, indexFilePath)}`,
    );
    console.log(
        `✅ Organized ${matchingFiles.length} files into ${groupName}/`,
    );

    // Clean up empty directories
    async function cleanupEmptyDirs(dir: string) {
        if (dir === baseDir) return;

        try {
            const entries = await fs.readdir(dir);
            if (entries.length === 0) {
                await fs.rmdir(dir);
                console.log(
                    `Removed empty directory: ${path.relative(baseDir, dir)}`,
                );
                // Try to clean up parent directory
                await cleanupEmptyDirs(path.dirname(dir));
            }
        } catch (err) {
            // Directory not empty or other error, skip
        }
    }

    // Clean up original directories
    const originalDirs = new Set(
        matchingFiles.map((file) => path.dirname(file)),
    );
    for (const dir of originalDirs) {
        await cleanupEmptyDirs(dir);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
