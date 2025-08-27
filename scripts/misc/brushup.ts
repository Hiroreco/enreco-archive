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

async function polishMarkdown(content: string): Promise<string> {
    const prompt = `**タスク**: 機械翻訳された日本語のストーリー要約を自然な日本語に改善してください。

**重要な指針**:
- アニメ・ゲームサイトのエピソード要約のような読みやすい文体にする
- 書き言葉として自然で、読み手が興味を持って読める文章にする
- 機械翻訳特有の硬さや不自然な語順を修正する
- キャラクターの魅力や感情が伝わる表現を使う
- 親しみやすさを保ちつつ、情報をしっかり伝える文章にする
- 過度にくだけすぎず、適度な敬語も使う

**機械翻訳の問題を修正**:
- 直訳されて意味不明になった表現を適切な日本語表現に置き換える
- 慣用句・比喩・スラングが直訳されている場合は、日本語として自然な表現に修正する
- 文脈から判断して、おかしな翻訳は意図された意味に修正する
- 例：「赤い旗」→「警告サイン」「危険信号」、「緑の光」→「許可」「ゴーサイン」など

**参考文体**: アニメやゲームの公式サイトでのキャラクター紹介やストーリー要約

**保持すべき要素**:
- すべてのマークダウン書式（リンク、埋め込み、見出しなど）
- 文書構造と段落分け
- 固有名詞や専門用語
- 元の意図された意味とコンテキスト

**避けるべき改変**:
- 過度にフォーマルな硬い文章
- 逆に砕けすぎた話し言葉
- 元の情報の削除や大幅な追加

**重要**: 直訳で意味が通らない部分があれば、文脈から推測して適切な日本語表現に修正してください。

**出力**: 改善された自然な日本語のマークダウンコンテンツのみを返してください。

---

${content}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        throw new Error(`Polishing failed: ${error}`);
    }
}

async function polishFile(filePath: string): Promise<void> {
    try {
        const content = await fs.readFile(filePath, "utf-8");
        console.log(`Polishing: ${filePath}`);

        const polishedContent = await polishMarkdown(content);

        // Overwrite the original file with polished content
        await fs.writeFile(filePath, polishedContent, "utf-8");
        console.log(`✅ Updated: ${filePath}`);
    } catch (error) {
        console.error(`❌ Error polishing ${filePath}:`, error);
    }
}

async function polishDirectory(
    dirPath: string,
    maxConcurrent: number = 3,
): Promise<void> {
    try {
        const markdownFiles: string[] = [];

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
                    markdownFiles.push(fullPath);
                }
            }
        }

        await collectFiles(dirPath);
        console.log(`📁 Found ${markdownFiles.length} markdown files`);

        // Process files with controlled concurrency
        let processed = 0;
        const total = markdownFiles.length;

        async function processWithLimit(
            files: string[],
            limit: number,
        ): Promise<void> {
            type TrackedPromise = {
                promise: Promise<void>;
                settled: boolean;
            };
            const executing: TrackedPromise[] = [];

            for (const file of files) {
                let resolveSettled: () => void;
                const tracked: TrackedPromise = {
                    promise: new Promise<void>((resolve) => {
                        polishFile(file)
                            .then(() => {
                                processed++;
                                console.log(
                                    `⚡ Progress: ${processed}/${total} files completed`,
                                );
                            })
                            .finally(() => {
                                tracked.settled = true;
                                resolve();
                            });
                    }),
                    settled: false,
                };

                executing.push(tracked);

                if (executing.length >= limit) {
                    // Wait for the first promise to finish
                    await Promise.race(executing.map((e) => e.promise));
                    // Remove all settled promises from the executing array
                    for (let i = executing.length - 1; i >= 0; i--) {
                        if (executing[i].settled) {
                            executing.splice(i, 1);
                        }
                    }
                }
            }

            await Promise.all(executing.map((e) => e.promise));
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
            "Usage: tsx polish.ts <file-or-directory> [--concurrent=N]",
        );
        console.error("Examples:");
        console.error("  tsx polish.ts recap-data/chapter1/day1/edges/file.md");
        console.error("  tsx polish.ts recap-data");
        console.error("  tsx polish.ts recap-data --concurrent=5");
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
            await polishFile(resolvedPath);
        } else if (stat.isDirectory()) {
            console.log(`🚀 Polishing all .md files in: ${resolvedPath}`);
            console.log(`⚡ Concurrency: ${maxConcurrent} files at once`);
            await polishDirectory(resolvedPath, maxConcurrent);
        }

        console.log("✨ Polishing complete!");
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
