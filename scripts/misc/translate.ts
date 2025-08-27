import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY_TRANSLATION;

if (!GEMINI_API_KEY) {
    console.error("❌ Please set GEMINI_API_KEY environment variable");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function translateMarkdown(content: string): Promise<string> {
    const prompt = `**タスク**: Minecraft RP「ENigmatic Recollection」（ホロライブEN）のマークダウンコンテンツを英語から日本語に翻訳してください。

**文体・トーン**:
- アニメ・ゲームサイトのエピソード要約のような読みやすい文体
- 自然なストーリーテリング（機械翻訳ではなく、元の作者が書いたような文章）
- 書き言葉として自然で、読み手が興味を持って読める文章
- カジュアルな文体に適度なフォーマル要素を混ぜる
- キャラクターの魅力や感情が伝わる表現を使う
- 親しみやすさを保ちつつ、情報をしっかり伝える文章

**翻訳の重要な指針**:
- **理解してから翻訳する**：直訳は絶対に避ける
- **慣用句・比喩・スラングの適切な処理**：
  - "red flags" → 「危険な兆候」「警告サイン」
  - "green light" → 「許可」「ゴーサイン」  
  - "break the ice" → 「打ち解ける」「緊張をほぐす」
  - その他、文脈から判断して自然な日本語表現に置き換える
- **文脈重視**：直訳で意味が通らない部分は、文脈から推測して適切に修正
- **感情表現の自然化**：英語の感情表現を日本語として自然な表現に変換

**ストーリー設定**:
- これらは冒険中の勇者たちの日記・本、および王国で見つけたストーリー

**翻訳ルール**:
名前・用語（指定がない限りカタカナ使用）:

- ホロライブ名：既知の日本語版を使用（森カリオペ for Mori Calliope）
- シオリ・ニャヴェラ, ホットピンクワン, ステイン, シャイニングスターズ, Peasant the Bae → ペイザン・ザ・ベイ
- リベスタル, ジェイドソード, スカーレットワンド, アンバーコイン, セルリアンカップ
- リベスタルの王, スターサイト・エルピス/クロノス/カオス
- キャプティブ, ステインキング, アウトサイダー, レベレーション
- Smith → スミス, Jeweler → ジュエラー, Chef → シェフ, Supplier → サプライヤー
- "Huzzah!" → "フザー!"
- Princess Iphania → イファニア姫
- "Inbread/In-bread" → "インブレッド"

**マークダウン処理**:

- すべての書式、リンク、構造を正確に保持
- メタタグ値を翻訳: <!-- status: Alive --> → <!-- status: 生存 -->
- <!-- relationship --> タグは翻訳しない
- 関係性リンクを翻訳: [Gura-Kronii]() → [グラ-クロニー]()
- Fanart/Fanwork/Memes等のセクションヘッダーは翻訳するが、内容は変更しない

**重要**: 直訳で意味が通らない表現があれば、文脈から推測してアニメ・ゲーム調の自然な日本語表現に修正してください。

**出力**: 翻訳されたコンテンツのみを返してください。

---

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
    maxConcurrent: number = 3,
): Promise<void> {
    try {
        const markdownFiles: Array<{ filePath: string; rootDir: string }> = [];

        // Collect all markdown files recursively
        async function collectFiles(currentPath: string): Promise<void> {
            const entries = await fs.readdir(currentPath, {
                withFileTypes: true,
            });

            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);

                if (entry.isDirectory()) {
                    await collectFiles(fullPath);
                } else if (entry.isFile() && entry.name.endsWith(".md")) {
                    markdownFiles.push({ filePath: fullPath, rootDir });
                }
            }
        }

        await collectFiles(dirPath);
        console.log(`📁 Found ${markdownFiles.length} markdown files`);

        // Process files with controlled concurrency
        let processed = 0;
        const total = markdownFiles.length;

        async function processWithLimit(
            files: Array<{ filePath: string; rootDir: string }>,
            limit: number,
        ): Promise<void> {
            const executing: Promise<void>[] = [];

            for (const { filePath, rootDir } of files) {
                const promise = translateFile(filePath, rootDir).then(() => {
                    processed++;
                    console.log(
                        `⚡ Progress: ${processed}/${total} files completed`,
                    );
                });

                executing.push(promise);

                if (executing.length >= limit) {
                    // Wait for the first promise to finish
                    await Promise.race(executing);
                    // Remove the first settled promise
                    executing.splice(0, 1);
                }
            }

            await Promise.all(executing);
        }

        await processWithLimit(markdownFiles, maxConcurrent);
    } catch (error) {
        console.error(`❌ Error processing directory ${dirPath}:`, error);
    }
}

async function main() {
    const targetPath = process.argv[2];
    const concurrencyArg = process.argv.find((arg) =>
        arg.startsWith("--concurrent="),
    );
    const maxConcurrent = concurrencyArg
        ? parseInt(concurrencyArg.split("=")[1])
        : 3;

    if (!targetPath) {
        console.error(
            "Usage: tsx translate.ts <file-or-directory> [--concurrent=N]",
        );
        console.error("Examples:");
        console.error(
            "  tsx translate.ts recap-data/chapter1/day1/edges/file.md",
        );
        console.error("  tsx translate.ts recap-data/chapter1/day1/edges");
        console.error("  tsx translate.ts recap-data");
        console.error("  tsx translate.ts recap-data --concurrent=5");
        console.error("\nDefault concurrency: 3 files at once");
        process.exit(1);
    }

    if (maxConcurrent < 1 || maxConcurrent > 10) {
        console.error("❌ Concurrency must be between 1 and 10");
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
            console.log(`⚡ Concurrency: ${maxConcurrent} files at once`);

            await translateDirectory(resolvedPath, resolvedPath, maxConcurrent);
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
