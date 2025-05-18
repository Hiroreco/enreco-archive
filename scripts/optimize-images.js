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
    const resourceDir = path.join(process.cwd(), "resources");
    const publicDir = path.join(process.cwd(), "public");
    const categories = [
        "characters",
        "teams",
        "others",
        "easter",
        "ui",
        "gallery",
    ];
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
                const fileName = path.parse(file).name;
                const outputPath = path.join(outputDir, `${fileName}.webp`);

                // Generate blur data URL
                const blurDataURL = await generateBlurDataURL(inputPath);
                blurDataMap[fileName] = blurDataURL;

                // Set quality based on image type
                let quality = 70;
                if (file.includes("bg") || file.includes("deco")) {
                    quality = 95;
                }

                // Process main image
                await sharp(inputPath)
                    .webp({ quality: quality })
                    .toFile(outputPath);

                // Generate thumbnail for gallery images
                if (category === "gallery") {
                    const thumbnailPath = path.join(
                        outputDir,
                        `${fileName}-thumbnail.webp`,
                    );
                    await sharp(inputPath)
                        .resize(204, 113, {
                            fit: "cover",
                            position: "center",
                        })
                        .webp({ quality: 80 })
                        .toFile(thumbnailPath);

                    console.log(
                        `Generated thumbnail: ${fileName}-thumbnail.webp`,
                    );
                }

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
