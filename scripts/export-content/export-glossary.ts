import fs from "fs/promises";
import path from "path";
import type { CommonItemData } from "@enreco-archive/common/types";

async function main() {
    const fileArg = process.argv[2];
    if (!fileArg) {
        console.error(
            "Usage: pnpm run export-misc-data <jsonFileNameWithoutExt>",
        );
        process.exit(1);
    }

    const jsonPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        "glossary",
        `${fileArg}.json`,
    );
    let items: CommonItemData[];
    try {
        const raw = await fs.readFile(jsonPath, "utf-8");
        items = JSON.parse(raw);
    } catch (err: any) {
        console.error(`Failed to read/parse ${jsonPath}:`, err.message);
        process.exit(1);
    }

    const outDir = path.resolve(
        process.cwd(),
        "recap-data",
        "glossary",
        fileArg,
    );
    await fs.mkdir(outDir, { recursive: true });

    for (const it of items) {
        const fileName = `${it.id}.md`;
        const filePath = path.join(outDir, fileName);

        // build images comment list
        const imagesList = it.galleryImages
            .map((img) => `(${img.title})`)
            .join(", ");

        const hasModel = it.modelSrc ? "true" : "false";

        const headerLines = [
            `<!-- title: ${it.title} -->`,
            `<!-- quote: ${it.quote ?? ""} -->`,
            `<!-- chapters: ${it.chapters} -->`,
            `<!-- images: ${imagesList} -->`,
            `<!-- model: ${hasModel} -->`,
            ``,
        ];

        const content = it.content.trim();

        const md = headerLines.join("\n") + "\n" + content;
        await fs.writeFile(filePath, md, "utf-8");
    }

    console.log(`✅ Exported ${items.length} items to ${outDir}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
