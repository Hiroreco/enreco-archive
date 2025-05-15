import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

async function generateBlurDataURL(inputPath) {
    const buffer = await sharp(inputPath)
        .resize(8, 8, { fit: "inside" })
        .toBuffer();

    return `data:image/webp;base64,${buffer.toString("base64")}`;
}

async function optimizeImages() {
    const resourceDir = path.join(process.cwd(), "shared_resources");
    const publicDir = path.join(process.cwd(), "apps/website/public");
    const categories = ["characters", "teams", "others", "easter", "ui"];
    // Create a map to store blur data URLs
    const blurDataMap = {};

    for (const category of categories) {
        const inputDir = path.join(resourceDir, "images", category);
        const outputDir = path.join(publicDir, "images-opt");

        await fs.mkdir(outputDir, { recursive: true });

        const files = await fs.readdir(inputDir);

        for (const file of files) {
            if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
                const inputPath = path.join(inputDir, file);
                const outputPath = path.join(
                    outputDir,
                    `${path.parse(file).name}.webp`,
                );

                // Generate blur data URL
                const blurDataURL = await generateBlurDataURL(inputPath);
                blurDataMap[path.parse(file).name] = blurDataURL;

                // Leave quality for anything containing "bg" and "deco" slightly higher
                // Doing this because the compressed bg and deco looks really blurry
                let quality = 70;
                if (file.includes("bg") || file.includes("deco")) {
                    quality = 95;
                }

                await sharp(inputPath)
                    .webp({ quality: quality })
                    .toFile(outputPath);

                console.log(`Optimized: ${file}`);
            }
        }
    }

    // Save blur data URLs to a JSON file
    await fs.writeFile(
        path.join(publicDir, "/blur-data.json"),
        JSON.stringify(blurDataMap, null, 2),
    );
}

optimizeImages().catch(console.error);
