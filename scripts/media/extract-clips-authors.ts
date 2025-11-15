import fs from "fs/promises";
import path from "path";

async function extractUniqueAuthors() {
    const inputFilePath = path.resolve(
        "d:\\Work\\coding-practice\\Project Practice\\enreco-chart\\apps\\website\\data\\en\\clips_en.json",
    );
    const outputFilePath = path.resolve(
        "d:\\Work\\coding-practice\\Project Practice\\enreco-chart\\apps\\website\\data\\en\\clips-authors.json",
    );

    try {
        // Read the clips_en.json file
        const data = await fs.readFile(inputFilePath, "utf-8");
        const clipsData = JSON.parse(data);

        // Extract unique authors
        const authors = new Set(
            clipsData.clips.map((clip: { author: string }) =>
                clip.author.trim(),
            ),
        );

        // Write the unique authors to clips-authors.json
        await fs.writeFile(
            outputFilePath,
            JSON.stringify(Array.from(authors), null, 2),
            "utf-8",
        );

        console.log(
            `✅ Successfully extracted ${authors.size} unique authors.`,
        );
        console.log(`📁 Output written to: ${outputFilePath}`);
    } catch (error) {
        console.error("❌ Error extracting authors:", error);
    }
}

extractUniqueAuthors();
