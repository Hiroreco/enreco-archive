import { ChapterRecapData } from "@enreco-archive/common/types";
import fs from "fs/promises";
import path from "path";

async function main() {
    const chapterMap = new Map<number, { title: { en: string; ja: string }; content: { en: string; ja: string } }>();

    // Process both EN and JA locales
    for (const locale of ["en", "ja"] as const) {
        const localeSuffix = locale === "en" ? "" : `_${locale}`;
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

        // Filter and sort recap-c<N>.md files
        const recapFiles = files
            .filter((f) => new RegExp(`^recap-c\\d+${localeSuffix}\\.md$`).test(f))
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

        // Process each file
        for (const file of recapFiles) {
            const filePath = path.join(inputDir, file);
            const text = await fs.readFile(filePath, "utf-8");

            // Extract chapter number from filename
            const chapterNumMatch = file.match(new RegExp(`^recap-c(\\d+)${localeSuffix}\\.md$`));
            if (!chapterNumMatch) continue;
            const chapterNum = parseInt(chapterNumMatch[1], 10);

            // Extract title from <!-- title: ... -->
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
                console.warn(`⚠️  No <!-- title: ... --> in ${file}, using filename`);
                title = `Chapter ${chapterNum} Recap`;
            }

            // skip blank line after title
            if (lines[i]?.trim() === "") i++;

            // Everything from here on is content
            const content = lines.slice(i).join("\n").trim();

            // Initialize entry if not exists
            if (!chapterMap.has(chapterNum)) {
                chapterMap.set(chapterNum, {
                    title: { en: "", ja: "" },
                    content: { en: "", ja: "" },
                });
            }

            // Populate this locale's data
            const entry = chapterMap.get(chapterNum)!;
            (entry.title as any)[locale] = title;
            (entry.content as any)[locale] = content;
        }

        console.log(`✅ Processed ${locale.toUpperCase()} chapter recaps`);
    }

    // Convert map to array, sorted by chapter number
    const chapters = Array.from(chapterMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, chapter]) => chapter);

    const out: ChapterRecapData = { chapters };

    // Write merged JSON
    const outPath = path.resolve(process.cwd(), "apps", "website", "data", "chapter-recaps.json");
    await fs.writeFile(outPath, JSON.stringify(out, null, 2), "utf-8");
    console.log(`✅ Successfully created chapter recaps with ${chapters.length} merged chapters`);
    console.log(`📁 Output: ${outPath}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
