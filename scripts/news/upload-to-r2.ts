import fs from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const VIDEO_DIR = path.resolve(process.cwd(), "apps", "news-data", "videos");
const ENTRIES_DIR = path.resolve(
    process.cwd(),
    "apps",
    "news-data",
    "entries",
);

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

function extractPostIdFromFilename(filename: string): string {
    const match = filename.match(/news-(\d+)\./);
    return match ? match[1] : "";
}

async function updateMarkdownWithVideoUrl(
    entryPath: string,
    videoUrl: string,
): Promise<void> {
    const content = await fs.readFile(entryPath, "utf-8");

    // Replace the mediaSrc line
    const updatedContent = content.replace(
        /<!-- mediaSrc: .* -->/,
        `<!-- mediaSrc: ${videoUrl} -->`,
    );

    await fs.writeFile(entryPath, updatedContent, "utf-8");
    console.log(`  📝 Updated markdown: ${path.basename(entryPath)}`);
}

async function main() {
    console.log("📤 Starting R2 upload for news videos...");

    // Check if video directory exists
    try {
        await fs.access(VIDEO_DIR);
    } catch {
        console.error(`❌ Video directory not found: ${VIDEO_DIR}`);
        console.log("Please run get-news script first to download videos.");
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
    let updatedCount = 0;

    for (const videoFile of videoFiles) {
        console.log(`\n📹 Processing: ${videoFile}`);

        const videoPath = path.join(VIDEO_DIR, videoFile);
        const postId = extractPostIdFromFilename(videoFile);

        if (!postId) {
            console.warn(`  ⚠ Could not extract post ID from ${videoFile}`);
            continue;
        }

        // Upload to R2
        const r2Key = `news/videos/${videoFile}`;
        const videoUrl = await uploadToR2(videoPath, r2Key);

        if (!videoUrl) {
            continue;
        }

        uploadedCount++;

        // Find corresponding markdown file
        const entryFiles = await fs.readdir(ENTRIES_DIR);
        const matchingEntry = entryFiles.find((f) => {
            if (!f.endsWith(".md")) return false;
            const filePostID = extractPostIdFromFilename(f);
            return filePostID === postId;
        });

        if (matchingEntry) {
            const entryPath = path.join(ENTRIES_DIR, matchingEntry);
            await updateMarkdownWithVideoUrl(entryPath, videoUrl);
            updatedCount++;
        } else {
            console.warn(
                `  ⚠ Could not find markdown entry for post ID: ${postId}`,
            );
        }
    }

    console.log(`\n✅ Upload complete!`);
    console.log(`📤 Uploaded ${uploadedCount} videos to R2`);
    console.log(`📝 Updated ${updatedCount} markdown files`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});