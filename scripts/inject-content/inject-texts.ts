import { TextData } from "@enreco-archive/common/types";
import fs from "fs/promises";
import path from "path";

async function main() {
    const locale = process.argv[2] || "en";
    const localeSuffix = `_${locale}`;

    const baseDir = path.resolve(
        process.cwd(),
        locale === "en" ? "recap-data" : `recap-data_${locale}`,
        "texts",
    );

    const audioDir = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "public-resources",
        "audio",
        "text",
    );

    const outputPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        locale,
        `text-data${localeSuffix}.json`,
    );

    // Check if base directory exists
    try {
        await fs.access(baseDir);
    } catch (err) {
        console.error(`Base directory not found: ${baseDir}`);
        process.exit(1);
    }

    const result: TextData = {};

    // Check if audio directory exists and get list of audio files
    let audioFiles: Set<string> = new Set();
    try {
        const files = await fs.readdir(audioDir);
        audioFiles = new Set(
            files
                .filter((file) => file.toLowerCase().endsWith(".mp3"))
                .map((file) => path.basename(file, ".mp3")),
        );
        console.log(`Found ${audioFiles.size} audio files in text directory`);
    } catch (err) {
        console.warn(`Audio directory not found: ${audioDir}`);
    }

    // Recursively walk baseDir
    async function walk(dir: string) {
        for (const name of await fs.readdir(dir)) {
            const full = path.join(dir, name);
            const stat = await fs.stat(full);
            if (stat.isDirectory()) {
                await walk(full);
            } else if (stat.isFile() && name.endsWith(".md")) {
                // Compute category = first segment under baseDir
                const relPath = path.relative(baseDir, full);
                const segments = relPath.split(path.sep);
                const category = segments[0];

                const key = path
                    .basename(name, ".md")
                    .replace(/(_jp|_ja)$/i, "")
                    .replace(/-jp$|-ja$/i, "");

                const raw = await fs.readFile(full, "utf-8");
                const lines = raw.split(/\r?\n/);

                // Extract title
                let title = "";
                let i = 0;
                if (/^<!--\s*title:\s*(.+?)\s*-->$/.test(lines[0])) {
                    title = lines[0]
                        .replace(/^<!--\s*title:\s*(.+?)\s*-->$/, "$1")
                        .trim();
                    i = 1;
                    // skip a following blank line
                    if (lines[1]?.trim() === "") i++;
                }

                const content = lines.slice(i).join("\n").trim();

                // Check if audio file exists for this text
                const hasAudio = audioFiles.has(key);

                result[key] = {
                    title,
                    content,
                    category,
                    ...(hasAudio && { hasAudio: true }),
                };
            }
        }
    }

    try {
        await walk(baseDir);
    } catch (err) {
        console.error(`Error walking directory: ${err}`);
        process.exit(1);
    }

    await fs.writeFile(outputPath, JSON.stringify(result, null, 2), "utf-8");

    const totalTexts = Object.keys(result).length;
    const textsWithAudio = Object.values(result).filter(
        (item) => item.hasAudio,
    ).length;

    console.log(`✅ Injected ${totalTexts} ${locale} items into ${outputPath}`);
    console.log(`🎵 ${textsWithAudio} texts have associated audio files`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
