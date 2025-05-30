import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const SHARED_IMAGES_FOLDER = "shared-resources/images";
const DESTINATIONS = ["apps/editor/public", "apps/website/public"];

/** Resize small and base64‐encode */
async function generateBlurDataURL(inputPath: string) {
    const buffer = await sharp(inputPath)
        .resize(8, 8, { fit: "inside" })
        .webp()
        .toBuffer();

    return `data:image/webp;base64,${buffer.toString("base64")}`;
}

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

async function optimizeImages() {
    const resourceDir = path.resolve(process.cwd(), SHARED_IMAGES_FOLDER);
    const allFiles = await walkDir(resourceDir);

    // Filter to only images
    const imageFiles = allFiles.filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

    const blurDataMap: Record<string, string> = {};

    for (const inputPath of imageFiles) {
        const relPath = path.relative(resourceDir, inputPath);
        const parsed = path.parse(relPath);
        const name = parsed.name; // file name without extension

        // 1) Blur data
        const blurDataURL = await generateBlurDataURL(inputPath);
        blurDataMap[name] = blurDataURL;

        // 2) Quality
        let quality = 70;
        if (/bg|deco/i.test(name)) {
            quality = 95;
        }

        // 3) Convert to WebP
        const webpBuffer = await sharp(inputPath).webp({ quality }).toBuffer();

        // 4) Write to all destinations
        for (const dest of DESTINATIONS) {
            const outDir = path.join(process.cwd(), dest, "images-opt");
            await fs.mkdir(outDir, { recursive: true });

            // main file
            await fs.writeFile(path.join(outDir, `${name}.webp`), webpBuffer);

            // 5) If this file is under "glossary", also emit thumbnail
            if (parsed.dir.split(path.sep)[0] === "glossary") {
                const thumbBuffer = await sharp(inputPath)
                    .resize(204, 113, {
                        fit: "cover",
                        position: "center",
                    })
                    .webp({ quality: 80 })
                    .toBuffer();

                await fs.writeFile(
                    path.join(outDir, `${name}-thumb.webp`),
                    thumbBuffer,
                );
                console.log(`Generated thumbnail: ${name}-thumb.webp`);
            }
        }

        console.log(`Optimized: ${relPath}`);
    }

    // 6) Write blur-data.json
    for (const dest of DESTINATIONS) {
        const outJSON = path.join(process.cwd(), dest, "blur-data.json");
        await fs.writeFile(
            outJSON,
            JSON.stringify(blurDataMap, null, 2),
            "utf-8",
        );
        console.log(`Blur data written to ${outJSON}`);
    }
}

optimizeImages().catch((err) => {
    console.error(err);
    process.exit(1);
});
