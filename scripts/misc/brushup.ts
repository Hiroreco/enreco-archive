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

async function polishDirectory(dirPath: string): Promise<void> {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                await polishDirectory(fullPath);
            } else if (entry.isFile() && entry.name.endsWith(".md")) {
                await polishFile(fullPath);
            }
        }
    } catch (error) {
        console.error(`❌ Error processing directory ${dirPath}:`, error);
    }
}

async function main() {
    const targetPath = process.argv[2];

    if (!targetPath) {
        console.error("Usage: tsx polish.ts <file-or-directory>");
        console.error("Examples:");
        console.error("  tsx polish.ts recap-data/chapter1/day1/edges/file.md");
        console.error("  tsx polish.ts recap-data");
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
            await polishDirectory(resolvedPath);
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
