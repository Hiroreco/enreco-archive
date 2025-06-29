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
            // Don't create the directory, just recurse into it
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

    console.log(`Copying images from ${SHARED_IMAGE_RESOURCES_FOLDER}`);
    for (const dest of IMAGE_DESTINATION) {
        const destPathRoot = path.join(process.cwd(), dest);
        await fs.mkdir(destPathRoot, { recursive: true });

        const srcImageDir = path.join(
            process.cwd(),
            SHARED_IMAGE_RESOURCES_FOLDER,
        );
        await copyFilesRecursively(srcImageDir, destPathRoot);
    }
    console.log("All resources copied successfully.");
}

copyResources().catch(console.error);
