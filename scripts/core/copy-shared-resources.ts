import fs from "fs/promises";
import path from "path";

const SHARED_RESOURCES_FOLDER = "shared-resources";
const SHARED_IMAGE_RESOURCES_FOLDER = path.join(
    SHARED_RESOURCES_FOLDER,
    "images",
);
const RESOURCES_TO_COPY = ["chesterfield.woff2", "favicon.ico"];
const DESTINATIONS = ["apps/editor/public", "apps/website/public"];
const IMAGE_DESTINATION = [
    "apps/editor/public/images-opt",
    "apps/website/public/images-opt",
];

async function copyFilesRecursively(srcDir: string, destDir: string) {
    const entries = await fs.readdir(srcDir, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);

        if (entry.isDirectory()) {
            await copyFilesRecursively(srcPath, destDir);
        } else {
            // Copy file directly to the destination directory (flattened)
            const destPath = path.join(destDir, entry.name);
            await fs.copyFile(srcPath, destPath);
        }
    }
}

async function copyResources() {
    for (const dest of DESTINATIONS) {
        const destPathRoot = path.join(process.cwd(), dest);
        await fs.mkdir(destPathRoot, { recursive: true });

        for (const resource of RESOURCES_TO_COPY) {
            const destPath = path.join(destPathRoot, resource);
            const resPath = path.join(
                process.cwd(),
                SHARED_RESOURCES_FOLDER,
                resource,
            );
            console.log(`Copying ${resource} to ${dest}`);
            await fs.copyFile(resPath, destPath);
        }
    }

    console.log(
        `\n🎬 Copying images and videos from ${SHARED_IMAGE_RESOURCES_FOLDER}`,
    );

    // First, let's see what's actually in the source directory
    const srcImageDir = path.join(process.cwd(), SHARED_IMAGE_RESOURCES_FOLDER);
    try {
        const allFiles = await fs.readdir(srcImageDir, {
            withFileTypes: true,
            recursive: true,
        });
        const mp4Files = allFiles.filter(
            (entry) => entry.isFile() && entry.name.endsWith(".mp4"),
        );
        const webpFiles = allFiles.filter(
            (entry) => entry.isFile() && entry.name.endsWith(".webp"),
        );

        console.log(`📊 Source directory contains:`);
        console.log(`   - ${mp4Files.length} MP4 files`);
        console.log(`   - ${webpFiles.length} WebP files`);
        console.log(
            `   - ${allFiles.filter((entry) => entry.isFile()).length} total files`,
        );
    } catch (err) {
        console.error(`❌ Error reading source directory:`, err);
    }

    for (const dest of IMAGE_DESTINATION) {
        console.log(`\n📂 Copying to ${dest}...`);
        const destPathRoot = path.join(process.cwd(), dest);
        await fs.mkdir(destPathRoot, { recursive: true });

        await copyFilesRecursively(srcImageDir, destPathRoot);

        // Verify what was actually copied
        try {
            const copiedFiles = await fs.readdir(destPathRoot);
            const copiedMp4Files = copiedFiles.filter((name) =>
                name.endsWith(".mp4"),
            );
            const copiedWebpFiles = copiedFiles.filter((name) =>
                name.endsWith(".webp"),
            );

            console.log(`📊 Destination ${dest} now contains:`);
            console.log(`   - ${copiedMp4Files.length} MP4 files`);
            console.log(`   - ${copiedWebpFiles.length} WebP files`);
            console.log(`   - ${copiedFiles.length} total files`);
        } catch (err) {
            console.error(`❌ Error reading destination directory:`, err);
        }
    }

    console.log("\n✅ All resources copied successfully.");
}

copyResources().catch(console.error);
