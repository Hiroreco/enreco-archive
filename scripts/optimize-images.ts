// scripts/optimize-images.ts
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

    // Only image sources (we'll produce <name>-opt.webp)
    // skip any file whose base name already ends in "-opt"
    const imageFiles = allFiles.filter((f) => {
        const extMatch = f.match(/\.(jpe?g|png|webp)$/i);
        if (!extMatch) return false;
        const name = path.parse(f).name;
        return !name.endsWith("-opt");
    });

    // Gather blur data for all originals
    const blurDataMap: Record<string, string> = {};

    for (const inputPath of imageFiles) {
        const relPath = path.relative(resourceDir, inputPath);
        const parsed = path.parse(relPath);
        const dir = path.dirname(inputPath);
        const name = parsed.name;

        // If we've already produced name-opt.webp, skip
        const optimizedName = `${name}-opt.webp`;
        const optimizedPath = path.join(dir, optimizedName);
        try {
            await fs.access(optimizedPath);
            console.log(`↻ Skipping already-optimized: ${relPath}`);
            continue;
        } catch {
            // proceed
        }

        console.log(`→ Optimizing: ${relPath}`);

        // 1) Blur data (still keyed by base name)
        blurDataMap[name] = await generateBlurDataURL(inputPath);

        // 2) Quality
        let quality = 70;
        if (/bg|deco/i.test(name)) quality = 95;

        // 3) Re‑encode to WebP optimized
        const webpBuffer = await sharp(inputPath).webp({ quality }).toBuffer();

        // 4) Write optimized file _in place_
        await fs.writeFile(optimizedPath, webpBuffer);
        console.log(
            `  ✅ Wrote optimized ${path.join(parsed.dir, optimizedName)}`,
        );

        // 5) If under glossary, also produce thumbnail in each DESTINATION
        if (parsed.dir.split(path.sep)[0] === "glossary") {
            const metadata = await sharp(inputPath).metadata();
            const aspect = (metadata.width || 1) / (metadata.height || 1);
            const thumbOpts =
                Math.abs(aspect - 1) < 0.1
                    ? { width: 100, height: 100 }
                    : { width: 204, height: 113 };

            const thumbBuffer = await sharp(inputPath)
                .resize(thumbOpts.width, thumbOpts.height, {
                    fit: "cover",
                    position: "center",
                })
                .webp({ quality: 80 })
                .toBuffer();
            for (const dest of DESTINATIONS) {
                const outDir = path.join(process.cwd(), dest, "images-opt");
                await fs.mkdir(outDir, { recursive: true });
                await fs.writeFile(
                    path.join(outDir, `${name}-thumb.webp`),
                    thumbBuffer,
                );
            }
            console.log(`  🖼 Generated thumbnail for ${name}`);
        }
    }

    // 6) Write blur-data.json into each DESTINATION
    for (const dest of DESTINATIONS) {
        const outJSON = path.join(process.cwd(), dest, "blur-data.json");
        await fs.mkdir(path.dirname(outJSON), { recursive: true });
        await fs.writeFile(
            outJSON,
            JSON.stringify(blurDataMap, null, 2),
            "utf-8",
        );
        console.log(`📝 Wrote blur-data.json to ${dest}`);
    }

    console.log("✅ All images processed.");
}

optimizeImages().catch((err) => {
    console.error(err);
    process.exit(1);
});
