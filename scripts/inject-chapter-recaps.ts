// scripts/inject-chapter-recaps.ts
import { ChapterRecapData } from "@enreco-archive/common/types";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    // 1) Input folder containing files recap-c<N>.md
    //    e.g. "scripts/chapters" or "./chapter-recaps"
    const inputDir = path.resolve(
        __dirname,
        "..",
        "recap-data",
        "chapter-recaps",
    );
    let files: string[];
    try {
        files = await fs.readdir(inputDir);
    } catch {
        console.error(`Input folder not found: ${inputDir}`);
        process.exit(1);
    }

    // Filter only recap-c<N>.md
    const recapFiles = files
        .filter((f) => /^recap-c\d+\.md$/.test(f))
        // sort by N ascending
        .sort((a, b) => {
            const na = parseInt(a.match(/^recap-c(\d+)\.md$/)![1], 10);
            const nb = parseInt(b.match(/^recap-c(\d+)\.md$/)![1], 10);
            return na - nb;
        });

    const chapters = [];

    for (const file of recapFiles) {
        const filePath = path.join(inputDir, file);
        const text = await fs.readFile(filePath, "utf-8");

        // 2) Extract title from <!-- title: ... -->
        const lines = text.split(/\r?\n/);
        let title = "";
        let i = 0;

        // skip any leading empty lines
        while (i < lines.length && !lines[i].trim()) i++;

        // expect <!-- title: ... -->
        const titleMatch = lines[i]?.match(/^<!--\s*title:\s*(.+?)\s*-->$/);
        if (titleMatch) {
            title = titleMatch[1].trim();
            i++;
        } else {
            console.warn(
                `⚠️  No <!-- title: ... --> in ${file}, using filename`,
            );
            title = file.replace(/^recap-c(\d+)\.md$/, "Chapter $1 Recap");
        }

        // skip blank line after title
        if (lines[i]?.trim() === "") i++;

        // 3) Everything from here on is content
        const content = lines.slice(i).join("\n").trim();

        chapters.push({ title, content });
    }

    const out: ChapterRecapData = { chapters };

    // 4) Write JSON
    const outPath = path.resolve(
        __dirname,
        "..",
        "apps",
        "website",
        "data",
        "chapter-recaps.json",
    );
    await fs.writeFile(outPath, JSON.stringify(out, null, 2), "utf-8");
    console.log(`✅ Wrote ${chapters.length} chapter recaps to ${outPath}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
