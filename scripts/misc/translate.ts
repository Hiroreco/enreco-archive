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
    const prompt = `Task: Translate Markdown content for "ENigmatic Recollection" Minecraft RP (Hololive EN) from English to Japanese.
Writing Style:

- Natural storytelling voice (not machine translation)
- Casual tone with formal elements when appropriate
- Blend quirky humor with serious themes
- Write as if you're the original author

Story Context:
- Second journey - 15 female heroes (except for Gonathon, he's male) summoned to ancient Libestal by Fia to prevent the Outsider's emergence. This day is final day: an unexpected rebellion.

Translation Rules:
Names & Terms (use katakana unless specified):

- Hololive names: Use known Japanese versions (森カリオペ for Mori Calliope)
- シオリ・ニャヴェラ, ホットピンクワン, ステイン, シャイニングスターズ, Peasant the Bae as ペイザン・ザ・ベイ
- リベスタル, ジェイドソード, スカーレットワンド, アンバーコイン, セルリアンカップ
- リベスタルの王, スターサイト・エルピス/クロノス/カオス
- キャプティブ, ステインキング, アウトサイダー, レベレーション
- Smith as スミス, Jeweler as ジュエラー, Chef as シェフ, Supplier as サプライヤー
- "Huzzah!" → "フザー!"
- Princess Iphania as イファニア姫
- "Inbread/In-bread" -> "インブレッド"

Markdown Handling:

- Preserve ALL formatting, links, structure exactly
- Translate meta tag values: <!-- status: Alive --> → <!-- status: 生存 -->
- DON'T translate <!-- relationship --> tags
- Translate image alt text: ![The four guild masters] → ![四人のギルドマスター]
- Translate relationship links: [Gura-Kronii]() → [グラ-クロニー]()
- Translate section headers under Fanart/Fanwork/Memes but leave content untouched. DO NOT change anything there.

Output: Return translated content in markdown code block. Translate content only - never syntax, URLs, or code.

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

    // Add _ja suffix to the first directory (e.g., recap-data -> recap-data_ja)
    if (pathParts.length > 0) {
        pathParts[0] = pathParts[0] + "_ja";
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

        // const translatedContent = await translateMarkdown(content);
        const translatedContent = "";

        let outputPath: string;

        if (rootDir) {
            // Create mirrored directory structure
            const relativePath = path.relative(rootDir, filePath);
            const parsedPath = path.parse(relativePath);

            const mirroredRoot = createMirroredPath(rootDir);

            outputPath = path.join(
                mirroredRoot,
                parsedPath.dir,
                `${parsedPath.name}_ja${parsedPath.ext}`,
            );

            // Ensure the directory exists
            await ensureDirectoryExists(path.dirname(outputPath));
        } else {
            // Single file mode - create in same directory
            const parsedPath = path.parse(filePath);
            outputPath = path.join(
                parsedPath.dir,
                `${parsedPath.name}_ja${parsedPath.ext}`,
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
