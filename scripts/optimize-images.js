import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const SHARED_IMAGES_FOLDER = "shared_resources/images";
const DESTINATIONS = [
    "apps/editor/public",
    "apps/website/public",
];
const CATEGORIES = ["characters", "teams", "others", "easter", "ui"];

async function generateBlurDataURL(inputPath) {
    const buffer = await sharp(inputPath)
        .resize(8, 8, { fit: "inside" })
        .toBuffer();

    return `data:image/webp;base64,${buffer.toString("base64")}`;
}

async function optimizeImages() {
    const resourceDir = path.join(process.cwd(), SHARED_IMAGES_FOLDER);
    // Create a map to store blur data URLs
    const blurDataMap = {};

    for (const category of CATEGORIES) {
        const inputDir = path.join(resourceDir, category);

        const files = await fs.readdir(inputDir);

        for (const file of files) {
            if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
                const inputPath = path.join(inputDir, file);
                
                // Generate blur data URL
                const blurDataURL = await generateBlurDataURL(inputPath);
                blurDataMap[path.parse(file).name] = blurDataURL;

                // Leave quality for anything containing "bg" and "deco" slightly higher
                // Doing this because the compressed bg and deco looks really blurry
                let quality = 70;
                if (file.includes("bg") || file.includes("deco")) {
                    quality = 95;
                }

                const buffer = await sharp(inputPath)
                    .webp({ quality: quality })
                    .toBuffer();
                
                for(const dest of DESTINATIONS) {
                    const outputDir = path.join(process.cwd(), dest, "images-opt");
                    await fs.mkdir(outputDir, { recursive: true });
                    const outputPath = path.join(
                        outputDir,
                        // Uncomment to enabled nested paths.
                        //path.parse(file).dir,
                        `${path.parse(file).name}.webp`,
                    );

                    await fs.writeFile(outputPath, buffer);
                }

                console.log(`Optimized: ${file}`);
            }
        }
    }

    for(const dest of DESTINATIONS) {
        const outputPath = path.join(
            process.cwd(),
            dest,
            "blur-data.json"
        );
        // Save blur data URLs to a JSON file
        await fs.writeFile(
            outputPath,
            JSON.stringify(blurDataMap, null, 2),
        );
        console.log(`Blur data written to ${outputPath}`);
    }
    
}

optimizeImages().catch(console.error);
