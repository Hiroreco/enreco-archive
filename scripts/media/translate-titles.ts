import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

interface ClipMetadata {
    id: string;
    originalUrl: string;
    title: string;
    thumbnailSrc: string;
    author: string;
    duration: number;
    uploadDate: string;
    categories: string[];
    chapter: number;
    contentType: "clip" | "stream";
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY_TRANSLATION;

if (!GEMINI_API_KEY) {
    console.error("❌ Please set GEMINI_API_KEY environment variable");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function translateTitle(title: string): Promise<string> {
    // const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s]/g, "").trim(); // Remove special characters
    const sanitizedTitle = title;
    const prompt = `Translate the following video title from English to Japanese. Maintain the context and tone suitable for anime/game content. Return the translated string, keeping all special characters as well, such as |. Keep "ENreco" as is.

Example:
KARMA | ENreco Animatic" → "カルマ | ENreco アニマティック

Title:
${sanitizedTitle}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translatedTitle = response.text().trim();

        if (!translatedTitle) {
            throw new Error("Empty translation received.");
        }

        return translatedTitle;
    } catch (error) {
        throw new Error(`Translation failed for title "${title}": ${error}`);
    }
}

async function processClipsFile(
    inputPath: string,
    outputPath: string,
): Promise<void> {
    try {
        const content = await fs.readFile(inputPath, "utf-8");
        const data = JSON.parse(content);

        if (!Array.isArray(data.clips)) {
            throw new Error("Invalid JSON structure: 'clips' array not found.");
        }

        let existingClips: ClipMetadata[] = [];
        try {
            const existingContent = await fs.readFile(outputPath, "utf-8");
            const existingData = JSON.parse(existingContent);
            existingClips = existingData.clips || [];
        } catch {
            console.log(
                "📁 No existing translated file found. Starting fresh.",
            );
        }

        const existingIds = new Set(existingClips.map((clip) => clip.id));
        const updatedClips = [...existingClips];

        console.log(`📋 Found ${data.clips.length} titles for translation.`);
        console.log(
            `🔍 Skipping ${existingClips.length} already translated clips.`,
        );

        for (const clip of data.clips) {
            if (existingIds.has(clip.id)) {
                // console.`log(
                //     `⏩ Skipping already translated clip: "${clip.title}"`,
                // );`
                continue;
            }

            console.log(`🌐 Translating title: "${clip.title}"`);
            try {
                const translatedTitle = await translateTitle(clip.title);
                console.log(
                    `✅ Translated: "${clip.title}" → "${translatedTitle}"`,
                );

                updatedClips.push({
                    ...clip,
                    title: translatedTitle,
                });

                // Save progress incrementally
                const outputData = { ...data, clips: updatedClips };
                await fs.mkdir(path.dirname(outputPath), { recursive: true });
                await fs.writeFile(
                    outputPath,
                    JSON.stringify(outputData, null, 2),
                    "utf-8",
                );
            } catch (error) {
                console.error(
                    `❌ Error translating title "${clip.title}": ${error}`,
                );
                // Add the original clip without translation to preserve data
                updatedClips.push(clip);
            }
        }

        console.log(`✅ Translated data saved to: ${outputPath}`);
    } catch (error) {
        console.error(`❌ Error processing clips file: ${error}`);
    }
}

async function syncAndSortClips(
    enPath: string,
    jaPath: string,
    outputPath: string,
): Promise<void> {
    try {
        const enContent = await fs.readFile(enPath, "utf-8");
        const jaContent = await fs.readFile(jaPath, "utf-8");

        const enData = JSON.parse(enContent);
        const jaData = JSON.parse(jaContent);

        if (!Array.isArray(enData.clips) || !Array.isArray(jaData.clips)) {
            throw new Error("Invalid JSON structure: 'clips' array not found.");
        }

        const enClipsMap = new Map(
            enData.clips.map((clip: ClipMetadata) => [clip.id, clip]),
        );

        const updatedJaClips = enData.clips.map((enClip: ClipMetadata) => {
            const jaClip = jaData.clips.find(
                (clip: ClipMetadata) => clip.id === enClip.id,
            );

            if (!jaClip) {
                console.warn(
                    `⚠️ Missing translation for clip ID: ${enClip.id}. Using English metadata.`,
                );
                return enClip; // Use English metadata if translation is missing
            }

            // Update metadata to match English version, but keep the translated title
            return {
                ...enClip,
                title: jaClip.title, // Keep the translated title
            };
        });

        const outputData = {
            ...jaData,
            clips: updatedJaClips,
        };

        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(
            outputPath,
            JSON.stringify(outputData, null, 2),
            "utf-8",
        );

        console.log(`✅ Synced and sorted clips saved to: ${outputPath}`);
    } catch (error) {
        console.error(`❌ Error syncing and sorting clips: ${error}`);
    }
}

async function main() {
    const inputPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        "en",
        "clips_en.json",
    );
    const outputPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        "ja",
        "clips_ja.json",
    );

    console.log("🚀 Starting translation pipeline...");
    await processClipsFile(inputPath, outputPath);
    await syncAndSortClips(inputPath, outputPath, outputPath);
    console.log("✨ Translation pipeline complete!");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
