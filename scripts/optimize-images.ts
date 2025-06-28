// scripts/optimize-images.ts
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const SHARED_IMAGES_FOLDER = "shared-resources/images";
const DESTINATIONS = ["apps/editor/public", "apps/website/public"];

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

    // Only original images (no -opt in the name)
    const imageFiles = allFiles.filter((f) => {
        const extMatch = f.match(/\.(jpe?g|png|webp)$/i);
        if (!extMatch) return false;
        const name = path.parse(f).name;
        return !name.endsWith("-opt");
    });

    const blurDataMap: Record<string, string> = {};

    for (const inputPath of imageFiles) {
        const relPath = path.relative(resourceDir, inputPath);
        const parsed = path.parse(relPath);
        const dir = path.dirname(inputPath);
        const name = parsed.name;

        console.log(`→ Optimizing: ${relPath}`);

        // 1) Read file into memory buffer first
        const originalBuffer = await fs.readFile(inputPath);

        // 2) Blur data - use buffer instead of file path
        const blurSharp = sharp(originalBuffer)
            .resize(8, 8, { fit: "inside" })
            .webp();
        const blurBuffer = await blurSharp.toBuffer();
        blurSharp.destroy();
        blurDataMap[name] =
            `data:image/webp;base64,${blurBuffer.toString("base64")}`;

        // 3) Quality
        let quality = 70;
        if (/bg|deco/i.test(name)) quality = 95;

        // 4) Get metadata - use buffer instead of file path
        const metadataSharp = sharp(originalBuffer);
        const metadata = await metadataSharp.metadata();
        metadataSharp.destroy();

        // 5) Re‑encode to WebP - use buffer instead of file path
        const optimizeSharp = sharp(originalBuffer).webp({ quality });
        const webpBuffer = await optimizeSharp.toBuffer();
        optimizeSharp.destroy();

        // 6) Write optimized file with -opt suffix as .webp
        const optimizedName = `${name}-opt.webp`;
        const optimizedPath = path.join(dir, optimizedName);
        await fs.writeFile(optimizedPath, webpBuffer);
        console.log(`  ✅ Created optimized ${optimizedName}`);

        // 7) Thumbnails for glossary - USE MEMORY BUFFER
        if (parsed.dir.split(path.sep)[0] === "glossary") {
            const aspect = (metadata.width || 1) / (metadata.height || 1);
            const thumbOpts =
                Math.abs(aspect - 1) < 0.1
                    ? { width: 100, height: 100 }
                    : { width: 204, height: 113 };

            const thumbSharp = sharp(webpBuffer)
                .resize(thumbOpts.width, thumbOpts.height, {
                    fit: "cover",
                    position: "center",
                })
                .webp({ quality: 80 });
            const thumbBuffer = await thumbSharp.toBuffer();
            thumbSharp.destroy();

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

        // 8) Thumbnails for fanart - USE MEMORY BUFFER
        if (parsed.dir.split(path.sep)[0] === "fanart") {
            const aspect = (metadata.width || 1) / (metadata.height || 1);
            const thumbWidth = Math.min(300, metadata.width || 300);
            const thumbHeight = Math.round(thumbWidth / aspect);

            const fanartSharp = sharp(webpBuffer)
                .resize(thumbWidth, thumbHeight, {
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .webp({ quality: 80 });
            const thumbBuffer = await fanartSharp.toBuffer();
            fanartSharp.destroy();

            for (const dest of DESTINATIONS) {
                const outDir = path.join(process.cwd(), dest, "images-opt");
                await fs.mkdir(outDir, { recursive: true });
                await fs.writeFile(
                    path.join(outDir, `${name}-thumb.webp`),
                    thumbBuffer,
                );
            }
            console.log(`  🖼 Generated fanart thumbnail for ${name}`);
        }

        // 9) Replace original with optimized version - keep -opt suffix and change extension to .webp
        const newInputPath = path.join(dir, `${name}-opt.webp`);
        await fs.unlink(inputPath);
        await fs.rename(optimizedPath, newInputPath);
        console.log(
            `  🔄 Replaced ${path.basename(inputPath)} with ${name}-opt.webp`,
        );
    }

    // 10) Write blur-data.json into each DESTINATION
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
