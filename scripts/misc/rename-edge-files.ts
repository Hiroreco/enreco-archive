import fs from "fs/promises";
import path from "path";

async function renameEdgeFiles(rootDir: string) {
    const chapters = await fs.readdir(rootDir, { withFileTypes: true });

    for (const chapter of chapters) {
        if (!chapter.isDirectory() || !/^chapter\d+$/.test(chapter.name))
            continue;

        const chapterDir = path.join(rootDir, chapter.name);
        const days = await fs.readdir(chapterDir, { withFileTypes: true });

        for (const day of days) {
            if (!day.isDirectory() || !/^day\d+$/.test(day.name)) continue;

            const dayDir = path.join(chapterDir, day.name);
            const edgesDir = path.join(dayDir, "edges");
            try {
                const files = await fs.readdir(edgesDir);
                for (const file of files) {
                    if (!file.endsWith(".md")) continue;

                    const basename = file.slice(0, -3);
                    const parts = basename.split("-");
                    if (parts.length !== 3) continue;

                    const [name1, name2, suffix] = parts;
                    const names = [name1, name2];
                    const sortedNames = [...names].sort((a, b) =>
                        a.localeCompare(b),
                    );

                    const newBasename = `${sortedNames[0]}-${sortedNames[1]}-${suffix}`;
                    const newFile = `${newBasename}.md`;

                    if (newFile !== file) {
                        const oldPath = path.join(edgesDir, file);
                        const newPath = path.join(edgesDir, newFile);
                        await fs.rename(oldPath, newPath);
                        console.log(
                            `Renamed ${file} to ${newFile} in ${edgesDir}`,
                        );
                    }
                }
            } catch {
                console.warn(`No edges directory found in ${dayDir}`);
            }
        }
    }
}

async function main() {
    const rootDir = path.resolve(process.cwd(), "recap-data");
    await renameEdgeFiles(rootDir);
    console.log("🎉 Edge file renaming completed!");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
