import * as fs from "fs";
import * as path from "path";
import { ChartData } from "../src/lib/type";
import { fileURLToPath } from "url";

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonFilePath = path.join(
    __dirname,
    `../src/data/chapter${chapterNum}.json`,
);
let jsonData: { charts: ChartData[] };
try {
    jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
} catch (err) {
    console.error(`Failed to read/parse ${jsonFilePath}:`, err.message);
    process.exit(1);
}

// base output dir: output/chapter<N+1>/
const baseOut = path.join(__dirname, "../output", `chapter${chapterNum + 1}`);

jsonData.charts.forEach((chart, dayIndex) => {
    const humanDay = dayIndex + 1;
    const dayBase = path.join(baseOut, `day${humanDay}`);

    const recapsDir = path.join(dayBase, "recaps");
    const nodesDir = path.join(dayBase, "nodes");
    const edgesDir = path.join(dayBase, "edges");

    [recapsDir, nodesDir, edgesDir].forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    const writeMd = (dir: string, name: string, content: string) => {
        const filePath = path.join(dir, name + ".md");
        fs.writeFileSync(filePath, content, "utf-8");
    };

    const recapName = `recap-c${chapterNum + 1}d${humanDay}`;
    writeMd(recapsDir, recapName, chart.dayRecap);

    chart.nodes.forEach((node) => {
        if (node.data.day !== undefined && node.data.day !== dayIndex) return;
        const nodeName = `${node.id}-c${chapterNum + 1}d${humanDay}`;
        writeMd(nodesDir, nodeName, node.data.content);
    });

    chart.edges.forEach((edge) => {
        if (!edge.data) return;
        if (edge.data.day !== undefined && edge.data.day !== dayIndex) return;

        const title =
            typeof edge.data.title === "string"
                ? edge.data.title
                : `${edge.source} → ${edge.target}`;

        const edgeBody = `<!-- title: ${title} -->\n\n${edge.data.content}`;

        const edgeName = `${edge.source}-${edge.target}-c${chapterNum + 1}d${humanDay}`;
        writeMd(edgesDir, edgeName, edgeBody);
    });
});

console.log(`✅ Export completed into ${baseOut}`);
