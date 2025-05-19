// scripts/cleanup-invalid.ts
import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";
import { fileURLToPath } from "url";
import { ChartData } from "../src/lib/type";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const zipPath = path.resolve(
        __dirname,
        "..",
        "src",
        "data",
        "save",
        "current-data.zip",
    );
    const zipData = await fs.readFile(zipPath);
    const zip = await JSZip.loadAsync(zipData);

    // Process each chapterN.json
    const entries = zip.file(/chapter\d+\.json/);
    for (const entry of entries) {
        const name = entry.name; // e.g. "chapter0.json"
        const text = await entry.async("text");
        const doc = JSON.parse(text) as { charts: ChartData[] };

        doc.charts = doc.charts.map((chart, dayIndex) => {
            const keptNodes = chart.nodes.filter(
                (n) => n.data.day === undefined || n.data.day === dayIndex,
            );
            const keptEdges = chart.edges.filter(
                (e) => e.data?.day === undefined || e.data.day === dayIndex,
            );

            return {
                ...chart,
                nodes: keptNodes,
                edges: keptEdges,
            };
        });

        zip.file(name, JSON.stringify(doc, null, 2));
        console.log(`Cleaned invalid entries in ${name}`);
    }

    const out = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
    await fs.writeFile(zipPath, out);
    console.log(`✅ All chapters cleaned in ${zipPath}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
