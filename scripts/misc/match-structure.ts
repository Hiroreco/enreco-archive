import fs from "fs/promises";
import path from "path";

// Configuration: Add folder pairs to sync here
const SYNC_CONFIGS = [
    {
        enDir: "recap-data/texts",
        jaDir: "recap-data_ja/texts",
    },
    // Add more configurations as needed:
    // {
    //     enDir: "recap-data/images",
    //     jaDir: "recap-data_ja/images",
    // },
];

async function main() {
    for (const config of SYNC_CONFIGS) {
        console.log(`\n🔄 Syncing ${config.enDir} -> ${config.jaDir}`);

        const enBaseDir = path.resolve(process.cwd(), config.enDir);
        const jaBaseDir = path.resolve(process.cwd(), config.jaDir);

        // Check if directories exist
        try {
            await fs.access(enBaseDir);
        } catch (err) {
            console.error(`❌ English directory not found: ${enBaseDir}`);
            continue;
        }

        try {
            await fs.access(jaBaseDir);
        } catch (err) {
            console.warn(
                `⚠️  Japanese directory not found, creating: ${jaBaseDir}`,
            );
            await fs.mkdir(jaBaseDir, { recursive: true });
        }

        // Create a map of all Japanese files (without _ja suffix) -> full path
        const jaFilesMap = new Map<string, string>();
        await buildJaFileMap(jaBaseDir, jaFilesMap);

        console.log(`📋 Found ${jaFilesMap.size} Japanese files`);

        // Walk through English structure and replicate for Japanese
        const stats = { moved: 0, copied: 0, created: 0 };
        await walkEnStructure(enBaseDir, jaBaseDir, jaFilesMap, "", stats);

        console.log(`✅ Sync complete:`);
        console.log(
            `   📄 ${stats.moved} files moved from existing Japanese files`,
        );
        console.log(
            `   📋 ${stats.copied} files copied from English (no Japanese equivalent)`,
        );
        console.log(`   📁 ${stats.created} directories created`);
    }

    console.log("\n✅ All folders synced successfully");
}

async function buildJaFileMap(
    dir: string,
    map: Map<string, string>,
): Promise<void> {
    let items: string[];
    try {
        items = await fs.readdir(dir);
    } catch (err) {
        return; // Directory doesn't exist yet
    }

    for (const item of items) {
        const fullPath = path.join(dir, item);
        let stat;

        try {
            stat = await fs.stat(fullPath);
        } catch (err) {
            continue;
        }

        if (stat.isDirectory()) {
            await buildJaFileMap(fullPath, map);
        } else {
            // Get base name without _ja suffix and extension
            const ext = path.extname(item);
            const baseName = path.basename(item, ext).replace(/_ja$/, "");
            const key = `${baseName}${ext}`;
            map.set(key, fullPath);
        }
    }
}

async function walkEnStructure(
    enDir: string,
    jaDir: string,
    jaFilesMap: Map<string, string>,
    relativePath: string,
    stats: { moved: number; copied: number; created: number },
): Promise<void> {
    const items = await fs.readdir(enDir);

    for (const item of items) {
        const enFullPath = path.join(enDir, item);
        const stat = await fs.stat(enFullPath);

        if (stat.isDirectory()) {
            // Create corresponding Japanese directory
            const jaFullPath = path.join(jaDir, item);

            try {
                await fs.access(jaFullPath);
            } catch (err) {
                await fs.mkdir(jaFullPath, { recursive: true });
                console.log(
                    `📁 Created directory: ${path.relative(process.cwd(), jaFullPath)}`,
                );
                stats.created++;
            }

            // Recurse into subdirectory
            await walkEnStructure(
                enFullPath,
                jaFullPath,
                jaFilesMap,
                path.join(relativePath, item),
                stats,
            );
        } else {
            // Handle files
            const ext = path.extname(item);
            const baseName = path.basename(item, ext);
            const jaFileName = `${baseName}_ja${ext}`;
            const jaTargetPath = path.join(jaDir, jaFileName);

            const jaSourcePath = jaFilesMap.get(item);

            if (jaSourcePath) {
                // Japanese equivalent exists - move it to new location
                try {
                    const content = await fs.readFile(jaSourcePath, "utf-8");
                    await fs.writeFile(jaTargetPath, content, "utf-8");
                    console.log(
                        `📄 Moved: ${item} -> ${path.relative(process.cwd(), jaTargetPath)}`,
                    );
                    stats.moved++;
                } catch (err) {
                    console.warn(`⚠️  Failed to copy ${item}:`, err);
                }
            } else {
                // No Japanese equivalent - copy English file with _ja suffix
                try {
                    const content = await fs.readFile(enFullPath, "utf-8");
                    await fs.writeFile(jaTargetPath, content, "utf-8");
                    console.log(
                        `📋 Copied from EN: ${item} -> ${path.relative(process.cwd(), jaTargetPath)}`,
                    );
                    stats.copied++;
                } catch (err) {
                    console.warn(
                        `⚠️  Failed to copy from English ${item}:`,
                        err,
                    );
                }
            }
        }
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
