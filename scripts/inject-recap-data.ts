// scripts/inject-recap-data.ts
import * as fs from "fs";
import * as path from "path";
import { ChartData } from "../src/lib/type";
import { fileURLToPath } from "url";

type ChapterJson = {
    charts: ChartData[];
};

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1) Load the chapter JSON
const jsonPath = path.join(__dirname, `../src/data/chapter${chapterNum}.json`);
if (!fs.existsSync(jsonPath)) {
    console.error(`JSON not found: ${jsonPath}`);
    process.exit(1);
}
const chapterJson: ChapterJson = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

// 2) Base folder where you exported the .md files
const outBase = path.join(__dirname, "../output", `chapter${chapterNum + 1}`);
if (!fs.existsSync(outBase)) {
    console.error(`Export folder not found: ${outBase}`);
    process.exit(1);
}

// Helper: read all day directories (day1, day2, …)
const dayDirs = fs
    .readdirSync(outBase)
    .filter((d) => fs.statSync(path.join(outBase, d)).isDirectory())
    .sort((a, b) => {
        // ensure day1 < day2 …
        const da = parseInt(a.replace(/^day/, ""), 10);
        const db = parseInt(b.replace(/^day/, ""), 10);
        return da - db;
    });

dayDirs.forEach((dayName) => {
    const dayIndex = parseInt(dayName.replace(/^day/, ""), 10) - 1;
    const chart = chapterJson.charts[dayIndex];
    const dayDir = path.join(outBase, dayName);

    if (!chart) {
        console.warn(`⚠️  No JSON chart for ${dayName}, skipping.`);
        return;
    }

    // ——— 2.1 Inject dayRecap ———
    const recapFile = path.join(
        dayDir,
        "recaps",
        `recap-c${chapterNum + 1}d${dayIndex + 1}.md`,
    );
    if (fs.existsSync(recapFile)) {
        const md = fs.readFileSync(recapFile, "utf-8");
        chart.dayRecap = md.trim();
    } else {
        console.warn(`  • Missing recap file: ${recapFile}`);
    }

    // ——— 2.2 Inject nodes ———
    const nodesDir = path.join(dayDir, "nodes");
    if (fs.existsSync(nodesDir)) {
        fs.readdirSync(nodesDir).forEach((file) => {
            if (!file.endsWith(".md")) return;
            const id = file.replace(/\.md$/, "");
            const md = fs
                .readFileSync(path.join(nodesDir, file), "utf-8")
                .trim();
            const node = chart.nodes.find(
                (n) =>
                    n.id === id &&
                    (n.data.day === undefined || n.data.day === dayIndex),
            );
            if (node) {
                node.data.content = md;
            } else {
                console.warn(
                    `  • Node "${id}" not found in JSON for ${dayName}`,
                );
            }
        });
    }

    // ——— 2.3 Inject edges ———
    const edgesDir = path.join(dayDir, "edges");
    if (fs.existsSync(edgesDir)) {
        fs.readdirSync(edgesDir).forEach((file) => {
            if (!file.endsWith(".md")) return;
            // filename like "source-target-cXdY.md"
            const [pair] = file.split(`-c${chapterNum + 1}d${dayIndex + 1}`);
            const [source, target] = pair.split("-");
            const mdFull = fs.readFileSync(path.join(edgesDir, file), "utf-8");
            const lines = mdFull.split(/\r?\n/);

            // first line should be <!-- title: ... -->
            let title = "";
            if (lines[0].match(/^<!--\s*title:\s*(.+?)\s*-->$/)) {
                title = lines[0]
                    .replace(/^<!--\s*title:\s*(.+?)\s*-->$/, "$1")
                    .trim();
                lines.shift(); // drop title line
                if (lines[0].trim() === "") lines.shift(); // drop blank line
            }

            const content = lines.join("\n").trim();

            const edge = chart.edges.find(
                (e) =>
                    e.source === source &&
                    e.target === target &&
                    (e.data!.day === undefined || e.data!.day === dayIndex),
            );

            if (edge) {
                if (title) edge.data!.title = title;
                edge.data!.content = content;
            } else {
                console.warn(
                    `  • Edge "${source}→${target}" not found in JSON for ${dayName}`,
                );
            }
        });
    }
}); // dayDirs.forEach

// 3) Write back
fs.writeFileSync(jsonPath, JSON.stringify(chapterJson, null, 2), "utf-8");
console.log(`✅ Injected recap/node/edge data into ${jsonPath}`);
