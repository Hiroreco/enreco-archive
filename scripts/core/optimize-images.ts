import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const SHARED_IMAGES_FOLDER = "shared-resources/images";
const SHARED_VIDEOS_FOLDER = "shared-resources/new-videos";

/** Recursively walk a directory and return all file paths */
async function walkDir(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await walkDir(fullPath)));
        } else if (entry.isFile()) {
            files.push(fullPath);
        }
    }
    return files;
}

async function optimizeVideo(inputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const parsed = path.parse(inputPath);
        const dir = path.dirname(inputPath);
        const name = parsed.name;
        const optimizedName = `${name}-opt.mp4`;
        const optimizedPath = path.join(dir, optimizedName);

        ffmpeg(inputPath)
            .videoCodec("libx264")
            .audioCodec("aac")
            // Remove the .size() and .videoBitrate() calls - let CRF handle quality
            .audioBitrate("96k") // Keep audio bitrate low
            .outputOptions([
                "-preset slow", // Best compression (takes longer but much better results)
                "-crf 28", // Higher CRF for more compression - this is the key
                "-movflags +faststart",
                "-profile:v high", // Use high profile instead of baseline for better compression
                "-level 4.0", // Higher level for better compression
                "-pix_fmt yuv420p",
                // Advanced compression options that online compressors use:
                "-x264-params ref=3:bframes=3:b-adapt=2:direct=auto:me=umh:subme=8:analyse=all:8x8dct=1:trellis=2:nr=25:deadzone-inter=21:deadzone-intra=11:cqm=jvt:aq-strength=1.0:qcomp=0.6",
                // Denoising and preprocessing
                "-vf scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease,unsharp=5:5:1.0:5:5:0.0", // Keep 720p but add sharpening filter
            ])
            .output(optimizedPath)
            .on("progress", (progress) => {
                // Show progress like online compressors do
                if (progress.percent) {
                    process.stdout.write(
                        `\r    Progress: ${Math.round(progress.percent)}%`,
                    );
                }
            })
            .on("end", async () => {
                try {
                    process.stdout.write("\n"); // New line after progress
                    const originalStats = await fs.stat(inputPath);
                    const optimizedStats = await fs.stat(optimizedPath);
                    const compressionRatio = (
                        ((originalStats.size - optimizedStats.size) /
                            originalStats.size) *
                        100
                    ).toFixed(1);

                    const originalSizeMB = (
                        originalStats.size /
                        (1024 * 1024)
                    ).toFixed(2);
                    const optimizedSizeMB = (
                        optimizedStats.size /
                        (1024 * 1024)
                    ).toFixed(2);

                    await fs.unlink(inputPath);
                    console.log(
                        `  ✅ Optimized video: ${optimizedName} (${originalSizeMB}MB → ${optimizedSizeMB}MB, ${compressionRatio}% smaller)`,
                    );
                    resolve();
                } catch (err) {
                    reject(err);
                }
            })
            .on("error", reject)
            .run();
    });
}

async function optimizeImages() {
    const resourceDir = path.resolve(process.cwd(), SHARED_IMAGES_FOLDER);
    const videoDir = path.resolve(process.cwd(), SHARED_VIDEOS_FOLDER);

    const allImageFiles = await walkDir(resourceDir);
    const allVideoFiles = await walkDir(videoDir);

    // Separate images and videos
    const imageFiles = allImageFiles.filter((f) => {
        const extMatch = f.match(/\.(jpe?g|png|webp)$/i);
        if (!extMatch) return false;
        const name = path.parse(f).name;
        return !name.endsWith("-opt");
    });

    const videoFiles = allVideoFiles.filter((f) => {
        const extMatch = f.match(/\.(mp4|webm|mov)$/i);
        if (!extMatch) return false;
        const name = path.parse(f).name;
        return !name.endsWith("-opt");
    });

    console.log(
        `Found ${imageFiles.length} images and ${videoFiles.length} videos to optimize`,
    );

    // Optimize images
    for (const inputPath of imageFiles) {
        const relPath = path.relative(resourceDir, inputPath);
        const parsed = path.parse(relPath);
        const dir = path.dirname(inputPath);
        const name = parsed.name;

        console.log(`→ Optimizing image: ${relPath}`);

        const originalBuffer = await fs.readFile(inputPath);
        let quality = 70;
        if (/bg|deco/i.test(name)) quality = 95;

        const optimizeSharp = sharp(originalBuffer).webp({ quality });
        const webpBuffer = await optimizeSharp.toBuffer();
        optimizeSharp.destroy();

        const optimizedName = `${name}-opt.webp`;
        const newInputPath = path.join(dir, optimizedName);
        await fs.writeFile(newInputPath, webpBuffer);
        await fs.unlink(inputPath);
        console.log(`  ✅ Created optimized ${optimizedName}`);
    }

    // Rename videos / no need to optimize, replace old video with new name
    for (const inputPath of videoFiles) {
        const relPath = path.relative(videoDir, inputPath);
        const parsed = path.parse(inputPath);
        const dir = path.dirname(inputPath);
        const name = parsed.name;
        const newName = `${name}-opt.mp4`;
        const newInputPath = path.join(dir, newName);
        await fs.rename(inputPath, newInputPath);

        console.log(`→ Renamed video: ${relPath} to ${newName}`);
    }

    console.log("✅ All media optimized.");
}

optimizeImages().catch((err) => {
    console.error(err);
    process.exit(1);
});
