import fs from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const VIDEO_DIR = path.resolve(process.cwd(), "shared-resources", "new-videos");

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_VIDEOS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_VIDEOS_SECRET_ACCESS_KEY!,
    },
});

const R2_BUCKET = process.env.R2_VIDEOS_BUCKET_NAME || "videos";
const CDN_URL = "https://cdn.enreco-archive.net";

async function uploadToR2(
    filePath: string,
    key: string,
): Promise<string | null> {
    try {
        const fileContent = await fs.readFile(filePath);
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: fileContent,
            ContentType: "video/mp4",
        });

        await r2.send(command);
        const publicUrl = `${CDN_URL}/${key}`;
        console.log(`  ✅ Uploaded to R2: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error(`  ✖ Failed to upload ${key}:`, error);
        return null;
    }
}

async function main() {
    console.log("📤 Starting R2 upload for news videos...");

    // Check if video directory exists
    try {
        await fs.access(VIDEO_DIR);
    } catch {
        console.error(`❌ Video directory not found: ${VIDEO_DIR}`);
        process.exit(1);
    }

    // Get all video files
    const files = await fs.readdir(VIDEO_DIR);
    const videoFiles = files.filter((f) => /\.(mp4|webm|mov)$/i.test(f));

    console.log(`📊 Found ${videoFiles.length} video files to upload`);

    if (videoFiles.length === 0) {
        console.log("⚠ No videos to upload. Exiting.");
        return;
    }

    let uploadedCount = 0;

    for (const videoFile of videoFiles) {
        console.log(`\n📹 Processing: ${videoFile}`);

        const videoPath = path.join(VIDEO_DIR, videoFile);

        // Upload to R2
        const r2Key = `${videoFile}`;
        const videoUrl = await uploadToR2(videoPath, r2Key);

        if (!videoUrl) {
            continue;
        }

        uploadedCount++;
    }

    console.log(`\n✅ Upload complete!`);
    console.log(`📤 Uploaded ${uploadedCount} videos to R2`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
