import { Chapter, ChartData } from "@enreco-archive/common/types";
import fs from "fs/promises";
import JSZip from "jszip";
import path from "path";

function stripCommentTags(content: string): string {
    // Remove HTML-style comments (<!-- ... -->)
    // This regex handles multi-line comments and comments with newlines
    return content.replace(/<!--[\s\S]*?-->/g, "").trim();
}

async function processChapter(chapterNum: number) {
    console.log(`\n📚 Processing chapter ${chapterNum}...`);

    // ——————————— Update ZIP ———————————
    const zipPath = path.resolve(
        process.cwd(),
        "site-data",
        "editor",
        "current-data.zip",
    );
    const entryName = `chapter${chapterNum}.json`;
    const outputFolder = path.resolve(
        process.cwd(),
        "recap-data",
        `chapter${chapterNum + 1}`,
    );

    // Check if the recap folder exists
    try {
        await fs.access(outputFolder);
    } catch {
        console.warn(
            `⚠️  Recap folder not found: ${outputFolder}, skipping chapter ${chapterNum}`,
        );
        return;
    }

    // load ZIP & JSON
    const zipData = await fs.readFile(zipPath);
    const zip = await JSZip.loadAsync(zipData);
    const fileEntry = zip.file(entryName);
    if (!fileEntry) {
        console.error(`❌ ${entryName} not found in ${zipPath}`);
        return;
    }
    const chapterJson: Chapter = JSON.parse(await fileEntry.async("text"));

    // process each day folder exactly as before
    const days = await fs.readdir(outputFolder);
    for (const dayName of days.sort()) {
        const dayIndex = Number(dayName.replace(/^day/, "")) - 1;
        const chart = chapterJson.charts[dayIndex];
        const dayPath = path.join(outputFolder, dayName);
        if (!chart) {
            console.warn(`⚠️  No JSON chart for ${dayName}, skipping.`);
            continue;
        }

        // 1) dayRecap
        const recapName = `recap-c${chapterNum + 1}d${dayIndex + 1}.md`;
        try {
            const md = await fs.readFile(
                path.join(dayPath, "recaps", recapName),
                "utf-8",
            );

            // Extract title from first line if present as <!-- title: ... -->
            const titleLine = md.split(/\r?\n/)[0];
            const titleMatch = titleLine.match(/^<!--\s*title:\s*(.+?)\s*-->$/);
            if (titleMatch) {
                chart.title = titleMatch[1].trim();
            }

            chart.dayRecap = stripCommentTags(md).trim();
        } catch {
            console.warn(`  • Missing dayRecap file: ${recapName}`);
        }

        const suffix = `-c${chapterNum + 1}d${dayIndex + 1}`;

        // 2) Nodes
        const nodesDir = path.join(dayPath, "nodes");
        const seenNodes = new Set<string>();
        try {
            for (const file of (await fs.readdir(nodesDir)).filter((f) =>
                f.endsWith(".md"),
            )) {
                const base = path.basename(file, ".md");
                const idKey = base.replace(new RegExp(`${suffix}$`), "");
                const mdFull = await fs.readFile(
                    path.join(nodesDir, file),
                    "utf-8",
                );
                const lines = mdFull.split(/\r?\n/);

                let title = "";
                let status = "";

                // Extract title
                if (/^<!--\s*title:\s*(.+?)\s*-->$/.test(lines[0])) {
                    title = lines
                        .shift()!
                        .replace(/^<!--\s*title:\s*(.+?)\s*-->$/, "$1")
                        .trim();
                    if (!lines[0]?.trim()) lines.shift();
                }

                // Extract status
                if (/^<!--\s*status:\s*(.+?)\s*-->$/.test(lines[0])) {
                    status = lines
                        .shift()!
                        .replace(/^<!--\s*status:\s*(.+?)\s*-->$/, "$1")
                        .trim();
                    if (!lines[0]?.trim()) lines.shift();
                }

                const content = stripCommentTags(lines.join("\n")).trim();

                const nd = chart.nodes.find(
                    (n) => n.id.startsWith(idKey) && n.data.day === dayIndex,
                );
                if (nd) {
                    nd.data.content = content;
                    if (title) nd.data.title = title;
                    if (status) nd.data.status = status;
                    seenNodes.add(nd.id);
                } else {
                    console.warn(
                        `  • Unknown node file "${file}" in ${dayName}/nodes/`,
                    );
                }
            }
        } catch {
            /* ignore missing folder */
        }
        for (const n of chart.nodes) {
            if (
                (n.data.day === undefined || n.data.day === dayIndex) &&
                !seenNodes.has(n.id)
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

                let title = "";
                if (/^<!--\s*title:\s*(.+?)\s*-->$/.test(lines[0])) {
                    title = lines
                        .shift()!
                        .replace(/^<!--\s*title:\s*(.+?)\s*-->$/, "$1")
                        .trim();
                    if (!lines[0].trim()) lines.shift();
                }

                let relationship = "";
                if (/^<!--\s*relationship:\s*(.+?)\s*-->$/.test(lines[0])) {
                    relationship = lines
                        .shift()!
                        .replace(/^<!--\s*relationship:\s*(.+?)\s*-->$/, "$1")
                        .trim();
                    if (!lines[0].trim()) lines.shift();
                }

                const content = stripCommentTags(lines.join("\n")).trim();

                const ed = chart.edges.find(
                    (e) =>
                        e.id === key ||
                        (e.id.startsWith(key + "-") &&
                            e.data!.day === dayIndex),
                );
                if (ed) {
                    if (title) ed.data!.title = title;
                    if (relationship) {
                        const relId = Object.keys(
                            chapterJson.relationships,
                        ).find(
                            (id) =>
                                chapterJson.relationships[id].name ===
                                relationship,
                        );
                        if (relId !== undefined) {
                            ed.data!.relationshipId = relId;
                        }
                    }
                    ed.data!.content = content;
                    seenEdges.add(ed.id);
                } else {
                    console.warn(
                        `  • Unknown edge file "${file}" in ${dayName}/edges/`,
                    );
                }
            }
        } catch {
            /* ignore missing folder */
        }
        for (const e of chart.edges) {
            if (
                (e.data?.day === undefined || e.data.day === dayIndex) &&
                !seenEdges.has(e.id)
            ) {
                console.warn(
                    `  • No .md file for edge "${e.id}" in ${dayName}/edges/`,
                );
            }
        }
    }

    // write ZIP back
    zip.file(entryName, JSON.stringify(chapterJson, null, 2));
    const outZip = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
    await fs.writeFile(zipPath, outZip);
    console.log(`✅ Injected chapter ${chapterNum} into ZIP: ${zipPath}`);

    // ——————————— Update website JSON ———————————
    const webPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        `chapter${chapterNum}.json`,
    );

    // Check if website JSON exists
    try {
        await fs.access(webPath);
    } catch {
        console.warn(
            `⚠️  Website JSON not found: ${webPath}, skipping website update for chapter ${chapterNum}`,
        );
        return;
    }

    const webStr = await fs.readFile(webPath, "utf-8");
    const webJson = JSON.parse(webStr) as { charts: ChartData[] };

    // Only copy over recaps + node content + edge content/title:
    webJson.charts.forEach((wChart, dayIndex) => {
        const zChart = chapterJson.charts[dayIndex];
        if (!zChart || !wChart) return;

        // dayRecap
        wChart.title = zChart.title;
        wChart.dayRecap = zChart.dayRecap;

        // nodes
        zChart.nodes.forEach((zNode) => {
            if (zNode.data.day !== undefined && zNode.data.day !== dayIndex)
                return;
            const wNode = wChart.nodes.find((n) => n.id === zNode.id);
            if (wNode) {
                wNode.data.content = zNode.data.content;
                if (zNode.data.title !== undefined) {
                    wNode.data.title = zNode.data.title;
                }
                if (zNode.data.status !== undefined) {
                    wNode.data.status = zNode.data.status;
                }
            }
        });

        // edges
        zChart.edges.forEach((zEdge) => {
            if (zEdge.data!.day !== undefined && zEdge.data!.day !== dayIndex)
                return;
            const wEdge = wChart.edges.find((e) => e.id === zEdge.id);
            if (wEdge) {
                wEdge.data!.content = zEdge.data!.content;
                if (zEdge.data!.title !== undefined) {
                    wEdge.data!.title = zEdge.data!.title;
                }
            }
        });
    });

    await fs.writeFile(webPath, JSON.stringify(webJson, null, 2), "utf-8");
    console.log(`✅ Injected recaps into site JSON: ${webPath}`);
}

async function main() {
    const recapDataPath = path.resolve(process.cwd(), "recap-data");

    let chapterFolders: string[];
    try {
        chapterFolders = (
            await fs.readdir(recapDataPath, { withFileTypes: true })
        )
            .filter((e) => e.isDirectory() && /^chapter\d+$/.test(e.name))
            .map((e) => e.name)
            .sort();

        if (chapterFolders.length === 0) {
            console.warn("No chapter folders found in recap-data");
            return;
        }

        console.log(
            `Found ${chapterFolders.length} chapter folders: ${chapterFolders.join(", ")}`,
        );
    } catch (err) {
        console.error(`Directory not found: ${recapDataPath}`);
        process.exit(1);
    }

    for (const folderName of chapterFolders) {
        const chapterNum = parseInt(folderName.replace("chapter", ""), 10) - 1;
        await processChapter(chapterNum);
    }

    console.log("\n🎉 All chapters processed!");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
