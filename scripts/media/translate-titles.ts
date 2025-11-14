import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

interface ClipMetadata {
    id: string;
    originalUrl: string;
    title: string;
    title_ja: string;
    thumbnailSrc: string;
    author: string;
    duration: number;
    uploadDate: string;
    categories: string[];
    chapter: number;
    contentType: "clip" | "stream";
}

interface ClipsData {
    clips: ClipMetadata[];
    streams: ClipMetadata[];
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY_TRANSLATION;

if (!GEMINI_API_KEY) {
    console.error("❌ Please set GEMINI_API_KEY environment variable");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function translateTitle(title: string): Promise<string> {
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

async function translateTitles() {
    const enPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        "en",
        "clips_en.json",
    );

    console.log("🚀 Starting translation pipeline...\n");

    const content = await fs.readFile(enPath, "utf-8");
    const data: ClipsData = JSON.parse(content);

    let clipsTranslated = 0;
    let streamsTranslated = 0;

    // Translate clips
    console.log(`📋 Processing ${data.clips.length} clips...`);
    for (let i = 0; i < data.clips.length; i++) {
        const clip = data.clips[i];

        // Skip if already translated
        if (clip.title_ja && clip.title_ja.trim() !== "") {
            continue;
        }

        console.log(
            `🌐 [${i + 1}/${data.clips.length}] Translating: "${clip.title}"`,
        );

        try {
            const translatedTitle = await translateTitle(clip.title);
            clip.title_ja = translatedTitle;
            clipsTranslated++;

            console.log(`   ✅ → "${translatedTitle}"`);

            // Save progress incrementally every 10 translations
            if (clipsTranslated % 10 === 0) {
                await fs.writeFile(
                    enPath,
                    JSON.stringify(data, null, 2),
                    "utf-8",
                );
                console.log(
                    `   💾 Progress saved (${clipsTranslated} clips translated)`,
                );
            }

            // Rate limiting
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`   ❌ Error: ${error}`);
            // Continue with next item
        }
    }

    // Translate streams
    console.log(`\n📋 Processing ${data.streams.length} streams...`);
    for (let i = 0; i < data.streams.length; i++) {
        const stream = data.streams[i];

        // Skip if already translated
        if (stream.title_ja && stream.title_ja.trim() !== "") {
            continue;
        }

        console.log(
            `🌐 [${i + 1}/${data.streams.length}] Translating: "${stream.title}"`,
        );

        try {
            const translatedTitle = await translateTitle(stream.title);
            stream.title_ja = translatedTitle;
            streamsTranslated++;

            console.log(`   ✅ → "${translatedTitle}"`);

            // Save progress incrementally every 10 translations
            if (streamsTranslated % 10 === 0) {
                await fs.writeFile(
                    enPath,
                    JSON.stringify(data, null, 2),
                    "utf-8",
                );
                console.log(
                    `   💾 Progress saved (${streamsTranslated} streams translated)`,
                );
            }

            // Rate limiting
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`   ❌ Error: ${error}`);
            // Continue with next item
        }
    }

    // Final save
    await fs.writeFile(enPath, JSON.stringify(data, null, 2), "utf-8");

    console.log(`\n✅ Translation complete!`);
    console.log(`   📊 Clips translated: ${clipsTranslated}`);
    console.log(`   📊 Streams translated: ${streamsTranslated}`);
    console.log(`   📁 Updated file: ${enPath}`);
}

translateTitles().catch((err) => {
    console.error("❌ Translation failed:", err);
    process.exit(1);
});
