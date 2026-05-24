"use client";

import {
    Chapter,
    ChartData,
    EditorChapter,
    EditorSaveMetadata,
    FixedEdgeType,
    ImageNodeType,
    Metadata,
} from "@enreco-archive/common/types";

import JSZip from "jszip";

const SAVE_VERSION = 1;

function getChapterFileName(chapterIndex: number) {
    return `chapter${chapterIndex}.json`;
}

/**
 * Deduplicate items by chapterIndex, dayIndex, and item.id
 */
export function ensureUniqueByScope<T extends { id: string }>(
    items: T[],
    chapterIndex: number,
    dayIndex: number,
): T[] {
    const seen = new Set<string>();
    return items.filter((item) => {
        const key = `${chapterIndex}-${dayIndex}-${item.id}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

export async function saveData(editorChapters: EditorChapter[]) {
    const utf8Encoder = new TextEncoder();
    const zipFile = new JSZip();

    for (let chIdx = 0; chIdx < editorChapters.length; chIdx++) {
        const editorChapter = editorChapters[chIdx];
        const chapterCopy = JSON.parse(
            JSON.stringify(editorChapter),
        ) as (typeof editorChapters)[0];

        chapterCopy.charts = chapterCopy.charts.map((chart, dayIdx) => ({
            ...chart,
            nodes: ensureUniqueByScope(chart.nodes, chIdx, dayIdx),
            edges: ensureUniqueByScope(chart.edges, chIdx, dayIdx),
        }));

        const chJson = JSON.stringify(chapterCopy, null, 2);
        zipFile.file(getChapterFileName(chIdx), utf8Encoder.encode(chJson));
    }

    const saveDate = new Date().toISOString();
    const metadata: EditorSaveMetadata = {
        version: SAVE_VERSION,
        numChapters: editorChapters.length,
        saveDatetime: saveDate,
    };
    zipFile.file(
        "metadata.json",
        utf8Encoder.encode(JSON.stringify(metadata, null, 2)),
    );

    // Use DEFLATE compression at max level to match manual ZIP sizes
    const zipBlob = await zipFile.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 9 },
    });
    const zipBlobUrl = URL.createObjectURL(zipBlob);

    const dlLink = document.createElement("a");
    dlLink.href = zipBlobUrl;
    dlLink.download = `enreco-archive-editor-save-${saveDate}.zip`;
    dlLink.style.display = "none";

    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);

    URL.revokeObjectURL(zipBlobUrl);
}

export async function loadData(setData: (newData: EditorChapter[]) => void) {
    const utf8Decoder = new TextDecoder("utf-8");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/zip";

    fileInput.addEventListener("change", async (event) => {
        try {
            const target = event.target as HTMLInputElement;
            if (!target.files) {
                console.warn("loadData: No files selected");
                return;
            }
            const file = target.files[0];
            if (!file) {
                console.warn("loadData: No file found");
                return;
            }
            console.log(`loadData: Loading file "${file.name}" (type: ${file.type})`);
            
            if (
                file.type !== "application/zip" &&
                file.type !== "application/x-zip-compressed"
            ) {
                console.warn(`loadData: Invalid file type "${file.type}". Expected application/zip`);
                return;
            }

            const zipData = await file.arrayBuffer();
            const zipFile = await JSZip.loadAsync(zipData);
            console.log(`loadData: Zip loaded successfully. Files:`, Object.keys(zipFile.files));
            
            const metadataFile = zipFile.file("metadata.json");
            if (!metadataFile) {
                console.error("loadData: metadata.json not found in zip file");
                return;
            }
            
            const metadataData = await metadataFile.async("uint8array");
            const metadata: EditorSaveMetadata = JSON.parse(
                utf8Decoder.decode(metadataData),
            );
            console.log(`loadData: Metadata loaded. Version: ${metadata.version}, Chapters: ${metadata.numChapters}`);
            
            if (metadata.version !== SAVE_VERSION) {
                console.error(`loadData: Version mismatch. Expected ${SAVE_VERSION}, got ${metadata.version}`);
                return;
            }

            const data: EditorChapter[] = [];
            for (let i = 0; i < metadata.numChapters; i++) {
                const name = getChapterFileName(i);
                const file = zipFile.file(name);
                if (!file) {
                    console.warn(`loadData: Chapter file "${name}" not found`);
                    continue;
                }
                console.log(`loadData: Loading chapter file "${name}"`);
                const arr = await file.async("uint8array");
                data.push(JSON.parse(utf8Decoder.decode(arr)));
            }
            
            console.log(`loadData: Successfully loaded ${data.length} chapters`);
            setData(data);
        } catch (error) {
            console.error("loadData: Error during file load:", error);
        }
    });

    fileInput.click();
}

export async function exportData(editorChapters: EditorChapter[]) {
    const utf8Encoder = new TextEncoder();
    const zipFile = new JSZip();

    for (let chIdx = 0; chIdx < editorChapters.length; chIdx++) {
        const editorChapter = editorChapters[chIdx];
        const resultChapter: Chapter = {
            numberOfDays: editorChapter.numberOfDays,
            title: editorChapter.title as string,
            charts: editorChapter.charts.map((chart, dayIdx) => {
                const nodes = chart.nodes
                    .filter((node) => node.data?.day === dayIdx)
                    .map(
                        (node) =>
                            ({
                                ...node,
                                type: "image",
                                selected: false,
                                data: {
                                    title: node.data.title,
                                    content: node.data.content,
                                    imageSrc: node.data.imageSrc,
                                    teamId: node.data.teamId,
                                    status: node.data.status,
                                    faction: node.data.faction,
                                    day: node.data.day,
                                    bgCardColor: node.data.bgCardColor,
                                },
                            }) as ImageNodeType,
                    );

                const edges = chart.edges
                    .filter((edge) => edge.data?.day === dayIdx)
                    .map((edge) => {
                        const resultEdge: FixedEdgeType = {
                            ...edge,
                            type: "fixed",
                            selected: false,
                            data: {
                                relationshipId: edge.data!.relationshipId,
                                title: edge.data!.title,
                                content: edge.data!.content,
                                pathType: edge.data!.pathType,
                                day: edge.data!.day,
                                offsets: edge.data!.offsets,
                            },
                        };
                        // explicitly remove any rendering/style data
                        if (resultEdge.style) {
                            delete resultEdge.style;
                        }
                        return resultEdge;
                    });

                const uniqueNodes = ensureUniqueByScope(nodes, chIdx, dayIdx);
                const uniqueEdges = ensureUniqueByScope(edges, chIdx, dayIdx);

                return {
                    dayRecap: chart.dayRecap,
                    title: chart.title,
                    nodes: uniqueNodes,
                    edges: uniqueEdges,
                } as ChartData;
            }),
            teams: editorChapter.teams,
            relationships: editorChapter.relationships,
            bgiSrc: editorChapter.bgiSrc,
            bgmSrc: editorChapter.bgmSrc,
        };

        const chJson = JSON.stringify(resultChapter, null, 2);
        zipFile.file(getChapterFileName(chIdx), utf8Encoder.encode(chJson));
    }

    const exportDate = new Date().toISOString();
    const metadata: Metadata = {
        version: SAVE_VERSION,
        numChapters: editorChapters.length,
        exportDatetime: exportDate,
    };
    zipFile.file(
        "metadata.json",
        utf8Encoder.encode(JSON.stringify(metadata, null, 2)),
    );

    // DEFLATE compression to match manual zip sizes
    const zipBlob = await zipFile.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 9 },
    });
    const zipBlobUrl = URL.createObjectURL(zipBlob);

    const dlLink = document.createElement("a");
    dlLink.href = zipBlobUrl;
    dlLink.download = `enreco-archive-export-${exportDate}.zip`;
    dlLink.style.display = "none";

    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);

    URL.revokeObjectURL(zipBlobUrl);
}
