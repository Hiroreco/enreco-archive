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
    const publicDir = path.join(process.cwd(), "public");
    const categories = ["characters", "teams", "others", "easter"];
    // Create a map to store blur data URLs
    const blurDataMap = {};

    for (const category of categories) {
        const inputDir = path.join(publicDir, "images", category);
        const outputDir = path.join(publicDir, "images", `original-optimized`);

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

                // Get original image dimensions
                const metadata = await sharp(inputPath).metadata();
                const reductionFactor = 70 / 100;
                const newDimensions = [
                    Math.floor(metadata.width * reductionFactor),
                    Math.floor(metadata.height * reductionFactor),
                ];

                await sharp(inputPath)
                    .resize(newDimensions[0], newDimensions[1], {
                        fit: "cover",
                        position: "center",
                    })
                    .webp({ quality: 70 })
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
