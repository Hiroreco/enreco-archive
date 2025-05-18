import fs from "fs/promises";
import path from "path";

const SHARED_RESOURCES_FOLDER = "shared_resources";
const RESOURCES_TO_COPY = [
    "chesterfield.woff2",
    "favicon.ico"
];
const DESTINATIONS = [
    "apps/editor/public",
    "apps/website/public",
];

async function copyResources() {
    for(const dest of DESTINATIONS) {
        for(const resource of RESOURCES_TO_COPY) {
            const destPath = path.join(process.cwd(), dest, resource);
            const resPath = path.join(process.cwd(), SHARED_RESOURCES_FOLDER, resource);
            console.log(`Copying ${resource} to ${dest}`);
            await fs.copyFile(resPath, destPath);
        }
    }
}

copyResources().catch(console.error);