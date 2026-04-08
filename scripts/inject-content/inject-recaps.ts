import { Chapter, ChartData, LocalizedString } from "@enreco-archive/common/types";
import fs from "fs/promises";
import JSZip from "jszip";
import path from "path";

function stripCommentTags(content: string): string {
    // Remove HTML-style comments (<!-- ... -->)
    // This regex handles multi-line comments and comments with newlines
    return content.replace(/<!--[\s\S]*?-->/g, "").trim();
}

function reverseId(id: string): string {
    return id.split("-").reverse().join("-");
}

function isLocalizedString(value: any): value is LocalizedString {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof value.en === "string" &&
        typeof value.ja === "string"
    );
}

async function processChapter(chapterNum: number) {
    console.log(`\n📚 Processing chapter ${chapterNum}...`);

    // ——————————— Update ZIP (both locales together) ———————————
    const zipPath = path.resolve(
        process.cwd(),
        "site-data",
        "editor",
        "current-data.zip",
    );
    const entryName = `chapter${chapterNum}.json`;

    // load ZIP & JSON
    const zipData = await fs.readFile(zipPath);
    const zip = await JSZip.loadAsync(zipData);
    const fileEntry = zip.file(entryName);
    if (!fileEntry) {
        console.error(`❌ ${entryName} not found in ${zipPath}`);
        return;
    }
    const chapterJson: Chapter = JSON.parse(await fileEntry.async("text"));

    // We'll update the ZIP with bilingual content
    const localeChapterJson: Chapter = JSON.parse(JSON.stringify(chapterJson));

    // Process both English and Japanese markdown files
    const locales = ["en", "ja"];
    for (const locale of locales) {
        const outputFolder = path.resolve(
            process.cwd(),
            locale === "en" ? "recap-data" : `recap-data_${locale}`,
            `chapter${chapterNum + 1}`,
        );

        // Check if the recap folder exists
        try {
            await fs.access(outputFolder);
        } catch {
            console.warn(
                `⚠️  Recap folder not found: ${outputFolder}, skipping ${locale}`,
            );
            continue;
        }

        // process each day folder
        const days = await fs.readdir(outputFolder);
        for (const dayName of days.sort()) {
            const dayIndex = Number(dayName.replace(/^day/, "")) - 1;
            const chart = localeChapterJson.charts[dayIndex];
            const dayPath = path.join(outputFolder, dayName);
            if (!chart) {
                console.warn(`⚠️  No JSON chart for ${dayName}, skipping.`);
                continue;
            }

            // 1) dayRecap
            const recapBaseName = `recap-c${chapterNum + 1}d${dayIndex + 1}`;
            const recapFileOptions = [
                `${recapBaseName}${locale === "en" ? "" : `_${locale}`}.md`,
            ];

            let recapFound = false;
            for (const recapOption of recapFileOptions) {
                try {
                    const recapPath = path.join(dayPath, "recaps", recapOption);
                    const md = await fs.readFile(recapPath, "utf-8");

                    // Extract title from first line if present as <!-- title: ... -->
                    const titleLine = md.split(/\r?\n/)[0];
                    const titleMatch = titleLine.match(
                        /^<!--\s*title:\s*(.+?)\s*-->$/,
                    );

                    const cleanedContent = stripCommentTags(md).trim();

                    // Initialize as LocalizedString if needed
                    if (!isLocalizedString(chart.dayRecap)) {
                        chart.dayRecap = { en: "", ja: "" };
                    }
                    if (!isLocalizedString(chart.title)) {
                        chart.title = { en: "", ja: "" };
                    }

                    // Set the appropriate locale
                    (chart.dayRecap as LocalizedString)[locale] = cleanedContent;
                    if (titleMatch) {
                        (chart.title as LocalizedString)[locale] = titleMatch[1].trim();
                    }

                    recapFound = true;
                    break; // Found a valid recap file
                } catch {
                    // Try next option
                }
            }

            if (!recapFound && locale === "en") {
                console.warn(
                    `  • Missing dayRecap file for ${recapBaseName} in ${dayPath}/recaps/`,
                );
            }

            // 2) Nodes
            const nodesDir = path.join(dayPath, "nodes");
            const seenNodes = new Set<string>();
            try {
                for (const file of (await fs.readdir(nodesDir)).filter((f) =>
                    f.endsWith(".md"),
                )) {
                    const base = path.basename(file, ".md");
                    // First strip locale suffix
                    const withoutLocale = base
                        .replace(/(_jp|_ja)$/i, "")
                        .replace(/-jp$|-ja$/i, "");

                    // Then strip chapter/day suffix
                    const idKey = withoutLocale.replace(
                        new RegExp(`-c${chapterNum + 1}d${dayIndex + 1}$`),
                        "",
                    );

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
                        (n) =>
                            n.id.startsWith(idKey) &&
                            (n.data.day === undefined || n.data.day === dayIndex),
                    );
                    if (nd) {
                        // Initialize as LocalizedString if needed
                        if (!isLocalizedString(nd.data.content)) {
                            nd.data.content = { en: "", ja: "" };
                        }

                        // Set the appropriate locale
                        (nd.data.content as LocalizedString)[locale] = content;

                        // Title and status only set once (use English as source of truth)
                        if (locale === "en") {
                            if (title) nd.data.title = title;
                            if (status) nd.data.status = status;
                        }

                        seenNodes.add(nd.id);
                    } else if (locale === "en") {
                        console.warn(
                            `  • Unknown node file "${file}" in ${dayName}/nodes/ (extracted ID: ${idKey})`,
                        );
                    }
                }
            } catch {
                /* ignore missing folder */
            }

            // Only show warnings for missing English files
            if (locale === "en") {
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
            }

            // 3) Edges
            const edgesDir = path.join(dayPath, "edges");
            const seenEdges = new Set<string>();
            try {
                for (const file of (await fs.readdir(edgesDir)).filter((f) =>
                    f.endsWith(".md"),
                )) {
                    const base = path.basename(file, ".md");
                    // First strip locale suffix
                    const withoutLocale = base
                        .replace(/(_jp|_ja)$/i, "")
                        .replace(/-jp$|-ja$/i, "");

                    // Then strip chapter/day suffix
                    const key = withoutLocale.replace(
                        new RegExp(`-c${chapterNum + 1}d${dayIndex + 1}$`),
                        "",
                    );

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
                        if (!lines[0]?.trim()) lines.shift();
                    }

                    let relationship = "";
                    if (/^<!--\s*relationship:\s*(.+?)\s*-->$/.test(lines[0])) {
                        relationship = lines
                            .shift()!
                            .replace(/^<!--\s*relationship:\s*(.+?)\s*-->$/, "$1")
                            .trim();
                        if (!lines[0]?.trim()) lines.shift();
                    }

                    const content = stripCommentTags(lines.join("\n")).trim();

                    const reversedKey = reverseId(key);
                    const ed = chart.edges.find(
                        (e) =>
                            e.id === key ||
                            e.id === reversedKey ||
                            (e.id.startsWith(key + "-") &&
                                (e.data!.day === undefined ||
                                    e.data!.day === dayIndex)) ||
                            (e.id.startsWith(reversedKey + "-") &&
                                (e.data!.day === undefined ||
                                    e.data!.day === dayIndex)),
                    );
                    if (ed) {
                        // Initialize as LocalizedString if needed
                        if (!isLocalizedString(ed.data!.content)) {
                            ed.data!.content = { en: "", ja: "" };
                        }

                        // Set the appropriate locale
                        (ed.data!.content as LocalizedString)[locale] = content;

                        // Title and relationship only set once (use English as source of truth)
                        if (locale === "en") {
                            if (title) ed.data!.title = title;
                            if (relationship) {
                                const relId = Object.keys(
                                    localeChapterJson.relationships,
                                ).find(
                                    (id) =>
                                        localeChapterJson.relationships[id]
                                            .name === relationship,
                                );
                                if (relId !== undefined) {
                                    ed.data!.relationshipId = relId;
                                }
                            }
                        }

                        seenEdges.add(ed.id);
                    } else if (locale === "en") {
                        console.warn(
                            `  • Unknown edge file "${file}" in ${dayName}/edges/ (extracted ID: ${key})`,
                        );
                    }
                }
            } catch {
                /* ignore missing folder */
            }

            // Only show warnings for missing English files
            if (locale === "en") {
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
        }
    }

    // write ZIP back with bilingual content
    zip.file(entryName, JSON.stringify(localeChapterJson, null, 2));
    const outZip = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
    await fs.writeFile(zipPath, outZip);
    console.log(`✅ Injected bilingual content into ZIP: ${zipPath}`);

    // ——————————— Update website JSON ———————————
    const webPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        "recaps",
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
    const webJson = JSON.parse(webStr) as Chapter;

    // Copy over bilingual recaps + node content + edge content/title
    webJson.charts.forEach((wChart: ChartData, dayIndex: number) => {
        const zChart = localeChapterJson.charts[dayIndex];
        if (!zChart || !wChart) return;

        // dayRecap and title
        if (zChart.dayRecap) wChart.dayRecap = zChart.dayRecap;
        if (zChart.title) wChart.title = zChart.title;

        // nodes
        zChart.nodes.forEach((zNode) => {
            if (zNode.data.day !== undefined && zNode.data.day !== dayIndex)
                return;
            const wNode = wChart.nodes.find((n) => n.id === zNode.id);
            if (wNode) {
                if (zNode.data.content) wNode.data.content = zNode.data.content;
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
                if (zEdge.data!.content) wEdge.data!.content = zEdge.data!.content;
                if (zEdge.data!.title !== undefined) {
                    wEdge.data!.title = zEdge.data!.title;
                }
            }
        });
    });

    await fs.writeFile(
        webPath,
        JSON.stringify(webJson, null, 2),
        "utf-8",
    );
    console.log(
        `✅ Injected bilingual recaps into site JSON: ${webPath}`,
    );
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
            console.warn(`No chapter folders found in ${recapDataPath}`);
            return;
        }

        console.log(
            `Found ${chapterFolders.length} chapter folders in ${recapDataPath}: ${chapterFolders.join(", ")}`,
        );
    } catch (err) {
        console.error(`Directory not found: ${recapDataPath}`);
        process.exit(1);
    }

    for (const folderName of chapterFolders) {
        const chapterNum = parseInt(folderName.replace("chapter", ""), 10) - 1;
        await processChapter(chapterNum);
    }

    console.log(`\n🎉 All chapters injected with bilingual content!`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
