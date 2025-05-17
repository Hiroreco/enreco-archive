import { ChartData, Chapter } from "../src/lib/type";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function convertChapterToGitFormat(chapter: Chapter): Chapter {
    const newCharts: ChartData[] = [];

    // Keep day 1 as-is
    newCharts[0] = chapter.charts[0];

    // For each subsequent day
    for (let currentDay = 1; currentDay < chapter.charts.length; currentDay++) {
        const previousDay = currentDay - 1;
        const currentChart = chapter.charts[currentDay];
        const previousChart = chapter.charts[previousDay];

        // Initialize new chart with title and recap
        const newChart: ChartData = {
            title: currentChart.title,
            dayRecap: currentChart.dayRecap,
            nodes: [],
            edges: [],
        };

        // Find new or modified nodes
        currentChart.nodes.forEach((node) => {
            const previousNode = previousChart.nodes.find(
                (n) => n.id === node.id,
            );

            // If node is new or has been modified
            if (!previousNode || node.data.day === currentDay) {
                newChart.nodes.push(node);
            }
        });

        // Find new or modified edges
        currentChart.edges.forEach((edge) => {
            const previousEdge = previousChart.edges.find(
                (e) => e.id === edge.id,
            );

            // If edge is new or has been modified
            if (!previousEdge || edge.data!.day === currentDay) {
                newChart.edges.push(edge);
            }
        });

        newCharts[currentDay] = newChart;
    }

    return {
        ...chapter,
        charts: newCharts,
    };
}

// Main execution
function main() {
    const inputDir = path.join(__dirname, "..", "src", "data", "save");
    const files = fs
        .readdirSync(inputDir)
        .filter((f) => f.match(/chapter\d+\.json/));

    for (const file of files) {
        console.log(`Processing ${file}...`);

        const filePath = path.join(inputDir, file);
        const chapter = JSON.parse(fs.readFileSync(filePath, "utf8"));

        const convertedChapter = convertChapterToGitFormat(chapter);

        // Save to new file with -git suffix
        const outputPath = path.join(
            inputDir,
            file.replace(".json", "-git.json"),
        );
        fs.writeFileSync(outputPath, JSON.stringify(convertedChapter, null, 2));

        console.log(`Saved ${path.basename(outputPath)}`);
    }
}

main();
