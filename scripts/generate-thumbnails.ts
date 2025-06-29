// scripts/generate-thumbnails.ts
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

async function generateThumbnailsAndBlurData() {
    const resourceDir = path.resolve(process.cwd(), SHARED_IMAGES_FOLDER);
    const allFiles = await walkDir(resourceDir);

    // All image files (for blur data)
    const allImageFiles = allFiles.filter((f) => {
        const extMatch = f.match(/\.(jpe?g|png|webp)$/i);
        return !!extMatch;
    });

    // Only images in glossary and fanart folders (for thumbnails)
    const thumbnailFiles = allImageFiles.filter((f) => {
        const relPath = path.relative(resourceDir, f);
        const parsed = path.parse(relPath);
        const firstDir = parsed.dir.split(path.sep)[0];

        return firstDir === "glossary" || firstDir === "fanart";
    });

    const blurDataMap: Record<string, string> = {};

    console.log(`Found ${allImageFiles.length} images for blur data`);
    console.log(`Found ${thumbnailFiles.length} images for thumbnails`);

    // Generate blur data for all images
    for (const inputPath of allImageFiles) {
        const relPath = path.relative(resourceDir, inputPath);
        const parsed = path.parse(relPath);
        const name = parsed.name;

        console.log(`→ Generating blur data for: ${relPath}`);

        // Read file and generate blur data
        const originalBuffer = await fs.readFile(inputPath);
        const blurSharp = sharp(originalBuffer)
            .resize(8, 8, { fit: "inside" })
            .webp();
        const blurBuffer = await blurSharp.toBuffer();
        blurSharp.destroy();
        blurDataMap[name] =
            `data:image/webp;base64,${blurBuffer.toString("base64")}`;

        console.log(`  ✨ Generated blur data for ${name}`);
    }

    // Generate thumbnails for glossary and fanart images
    for (const inputPath of thumbnailFiles) {
        const relPath = path.relative(resourceDir, inputPath);
        const parsed = path.parse(relPath);
        const name = parsed.name;
        const firstDir = parsed.dir.split(path.sep)[0];

        console.log(`→ Generating thumbnail for: ${relPath}`);

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
            const outDir = path.join(process.cwd(), dest, "images-opt");
            await fs.mkdir(outDir, { recursive: true });
            await fs.writeFile(
                path.join(outDir, `${name}-thumb.webp`),
                thumbBuffer,
            );
        }
        console.log(`  🖼 Generated thumbnail for ${name}`);
    }

    // Write blur-data.json into each DESTINATION
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

    console.log("✅ All thumbnails and blur data generated.");
}

generateThumbnailsAndBlurData().catch((err) => {
    console.error(err);
    process.exit(1);
});
