import * as fs from "fs";
import * as path from "path";
import { ChartData } from "../src/lib/type"

const chapterArg = process.argv[2];
if (chapterArg === undefined) {
    console.error("Please provide a chapter number as argument");
    console.error("Usage: node export-data.js <chapter-number>");
    process.exit(1);
}

const chapter = parseInt(chapterArg) + 1; 
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const jsonFilePath = path.join(__dirname, "../src/data/chapter0.json");
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

const outputDir = path.join(__dirname, "../output");
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const writeToFile = (fileName, content) => {
    const filePath = path.join(outputDir, fileName + ".txt");
    fs.writeFileSync(filePath, content, "utf-8");
};

jsonData.charts.forEach((chart: ChartData, dayIndex) => {
    const recapFileName = `recap-c${chapter}d${dayIndex + 1}`;
    writeToFile(recapFileName, chart.dayRecap);

    chart.nodes.forEach((node) => {
        if (node.data.day && node.data.day !== dayIndex) {
            return;
        }
        const nodeFileName = `${node.id}-c${chapter}d${dayIndex + 1}`;
        const nodeContent = `${node.data.content}`;
        writeToFile(nodeFileName, nodeContent);
    });

    chart.edges.forEach((edge) => {
        if (!edge.data) {
            return;
        }
        if (edge.data.day && edge.data.day !== dayIndex) {
            return;
        }
        const edgeFileName = `${edge.source}-${edge.target}-c${chapter}d${dayIndex + 1}`;
        const edgeContent = `${edge.data.content}`;
        writeToFile(edgeFileName, edgeContent);
    });
});

console.log(`Export completed for chapter ${chapter}!`);