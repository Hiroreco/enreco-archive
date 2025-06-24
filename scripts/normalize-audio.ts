// scripts/normalize-audio.ts
import { spawnSync } from "child_process";
import fs from "fs/promises";
import path from "path";

import { parseFile } from "music-metadata";

async function walkDir(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const ent of entries) {
        const res = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            files.push(...(await walkDir(res)));
        } else if (ent.isFile() && res.toLowerCase().endsWith(".mp3")) {
            files.push(res);
        }
    }
    return files;
}

async function normalizeAll() {
    const base = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "public-resources",
        "audio",
        "songs",
    );
    let mp3Files: string[];
    try {
        mp3Files = await walkDir(base);
    } catch (err) {
        console.error("Error reading audio/songs folder:", err);
        process.exit(1);
    }

    if (mp3Files.length === 0) {
        console.log("No MP3 files found under audio/songs/");
        return;
    }

    console.log(`Found ${mp3Files.length} files. Starting normalization…`);

    for (const inputPath of mp3Files) {
        // you can either overwrite in place, or write to a parallel folder:
        // const outputPath = inputPath;
        const relative = path.relative(base, inputPath);
        const tempPath = path.join(
            path.dirname(inputPath),
            `.tmp-${path.basename(inputPath)}`,
        );

        console.log(`Normalizing: ${relative}`);

        const meta = await parseFile(inputPath);
        let targetBitrate = 128_000; // fallback 128 kbps
        if (meta.format.bitrate) {
            targetBitrate = Math.round(meta.format.bitrate / 1000) * 1000;
        }

        const args = [
            "-i",
            inputPath,
            "-af",
            "loudnorm=I=-16:TP=-1.5:LRA=11",
            "-codec:a",
            "libmp3lame",
            "-b:a",
            `${Math.floor(targetBitrate / 1000)}k`,
            "-y",
            tempPath,
        ];

        // ffmpeg -i input.mp3 -af loudnorm=I=-16:TP=-1.5:LRA=11 -y temp.mp3
        // const args = [
        //     "-i",
        //     inputPath,
        //     "-af",
        //     "loudnorm=I=-16:TP=-1.5:LRA=11",
        //     "-codec:a",
        //     "libmp3lame",
        //     "-q:a",
        //     "2", // high-quality VBR
        //     "-y",
        //     tempPath,
        // ];

        const res = spawnSync("ffmpeg", args, { stdio: "inherit" });
        if (res.status !== 0) {
            console.error(`⚠️  ffmpeg failed on ${relative}`);
            // remove temp if exists
            try {
                await fs.unlink(tempPath);
            } catch (_) {}
            continue;
        }

        // Replace the original
        await fs.rename(tempPath, inputPath);
    }

    console.log("✅ All files normalized.");
}

normalizeAll().catch((err) => {
    console.error(err);
    process.exit(1);
});
