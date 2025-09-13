import { ChapterRecapData } from "@enreco-archive/common/types";
import fs from "fs/promises";
import path from "path";

async function main() {
    const locale = process.argv[2] || "en";
    const localeSuffix = locale === "en" ? "" : `_${locale}`;

    // 1) Input folder containing files recap-c<N>.md
    const inputDir = path.resolve(
        process.cwd(),
        locale === "en" ? "recap-data" : `recap-data_${locale}`,
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
        .filter((f) => new RegExp(`^recap-c\\d+${localeSuffix}\\.md$`).test(f))
        // sort by N ascending
        .sort((a, b) => {
            const na = parseInt(
                a.match(new RegExp(`^recap-c(\\d+)${localeSuffix}\\.md$`))![1],
                10,
            );
            const nb = parseInt(
                b.match(new RegExp(`^recap-c(\\d+)${localeSuffix}\\.md$`))![1],
                10,
            );
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
        process.cwd(),
        "apps",
        "website",
        "data",
        locale,
        `chapter-recaps${localeSuffix === "" ? "_en" : localeSuffix}.json`,
    );
    await fs.writeFile(outPath, JSON.stringify(out, null, 2), "utf-8");
    console.log(
        `✅ Wrote ${chapters.length} ${locale} chapter recaps to ${outPath}`,
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
