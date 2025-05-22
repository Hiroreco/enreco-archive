// scripts/remove-edge-suffixes-via-edges.ts
import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";
import { fileURLToPath } from "url";
import { ChartData } from "@enreco-archive/common/types";

// ─── ESM __dirname boilerplate ────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ────────────────────────────────────────────────────────────────────────────────

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

    // Find every chapterN.json entry
    const entries = zip.file(/chapter\d+\.json/);
    for (const entry of entries) {
        const name = entry.name; // e.g. "chapter0.json"
        const text = await entry.async("text");
        const doc = JSON.parse(text) as { charts: ChartData[] };

        // Walk charts
        for (const chart of doc.charts) {
            // Precompute all baseIDs for edges this chart
            for (const edge of chart.edges) {
                const base = `${edge.source}-${edge.target}`;
                edge.id = base;
                // matches "#edge:base" followed by any number of "-suffix" segments
                const re = new RegExp(`(#edge:${base})(?:-[^\\s)]+)*`, "g");

                // 1) dayRecap
                chart.dayRecap = chart.dayRecap.replace(re, "$1");

                // 2) nodes
                for (const node of chart.nodes) {
                    node.data.content = node.data.content.replace(re, "$1");
                }

                // 3) edges
                for (const ed of chart.edges) {
                    if(ed.data) {
                        ed.data.content = ed.data.content.replace(re, "$1");
                    }
                }
            }
        }

        // Serialize back into the ZIP entry
        zip.file(name, JSON.stringify(doc, null, 2));
    }

    // Write the ZIP back out
    const out = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
    await fs.writeFile(zipPath, out);
    console.log(
        "✅ Stripped suffixes from all #edge: references based on actual edges in current-data.zip",
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
