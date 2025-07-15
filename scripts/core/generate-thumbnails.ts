import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const SHARED_IMAGES_FOLDER = "shared-resources/images";
const SHARED_VIDEOS_FOLDER = "shared-resources/videos";
const DESTINATIONS = ["shared-resources/thumbnails"];
const BLUR_DATA_DESTINATION = "shared-resources";

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

async function generateVideoThumbnail(
    inputPath: string,
    outputPath: string,
): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .screenshots({
                timestamps: ["10%"], // Take screenshot at 10% of video duration
                filename: path.basename(outputPath),
                folder: path.dirname(outputPath),
                size: "300x?", // Width 300, height auto-calculated
            })
            .on("end", () => {
                console.log(
                    `  ✅ Generated video thumbnail: ${path.basename(outputPath)}`,
                );
                resolve();
            })
            .on("error", (err) => {
                // Try fallback - first frame
                console.log(`  ⚠️ Failed at 10%, trying first frame...`);
                ffmpeg(inputPath)
                    .screenshots({
                        timestamps: ["00:00:01"], // First second
                        filename: path.basename(outputPath),
                        folder: path.dirname(outputPath),
                        size: "300x?",
                    })
                    .on("end", () => {
                        console.log(
                            `  ✅ Generated video thumbnail (fallback): ${path.basename(outputPath)}`,
                        );
                        resolve();
                    })
                    .on("error", reject);
            });
    });
}

async function generateThumbnailsAndBlurData() {
    const resourceDir = path.resolve(process.cwd(), SHARED_IMAGES_FOLDER);
    const videoDir = path.resolve(process.cwd(), SHARED_VIDEOS_FOLDER);
    const allFiles = await walkDir(resourceDir);
    const allVideoFiles = await walkDir(videoDir);

    // All image files (for blur data)
    const allImageFiles = allFiles.filter((f) => {
        const extMatch = f.match(/\.(jpe?g|png|webp)$/i);
        return !!extMatch;
    });

    // All video files from video directory
    const videoFiles = allVideoFiles.filter((f) => {
        const extMatch = f.match(/\.(mp4|webm|mov)$/i);
        return !!extMatch;
    });

    // Only images in glossary and fanart folders (for thumbnails)
    const thumbnailFiles = allImageFiles.filter((f) => {
        const relPath = path.relative(resourceDir, f);
        const parsed = path.parse(relPath);
        const firstDir = parsed.dir.split(path.sep)[0];

        return firstDir === "glossary" || firstDir === "fanart";
    });

    // All videos are considered for thumbnails (since they're in the dedicated video folder)
    const videoThumbnailFiles = videoFiles;

    const blurDataMap: Record<string, string> = {};

    console.log(`Found ${allImageFiles.length} images for blur data`);
    console.log(`Found ${thumbnailFiles.length} images for thumbnails`);
    console.log(`Found ${videoThumbnailFiles.length} videos for thumbnails`);
    console.log("Generating thumbnails and blur data...");

    // Generate blur data for all images
    for (const inputPath of allImageFiles) {
        const relPath = path.relative(resourceDir, inputPath);
        const parsed = path.parse(relPath);
        const name = parsed.name;
        // Read file and generate blur data
        const originalBuffer = await fs.readFile(inputPath);
        const blurSharp = sharp(originalBuffer)
            .resize(8, 8, { fit: "inside" })
            .webp();
        const blurBuffer = await blurSharp.toBuffer();
        blurSharp.destroy();
        blurDataMap[name] =
            `data:image/webp;base64,${blurBuffer.toString("base64")}`;
    }

    // Generate thumbnails for glossary and fanart images
    for (const inputPath of thumbnailFiles) {
        const relPath = path.relative(resourceDir, inputPath);
        const parsed = path.parse(relPath);
        const name = parsed.name;
        const firstDir = parsed.dir.split(path.sep)[0];

        // Read file and get metadata
        const originalBuffer = await fs.readFile(inputPath);
        const metadataSharp = sharp(originalBuffer);
        const metadata = await metadataSharp.metadata();
        metadataSharp.destroy();

        let thumbBuffer: Buffer;

        if (firstDir === "glossary") {
            // Glossary thumbnails - square or landscape
            const aspect = (metadata.width || 1) / (metadata.height || 1);
            const thumbOpts =
                Math.abs(aspect - 1) < 0.1
                    ? { width: 100, height: 100 }
                    : { width: 204, height: 113 };

            const thumbSharp = sharp(originalBuffer)
                .resize(thumbOpts.width, thumbOpts.height, {
                    fit: "cover",
                    position: "center",
                })
                .webp({ quality: 80 });
            thumbBuffer = await thumbSharp.toBuffer();
            thumbSharp.destroy();
        } else if (firstDir === "fanart") {
            // Fanart thumbnails - preserve aspect ratio
            const aspect = (metadata.width || 1) / (metadata.height || 1);
            const thumbWidth = Math.min(300, metadata.width || 300);
            const thumbHeight = Math.round(thumbWidth / aspect);

            const fanartSharp = sharp(originalBuffer)
                .resize(thumbWidth, thumbHeight, {
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .webp({ quality: 80 });
            thumbBuffer = await fanartSharp.toBuffer();
            fanartSharp.destroy();
        } else {
            continue; // Skip if not glossary or fanart
        }

        // Write thumbnails to all destinations
        for (const dest of DESTINATIONS) {
            const outDir = path.join(process.cwd(), dest);
            await fs.mkdir(outDir, { recursive: true });
            await fs.writeFile(
                path.join(outDir, `${name}-thumb.webp`),
                thumbBuffer,
            );
        }

        // Generate blur data for the thumbnail
        const thumbBlurSharp = sharp(thumbBuffer)
            .resize(8, 8, { fit: "inside" })
            .webp();
        const thumbBlurBuffer = await thumbBlurSharp.toBuffer();
        thumbBlurSharp.destroy();
        blurDataMap[`${name}-thumb`] =
            `data:image/webp;base64,${thumbBlurBuffer.toString("base64")}`;
    }

    // Generate thumbnails for videos
    for (const inputPath of videoThumbnailFiles) {
        const relPath = path.relative(videoDir, inputPath);
        const parsed = path.parse(relPath);
        const name = parsed.name;

        console.log(`→ Generating video thumbnail for: ${name}`);

        // Generate thumbnail for each destination
        for (const dest of DESTINATIONS) {
            const outDir = path.join(process.cwd(), dest);
            await fs.mkdir(outDir, { recursive: true });

            // Generate raw thumbnail first (PNG format from ffmpeg)
            const tempThumbnailPath = path.join(
                outDir,
                `${name}-thumb-temp.png`,
            );

            try {
                await generateVideoThumbnail(inputPath, tempThumbnailPath);

                // Convert to WebP and optimize
                const rawBuffer = await fs.readFile(tempThumbnailPath);
                const thumbSharp = sharp(rawBuffer)
                    .resize(300, null, {
                        fit: "inside",
                        withoutEnlargement: true,
                    })
                    .webp({ quality: 80 });
                const thumbBuffer = await thumbSharp.toBuffer();
                thumbSharp.destroy();

                // Write final WebP thumbnail
                const finalThumbnailPath = path.join(
                    outDir,
                    `${name}-thumb.webp`,
                );
                await fs.writeFile(finalThumbnailPath, thumbBuffer);

                // Clean up temp file
                await fs.unlink(tempThumbnailPath);

                // Generate blur data for video thumbnail (only once)
                if (dest === DESTINATIONS[0]) {
                    const thumbBlurSharp = sharp(thumbBuffer)
                        .resize(8, 8, { fit: "inside" })
                        .webp();
                    const thumbBlurBuffer = await thumbBlurSharp.toBuffer();
                    thumbBlurSharp.destroy();
                    blurDataMap[`${name}-thumb`] =
                        `data:image/webp;base64,${thumbBlurBuffer.toString("base64")}`;
                }
            } catch (err) {
                console.error(
                    `  ✖ Failed to generate thumbnail for ${name}:`,
                    err,
                );

                // Create a fallback placeholder thumbnail
                const placeholderSharp = sharp({
                    create: {
                        width: 300,
                        height: 169, // 16:9 aspect ratio
                        channels: 4,
                        background: { r: 0, g: 0, b: 0, alpha: 0.8 },
                    },
                }).webp({ quality: 80 });

                const placeholderBuffer = await placeholderSharp.toBuffer();
                placeholderSharp.destroy();

                const finalThumbnailPath = path.join(
                    outDir,
                    `${name}-thumb.webp`,
                );
                await fs.writeFile(finalThumbnailPath, placeholderBuffer);

                // Generate blur data for placeholder (only once)
                if (dest === DESTINATIONS[0]) {
                    blurDataMap[`${name}-thumb`] =
                        "data:image/webp;base64,UklGRnoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA";
                }
            }
        }
    }

    // Write blur data JSON
    const outJSON = path.join(
        process.cwd(),
        BLUR_DATA_DESTINATION,
        "blur-data.json",
    );
    await fs.mkdir(path.dirname(outJSON), { recursive: true });
    await fs.writeFile(outJSON, JSON.stringify(blurDataMap, null, 2), "utf-8");
    console.log(`📝 Wrote blur-data.json to ${BLUR_DATA_DESTINATION}`);

    console.log("✅ All thumbnails and blur data generated.");
}

generateThumbnailsAndBlurData().catch((err) => {
    console.error(err);
    process.exit(1);
});
