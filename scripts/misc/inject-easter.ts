import fs from "fs/promises";
import path from "path";

async function main() {
    const baseDir = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "public-resources",
        "audio",
        "easter",
    );

    let eggFolders: string[];
    try {
        eggFolders = (await fs.readdir(baseDir, { withFileTypes: true }))
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
    } catch {
        console.error(`Cannot read easter directory at ${baseDir}`);
        process.exit(1);
    }

    const result: Record<string, { sfxList: string[] }> = {};

    for (const eggFolder of eggFolders) {
        const eggDir = path.join(baseDir, eggFolder);
        let files: string[];

        try {
            files = (await fs.readdir(eggDir)).filter((f) =>
                f.toLowerCase().endsWith(".mp3"),
            );
        } catch (err) {
            console.warn(`Warning: could not read directory ${eggDir}`, err);
            continue;
        }

        if (files.length === 0) {
            console.warn(`Warning: no MP3 files found in ${eggFolder}`);
            continue;
        }

        // Sort files to ensure consistent order
        files.sort();

        const sfxList: string[] = [];

        for (const file of files) {
            // Remove .mp3 extension to get the path for Howler
            const fileName = path.basename(file, ".mp3");
            // Create the path relative to the audio directory
            const sfxPath = `easter/${eggFolder}/${fileName}`;
            sfxList.push(sfxPath);
        }

        result[eggFolder] = {
            sfxList,
        };
    }

    // Serialize to a JSON file
    const outPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        "easterEggSounds.json",
    );

    const jsonContent = JSON.stringify(result, null, 2);

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, jsonContent, "utf-8");

    console.log(`✅ Generated easter egg sounds data at ${outPath}`);
    console.log(`📊 Found ${Object.keys(result).length} easter eggs:`);

    for (const [eggName, data] of Object.entries(result)) {
        console.log(`   ${eggName}: ${data.sfxList.length} sound(s)`);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
