import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("❌ Please set GEMINI_API_KEY environment variable");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function translateMarkdown(content: string): Promise<string> {
    const prompt = `This is a Minecraft RP event called ENigmatic Recollection, featuring the Hololive English talents. Translate the following Markdown content to Japanese, you are telling a story. The tone should be casual, but formal when needed. 
Preserve all Markdown formatting, code blocks, links, and structure exactly. All of the names (dungeon names, weapon names, character names, etc.) should be translated to their katakana equivalent, don't translate them to kanji yourself, the list below provide some examples, but you should still use katakana for all names/nouns you don't know. Except for Hololive names that you do know, for example Mori Callope can be 森カリオペ. 

Try to keep the energy/style, make it feel localised, the translation should not be literal, as long as it keeps the same context and intention. The story is a mixed between quirky humor and serious themes.

A short summary: Summoned to the fantastical "Kingdom of Libestal" by its King, 19 heroes, each with their unique quirks, are tasked with a vital mission: to combat the looming threat known as The "Stains". Yet, this new reality is not without its complications. Each of them, stripped of their memories, awoke with no recollection of their past lives, leaving them to navigate this strange world as strangers even to themselves.

Here are a few things to note:
- All the characters, except for the King, the enemies and Gigi/Gonathon, are females.
- Shiori Nyavella as シオリ・ニャヴェラ, not ノヴェラ.
- The "Stains" is ステイン.
- Libestal as リベスタル, Jade Sword as ジェイドソード, Scarlet Wand as スカーレットワンド, Amber Coin as アンバーコイン, and Cerulean Cup as セルリアンカップ.
- King of Libestal as リベスタルの王.
- Underworld Dungeon as アンダーワールドダンジョン, Ocean Temple Dungeon as オーシャンテンプルダンジョン, Volcano Dungeon as ボルケーノダンジョン, Eldritch Horror Dungeon as エルドリッチホラーダンジョン, Ancient Sewers Dungeon as アンシエントスーアーズダンジョン.
- The Captive as キャプティブ, The Stain King as ステインキング.
- "Revelations" as レベレーション.
- Translate the values in the meta tags at the beginning, for example <!-- status: Alive --> will be <!-- status: 生存 -->. DO NOT translate <!-- relationship --> tags.
- Translate the labels in the [] markdown tags (except for the ones in the fanart, memes, etc. sections), for example ![The four guild masters](images-opt/guildmasters-opt.webp) will be ![四人のギルドマスター](images-opt/guildmasters-opt.webp)
- The relationship tag, for example [Gura-Kronii](), should be [グラ-クロニー]().
- Everything under the Fanart, Fanwork, Memes, etc. part should be kept as is, DO NOT touch anything there. Though the section headers should be translated to Japanese (## Fanart -> ## ファンアート)

Only translate the actual text content, not the Markdown syntax, URLs, or code:

${content}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        throw new Error(`Translation failed: ${error}`);
    }
}

function createMirroredPath(originalPath: string): string {
    // Get relative path from current working directory
    const relativePath = path.relative(process.cwd(), originalPath);
    const pathParts = relativePath.split(path.sep);

    // Add _jp suffix to the first directory (e.g., recap-data -> recap-data_jp)
    if (pathParts.length > 0) {
        pathParts[0] = pathParts[0] + "_jp";
    }

    // Build the full path from cwd
    return path.resolve(process.cwd(), ...pathParts);
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
        // Directory might already exist, that's fine
    }
}

async function translateFile(
    filePath: string,
    rootDir?: string,
): Promise<void> {
    try {
        const content = await fs.readFile(filePath, "utf-8");
        console.log(`Translating: ${filePath}`);

        const translatedContent = await translateMarkdown(content);

        let outputPath: string;

        if (rootDir) {
            // Create mirrored directory structure
            const relativePath = path.relative(rootDir, filePath);
            const parsedPath = path.parse(relativePath);

            const mirroredRoot = createMirroredPath(rootDir);

            outputPath = path.join(
                mirroredRoot,
                parsedPath.dir,
                `${parsedPath.name}_jp${parsedPath.ext}`,
            );

            // Ensure the directory exists
            await ensureDirectoryExists(path.dirname(outputPath));
        } else {
            // Single file mode - create in same directory
            const parsedPath = path.parse(filePath);
            outputPath = path.join(
                parsedPath.dir,
                `${parsedPath.name}_jp${parsedPath.ext}`,
            );
        }

        await fs.writeFile(outputPath, translatedContent, "utf-8");
        console.log(`✅ Created: ${outputPath}`);
    } catch (error) {
        console.error(`❌ Error translating ${filePath}:`, error);
    }
}

async function translateDirectory(
    dirPath: string,
    rootDir: string,
): Promise<void> {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                await translateDirectory(fullPath, rootDir);
            } else if (entry.isFile() && entry.name.endsWith(".md")) {
                await translateFile(fullPath, rootDir);
            }
        }
    } catch (error) {
        console.error(`❌ Error processing directory ${dirPath}:`, error);
    }
}

async function main() {
    const targetPath = process.argv[2];

    if (!targetPath) {
        console.error("Usage: tsx translate.ts <file-or-directory>");
        console.error("Examples:");
        console.error(
            "  tsx translate.ts recap-data/chapter1/day1/edges/file.md",
        );
        console.error("  tsx translate.ts recap-data/chapter1/day1/edges");
        console.error("  tsx translate.ts recap-data");
        process.exit(1);
    }

    const resolvedPath = path.resolve(process.cwd(), targetPath);

    try {
        const stat = await fs.stat(resolvedPath);

        if (stat.isFile()) {
            if (!targetPath.endsWith(".md")) {
                console.error("❌ File must be a .md file");
                process.exit(1);
            }

            // For single files, determine the root directory
            const pathParts = targetPath.split(path.sep);
            const rootDir = pathParts[0]; // First part is the root
            const fullRootPath = path.resolve(process.cwd(), rootDir);

            await translateFile(resolvedPath, fullRootPath);
        } else if (stat.isDirectory()) {
            console.log(`🚀 Translating all .md files in: ${resolvedPath}`);
            console.log(
                `📁 Creating mirrored structure in: ${createMirroredPath(resolvedPath)}`,
            );

            await translateDirectory(resolvedPath, resolvedPath);
        }

        console.log("✨ Translation complete!");
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
