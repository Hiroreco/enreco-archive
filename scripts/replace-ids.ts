// scripts/replace-ids.ts
import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";
import { fileURLToPath } from "url";
import { ChartData } from "../src/lib/type";

// ─── Setup __dirname ──────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ────────────────────────────────────────────────────────────────────────────────

// ─── Configure your rename map here ────────────────────────────────────────────
// Keys are the old IDs, values are the new IDs you want.
const RENAME_MAP: Record<string, string> = {
    "fuwawa-abyssguard": "fuwawa",
    "mococo-abyssguard": "mococo",
    "elizabeth-rose-bloodflame": "liz",
    "takanashi-kiara": "kiara",
    "peasant-da-bae": "bae",
    "roa-pandora": "raora",
    "mori-calliope": "calli",
    "shiori-nyavella": "shiori",
    "cecilia-immerkind": "cecilia",
    "cecilia-immergreen": "cecilia",
    "nerissa-ravencroft": "nerissa",
    "koseki-bijou": "bijou",
    "gonathon-g": "gigi",
    "hot-pink-one": "irys",
    "nino-ina-the-hot-purple-one": "ina",
    "tam-gandr": "kronii",
    "princess-iphania": "iphania",
    fia: "fia",
    "the-outlander": "outlander",
    "nino-ina": "ina",
    "gawr-gura": "gura",
    "ceres-fauna": "fauna",
    "raora-panthera": "raora",
};

// Helper to do multiple global replacements in a string
function replaceAll(str: string, map: Record<string, string>) {
    // build a single RegExp matching any of the keys
    const pattern = Object.keys(map)
        .map((k) => k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"))
        .join("|");
    if (!pattern) return str;
    return str.replace(
        new RegExp(`\\b(${pattern})\\b`, "g"),
        (_, key) => map[key],
    );
}

async function main() {
    // 1) Load the ZIP
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

    // 2) For each chapter<N>.json entry
    const entries = zip.file(/chapter\d+\.json/);
    for (const entry of entries) {
        const name = entry.name; // e.g. "chapter0.json"
        const text = await entry.async("text");
        const doc = JSON.parse(text) as { charts: ChartData[] };

        // Walk every chart
        for (const chart of doc.charts) {
            // — dayRecap (in case you embed raw IDs)
            chart.dayRecap = replaceAll(chart.dayRecap, RENAME_MAP);

            // — nodes
            for (const node of chart.nodes) {
                // rename id
                if (RENAME_MAP[node.id]) {
                    node.id = RENAME_MAP[node.id];
                }
                // rename any embedded references in data.content or data.title
                node.data.content = replaceAll(node.data.content, RENAME_MAP);
                if (typeof node.data.title === "string") {
                    node.data.title = replaceAll(node.data.title, RENAME_MAP);
                }
            }

            // — edges
            for (const edge of chart.edges) {
                // rename source/target
                if (RENAME_MAP[edge.source])
                    edge.source = RENAME_MAP[edge.source];
                if (RENAME_MAP[edge.target])
                    edge.target = RENAME_MAP[edge.target];
                // rename embedded references in edge.data.content & title
                edge.data!.content = replaceAll(edge.data!.content, RENAME_MAP);
                if (typeof edge.data!.title === "string") {
                    edge.data!.title = replaceAll(edge.data!.title, RENAME_MAP);
                }
            }
        }

        // 3) serialize and update in ZIP
        const updated = JSON.stringify(doc, null, 2);
        zip.file(name, updated);
    }

    // 4) write ZIP back
    const outBuffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
    await fs.writeFile(zipPath, outBuffer);

    console.log(
        `✅ Renamed ${Object.keys(RENAME_MAP).length} IDs in current-data.zip`,
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
