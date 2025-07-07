// scripts/optimize-images.ts
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const SHARED_IMAGES_FOLDER = "shared-resources/images";

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

    for (const inputPath of imageFiles) {
        const relPath = path.relative(resourceDir, inputPath);
        const parsed = path.parse(relPath);
        const dir = path.dirname(inputPath);
        const name = parsed.name;

        console.log(`→ Optimizing: ${relPath}`);

        // 1) Read file into memory buffer first
        const originalBuffer = await fs.readFile(inputPath);

        // 2) Quality
        let quality = 70;
        if (/bg|deco/i.test(name)) quality = 95;

        // 3) Re‑encode to WebP - use buffer instead of file path
        const optimizeSharp = sharp(originalBuffer).webp({ quality });
        const webpBuffer = await optimizeSharp.toBuffer();
        optimizeSharp.destroy();

        // 4) Write optimized file with -opt suffix as .webp
        const optimizedName = `${name}-opt.webp`;
        const optimizedPath = path.join(dir, optimizedName);
        await fs.writeFile(optimizedPath, webpBuffer);
        console.log(`  ✅ Created optimized ${optimizedName}`);

        // 5) Replace original with optimized version - keep -opt suffix and change extension to .webp
        const newInputPath = path.join(dir, `${name}-opt.webp`);
        await fs.unlink(inputPath);
        await fs.rename(optimizedPath, newInputPath);
        console.log(
            `  🔄 Replaced ${path.basename(inputPath)} with ${name}-opt.webp`,
        );
    }

    console.log("✅ All images optimized.");
}

optimizeImages().catch((err) => {
    console.error(err);
    process.exit(1);
});
