// scripts/inject-recap-data.ts
import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";
import { ChartData } from "@enreco-archive/common/types";
import { fileURLToPath } from "url";

// ESM __dirname
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

    const zipPath = path.resolve(
        __dirname,
        "..",
        "site-data",
        "editor",
        "current-data.zip",
    );
    const entryName = `chapter${chapterNum}.json`;
    const outputFolder = path.resolve(
        __dirname,
        "..",
        "recap-data",
        `chapter${chapterNum + 1}`,
    );

    // load ZIP & JSON
    const zipData = await fs.readFile(zipPath);
    const zip = await JSZip.loadAsync(zipData);
    const fileEntry = zip.file(entryName);
    if (!fileEntry) {
        console.error(`❌ ${entryName} not found in ${zipPath}`);
        process.exit(1);
    }
    const chapterJson: ChapterJson = JSON.parse(await fileEntry.async("text"));

    // process each day
    const days = await fs.readdir(outputFolder);
    for (const dayName of days.sort()) {
        const dayIndex = Number(dayName.replace(/^day/, "")) - 1;
        const chart = chapterJson.charts[dayIndex];
        const dayPath = path.join(outputFolder, dayName);
        if (!chart) {
            console.warn(`⚠️  No JSON chart for ${dayName}, skipping.`);
            continue;
        }

        // 1) Recap
        const recapName = `recap-c${chapterNum + 1}d${dayIndex + 1}.md`;
        const recapFile = path.join(dayPath, "recaps", recapName);
        try {
            const md = await fs.readFile(recapFile, "utf-8");
            chart.dayRecap = md.trim();
        } catch {
            console.warn(`  • Missing dayRecap file: ${recapName}`);
        }

        const suffix = `-c${chapterNum + 1}d${dayIndex + 1}`;

        // 2) Nodes
        const nodesDir = path.join(dayPath, "nodes");
        const seenNodeIds = new Set<string>();
        try {
            const files = (await fs.readdir(nodesDir)).filter((f) =>
                f.endsWith(".md"),
            );
            for (const file of files) {
                const base = path.basename(file, ".md");
                const idKey = base.replace(new RegExp(`${suffix}$`), "");

                const md = (
                    await fs.readFile(path.join(nodesDir, file), "utf-8")
                ).trim();
                const nd = chart.nodes.find(
                    (n) => n.id.startsWith(idKey) && n.data.day === dayIndex,
                );
                if (nd) {
                    nd.data.content = md;
                    seenNodeIds.add(nd.id);
                } else {
                    console.warn(
                        `  • Unknown node file "${file}" in ${dayName}/nodes/`,
                    );
                }
            }
        } catch {
            // no nodes folder
        }
        // now check for JSON nodes missing files
        for (const n of chart.nodes) {
            if (
                (n.data.day === undefined || n.data.day === dayIndex) &&
                !seenNodeIds.has(n.id)
            ) {
                console.warn(
                    `  • No .md file for node "${n.id}" in ${dayName}/nodes/`,
                );
            }
        }

        // 3) Edges
        const edgesDir = path.join(dayPath, "edges");
        const seenEdges = new Set<string>();
        try {
            const files = (await fs.readdir(edgesDir)).filter((f) =>
                f.endsWith(".md"),
            );
            for (const file of files) {
                const base = path.basename(file, ".md");
                const key = base.replace(new RegExp(`${suffix}$`), "");

                const mdFull = await fs.readFile(
                    path.join(edgesDir, file),
                    "utf-8",
                );
                const lines = mdFull.split(/\r?\n/);

                // title
                let title = "";
                if (/^<!--\s*title:\s*(.+?)\s*-->$/.test(lines[0])) {
                    title = lines
                        .shift()!
                        .replace(/^<!--\s*title:\s*(.+?)\s*-->$/, "$1")
                        .trim();
                    if (!lines[0].trim()) lines.shift();
                }
                const content = lines.join("\n").trim();

                // find matching edge
                const ed = chart.edges.find(
                    (e) =>
                        e.id === key ||
                        (e.id.startsWith(key + "-") &&
                            e.data!.day === dayIndex),
                );
                if (ed) {
                    if (title) ed.data!.title = title;
                    ed.data!.content = content;
                    seenEdges.add(ed.id);
                } else {
                    console.warn(
                        `  • Unknown edge file "${file}" in ${dayName}/edges/`,
                    );
                }
            }
        } catch {
            // no edges folder
        }
        // check for JSON edges missing files
        for (const e of chart.edges) {
            if (
                (e.data?.day === undefined || e.data!.day === dayIndex) &&
                !seenEdges.has(e.id)
            ) {
                console.warn(
                    `  • No .md file for edge "${e.id}" in ${dayName}/edges/`,
                );
            }
        }
    }

    // write back JSON into ZIP
    zip.file(entryName, JSON.stringify(chapterJson, null, 2));
    const outZip = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
    await fs.writeFile(zipPath, outZip);

    console.log(
        `✅ Injected data and reported missing files for chapter${chapterNum}.json`,
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
