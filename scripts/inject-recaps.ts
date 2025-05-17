// scripts/inject-recap-data.ts
import * as fs from "fs/promises";
import * as path from "path";
import JSZip from "jszip";
import { ChartData } from "../src/lib/type";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ChapterJson = {
    numberOfDays: number;
    title: string;
    charts: ChartData[];
};

async function main() {
    const chapterArg = process.argv[2];
    if (!chapterArg) {
        console.error("Usage: pnpm run inject-recap-data <chapter-number>");
        process.exit(1);
    }
    const chapterNum = parseInt(chapterArg, 10);
    if (isNaN(chapterNum) || chapterNum < 0) {
        console.error("Chapter number must be a non‑negative integer");
        process.exit(1);
    }

    // Paths
    const zipPath = path.resolve(
        __dirname,
        "..",
        "src",
        "data",
        "save",
        "current-data.zip",
    );
    const entryName = `chapter${chapterNum}.json`;
    const outputFolder = path.resolve(
        __dirname,
        "..",
        "recap-data",
        `chapter${chapterNum + 1}`,
    );

    // 1) Load ZIP
    const zipData = await fs.readFile(zipPath);
    const zip = await JSZip.loadAsync(zipData);

    // 2) Extract and parse the JSON entry
    const fileEntry = zip.file(entryName);
    if (!fileEntry) {
        console.error(`❌ ${entryName} not found inside ${zipPath}`);
        process.exit(1);
    }
    const jsonStr = await fileEntry.async("text");
    const chapterJson: ChapterJson = JSON.parse(jsonStr);

    // 3) Walk outputFolder exactly as before
    const days = await fs.readdir(outputFolder);
    for (const dayName of days.sort()) {
        const dayIndex = Number(dayName.replace(/^day/, "")) - 1;
        const chart = chapterJson.charts[dayIndex];
        const dayPath = path.join(outputFolder, dayName);

        if (!chart) {
            console.warn(`⚠️  No JSON chart for ${dayName}, skipping.`);
            continue;
        }

        // — Day recap
        const recapFile = path.join(
            dayPath,
            "recaps",
            `recap-c${chapterNum + 1}d${dayIndex + 1}.md`,
        );
        try {
            const md = await fs.readFile(recapFile, "utf-8");
            chart.dayRecap = md.trim();
        } catch {
            console.warn(`  • Missing recap: ${recapFile}`);
        }

        const suffix = `-c${chapterNum + 1}d${dayIndex + 1}`;

        // — Nodes
        const nodesDir = path.join(dayPath, "nodes");
        try {
            for (const file of (await fs.readdir(nodesDir)).filter((f) =>
                f.endsWith(".md"),
            )) {
                const base = path.basename(file, ".md");
                const idKey = base.replace(new RegExp(`${suffix}$`), "");

                const md = (
                    await fs.readFile(path.join(nodesDir, file), "utf-8")
                ).trim();
                // find any node whose id starts with idKey
                const nd = chart.nodes.find(
                    (n) =>
                        n.id.startsWith(idKey) &&
                        (n.data.day === undefined || n.data.day === dayIndex),
                );

                if (nd) {
                    nd.data.content = md;
                } else {
                    console.warn(
                        `  • Node "${idKey}" not in JSON for ${dayName}`,
                    );
                }
            }
        } catch {
            // skip if no nodes folder
        }

        // — Edges
        const edgesDir = path.join(dayPath, "edges");
        try {
            for (const file of (await fs.readdir(edgesDir)).filter((f) =>
                f.endsWith(".md"),
            )) {
                const base = path.basename(file, ".md");
                const key = base.replace(new RegExp(`${suffix}$`), "");

                const mdFull = await fs.readFile(
                    path.join(edgesDir, file),
                    "utf-8",
                );
                const lines = mdFull.split(/\r?\n/);

                // extract title comment
                let title = "";
                if (/^<!--\s*title:\s*(.+?)\s*-->$/.test(lines[0])) {
                    title = lines
                        .shift()!
                        .replace(/^<!--\s*title:\s*(.+?)\s*-->$/, "$1")
                        .trim();
                    if (!lines[0].trim()) lines.shift();
                }
                const content = lines.join("\n").trim();

                // match any edge whose e.id starts with "key-"
                // since the id contains the handles stuff as well
                const edg = chart.edges.find(
                    (e) =>
                        (e.id === key || e.id.startsWith(key + "-")) &&
                        (e.data!.day === undefined || e.data!.day === dayIndex),
                );

                if (edg) {
                    if (title) edg.data!.title = title;
                    edg.data!.content = content;
                } else {
                    console.warn(
                        `  • Edge "${key}" not in JSON for ${dayName}`,
                    );
                }
            }
        } catch {
            // skip if no edges folder
        }
    }

    // 4) Serialize and re‑insert into ZIP
    const updated = JSON.stringify(chapterJson, null, 2);
    zip.file(entryName, updated);

    // 5) Write ZIP back to disk
    const newZipData = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
    await fs.writeFile(zipPath, newZipData);

    console.log(`✅ Injected data into ${entryName} inside ${zipPath}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
