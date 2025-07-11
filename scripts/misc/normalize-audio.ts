import { spawnSync } from "child_process";
import fs from "fs/promises";
import path from "path";
import { parseFile } from "music-metadata";

async function walkDir(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const ent of entries) {
        const fullPath = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            files.push(...(await walkDir(fullPath)));
        } else if (ent.isFile() && fullPath.toLowerCase().endsWith(".mp3")) {
            files.push(fullPath);
        }
    }
    return files;
}

interface LoudnormStats {
    input_i: number;
    input_tp: number;
    input_lra: number;
    input_thresh: number;
}

function runFfmpeg(args: string[]): { status: number; stderr: string } {
    const res = spawnSync("ffmpeg", args, { encoding: "utf-8" });
    return {
        status: res.status ?? 1,
        stderr: res.stderr.toString(),
    };
}

function parseLoudnormStats(output: string): LoudnormStats | null {
    const match = output.match(/\{[\s\S]*?\}/);
    if (!match) return null;
    try {
        const json = JSON.parse(match[0]);
        return {
            input_i: json.input_i,
            input_tp: json.input_tp,
            input_lra: json.input_lra,
            input_thresh: json.input_thresh,
        };
    } catch {
        return null;
    }
}

async function normalizeAll() {
    const baseDir = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "public-resources",
        "audio",
        "text",
    );

    const files = await walkDir(baseDir);
    if (files.length === 0) {
        console.log("No MP3 files found.");
        return;
    }
    console.log(`Found ${files.length} files. Running normalization…`);

    for (const filePath of files) {
        const rel = path.relative(baseDir, filePath);
        console.log(`
▶︎ Normalizing: ${rel}`);

        // Read metadata once
        const meta = await parseFile(filePath);
        const bitrate = meta.format.bitrate
            ? Math.round(meta.format.bitrate / 1000)
            : 128;

        // 1) Analysis pass for loudnorm stats
        const analysisArgs = [
            "-i",
            filePath,
            "-af",
            "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
            "-f",
            "null",
            "-",
        ];
        const analysis = runFfmpeg(analysisArgs);
        if (analysis.status !== 0) {
            console.error(`✖️ Analysis failed for ${rel}`);
            continue;
        }
        const stats = parseLoudnormStats(analysis.stderr);
        if (!stats) {
            console.error(`✖️ Failed to parse stats for ${rel}`);
            continue;
        }

        // Calculate gain to boost quiet tracks
        const gainDB = -16 - stats.input_i;

        // 2) Normalization pass: apply dynamic normalization + volume
        const temp = path.join(
            path.dirname(filePath),
            `.norm-${path.basename(filePath)}`,
        );
        const filter = `volume=${gainDB.toFixed(2)}dB,dynaudnorm=f=150:g=15`; // dynamic range compressor

        const normalizeArgs = [
            "-i",
            filePath,
            "-af",
            filter,
            "-codec:a",
            "libmp3lame",
            "-b:a",
            `${bitrate}k`,
            "-y",
            temp,
        ];
        const normRes = runFfmpeg(normalizeArgs);
        if (normRes.status !== 0) {
            console.error(`✖️ Normalization failed for ${rel}`);
            await fs.unlink(temp).catch(() => {});
            continue;
        }

        await fs.rename(temp, filePath);
        console.log(`✅ Done: ${rel}`);
    }

    console.log("🎉 All files processed.");
}

normalizeAll().catch((err) => {
    console.error(err);
    process.exit(1);
});
