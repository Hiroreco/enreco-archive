import { Chapter, ChartData } from "@enreco-archive/common/types";
import fs from "fs/promises";
import JSZip from "jszip";
import path from "path";

/**
 * Extracts a map of fanart/meme link URLs to their immediate comment (if any) from a markdown string.
 */
function extractFanartComments(md: string): Record<string, string> {
    // Matches [label](url)<!-- comment -->
    const LINK_COMMENT_RE =
        /\[([^\]]+)\]\((https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^\)]+)\)\s*<!--(.*?)-->/g;
    const map: Record<string, string> = {};
    let m: RegExpExecArray | null;
    while ((m = LINK_COMMENT_RE.exec(md))) {
        const url = m[2].trim();
        const comment = m[3].trim();
        map[url] = comment;
    }
    return map;
}

/**
 * Inserts preserved comments after each fanart/meme link in the new markdown,
 * as a new line directly after the link.
 */
function insertFanartComments(
    md: string,
    preserved: Record<string, string>,
): string {
    // Replace each [label](url) with [label](url)\n<!-- comment --> if a comment exists for that url
    return md.replace(
        /\[([^\]]+)\]\((https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^\)]+)\)/g,
        (full, label, url) => {
            url = url.trim();
            if (preserved[url]) {
                // Avoid double-inserting if the next non-empty line is already the comment
                // (We check for the pattern: link\n<!-- comment -->)
                // We'll do this check outside this function, so always insert
                return `${full}\n<!-- ${preserved[url]} -->`;
            }
            return full;
        },
    );
}

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
        process.cwd(),
        "site-data",
        "editor",
        "current-data.zip",
    );
    let zipData: Buffer;
    try {
        zipData = await fs.readFile(zipPath);
    } catch (err) {
        const errMessage = err instanceof Error ? err.message : err;
        console.error(`Failed to read ZIP at ${zipPath}:`, errMessage);
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

    let chapterJson: Chapter;
    try {
        const jsonStr = await fileEntry.async("text");
        chapterJson = JSON.parse(jsonStr);
        console.log(chapterJson.charts[0].nodes.map((node) => node.id));
    } catch (err) {
        const errMessage = err instanceof Error ? err.message : err;
        console.error(`Failed to parse ${entryName}:`, errMessage);
        process.exit(1);
    }

    const baseOut = path.resolve(
        process.cwd(),
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
            let preservedComments: Record<string, string> = {};
            try {
                const existing = await fs.readFile(filePath, "utf-8");
                preservedComments = extractFanartComments(existing);
            } catch {
                // File doesn't exist, nothing to preserve
            }
            const merged = insertFanartComments(content, preservedComments);
            await fs.writeFile(filePath, merged, "utf-8");
        };

        // recap
        const recapName = `recap-c${chapterNum + 1}d${humanDay}`;
        await writeMd(recapsDir, recapName, chart.dayRecap);

        // nodes
        for (const node of chart.nodes) {
            if (node.data.day !== undefined && node.data.day !== dayIndex)
                continue;
            const nodeName = `${node.id}-c${chapterNum + 1}d${humanDay}`;

            // Add property tags at the start (not adding team because it's unlikely to be changed)
            const nodeContent = `<!-- title: ${node.data.title || node.id} -->
<!-- status: ${node.data.status || "Unknown"} -->

${node.data.content}`;

            await writeMd(nodesDir, nodeName, nodeContent);
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

            const edgeBody = `<!-- title: ${title} -->
<!-- relationship: ${chapterJson.relationships[edge.data.relationshipId].name || "Unknown"} -->

${edge.data.content}`;

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
