import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";
import { ChartData } from "../src/lib/type";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const chapterArg = process.argv[2];
    if (chapterArg === undefined) {
        console.error("Please provide a chapter number as argument");
        console.error("Usage: pnpm run export-data <chapter-number>");
        process.exit(1);
    }
    const chapterNum = parseInt(chapterArg, 10);
    if (isNaN(chapterNum) || chapterNum < 0) {
        console.error("Chapter number must be a non‑negative integer");
        process.exit(1);
    }

    // 1) Load the ZIP
    const zipPath = path.resolve(
        __dirname,
        "..",
        "src",
        "data",
        "save",
        "current-data.zip",
    );
    let zipData: Buffer;
    try {
        zipData = await fs.readFile(zipPath);
    } catch (err) {
        console.error(`Failed to read ZIP at ${zipPath}:`, err.message);
        process.exit(1);
    }

    const zip = await JSZip.loadAsync(zipData);

    // 2) Extract chapter<N>.json
    const entryName = `chapter${chapterNum}.json`;
    const fileEntry = zip.file(entryName);
    if (!fileEntry) {
        console.error(`❌ ${entryName} not found in ${zipPath}`);
        process.exit(1);
    }

    let chapterJson: { charts: ChartData[] };
    try {
        const jsonStr = await fileEntry.async("text");
        chapterJson = JSON.parse(jsonStr);
        console.log(chapterJson.charts[0].nodes.map((node) => node.id));
    } catch (err) {
        console.error(`Failed to parse ${entryName}:`, err.message);
        process.exit(1);
    }

    const baseOut = path.resolve(
        __dirname,
        "..",
        "recap-data",
        `chapter${chapterNum + 1}`,
    );

    for (let dayIndex = 0; dayIndex < chapterJson.charts.length; dayIndex++) {
        const chart = chapterJson.charts[dayIndex];
        const humanDay = dayIndex + 1;
        const dayBase = path.join(baseOut, `day${humanDay}`);

        const recapsDir = path.join(dayBase, "recaps");
        const nodesDir = path.join(dayBase, "nodes");
        const edgesDir = path.join(dayBase, "edges");

        for (const dir of [recapsDir, nodesDir, edgesDir]) {
            await fs.mkdir(dir, { recursive: true });
        }

        // helper
        const writeMd = async (dir: string, name: string, content: string) => {
            const filePath = path.join(dir, name + ".md");
            await fs.writeFile(filePath, content, "utf-8");
        };

        // recap
        const recapName = `recap-c${chapterNum + 1}d${humanDay}`;
        await writeMd(recapsDir, recapName, chart.dayRecap);

        // nodes
        for (const node of chart.nodes) {
            if (node.data.day !== undefined && node.data.day !== dayIndex)
                continue;
            const nodeName = `${node.id}-c${chapterNum + 1}d${humanDay}`;
            await writeMd(nodesDir, nodeName, node.data.content);
        }

        // edges
        for (const edge of chart.edges) {
            if (!edge.data) continue;
            if (edge.data.day !== undefined && edge.data.day !== dayIndex)
                continue;

            const title =
                typeof edge.data.title === "string"
                    ? edge.data.title
                    : `${edge.source} → ${edge.target}`;

            const edgeBody = `<!-- title: ${title} -->\n\n${edge.data.content}`;
            const edgeName = `${edge.source}-${edge.target}-c${chapterNum + 1}d${humanDay}`;
            await writeMd(edgesDir, edgeName, edgeBody);
        }
    }

    console.log(`✅ Export completed into ${baseOut}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
