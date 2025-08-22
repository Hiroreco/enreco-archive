"use client";

import {
    Chapter,
    ChartData,
    EditorChapter,
    EditorSaveMetadata,
    FixedEdgeType,
    HandleConfig,
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
        const target = event.target as HTMLInputElement;
        if (!target.files) return;
        const file = target.files[0];
        if (
            file.type !== "application/zip" &&
            file.type !== "application/x-zip-compressed"
        )
            return;

        const zipData = await file.arrayBuffer();
        const zipFile = await JSZip.loadAsync(zipData);
        const metadataFile = zipFile.file("metadata.json");
        if (!metadataFile) return;
        const metadataData = await metadataFile.async("uint8array");
        const metadata: EditorSaveMetadata = JSON.parse(
            utf8Decoder.decode(metadataData),
        );
        if (metadata.version !== SAVE_VERSION) return;

        const data: EditorChapter[] = [];
        for (let i = 0; i < metadata.numChapters; i++) {
            const name = getChapterFileName(i);
            const file = zipFile.file(name);
            if (!file) continue;
            const arr = await file.async("uint8array");
            data.push(JSON.parse(utf8Decoder.decode(arr)));
        }
        setData(data);
    });

    fileInput.click();
}

export async function exportData(editorChapters: EditorChapter[]) {
    const utf8Encoder = new TextEncoder();
    const zipFile = new JSZip();

    // Process each chapter separately
    for (let chIdx = 0; chIdx < editorChapters.length; chIdx++) {
        const editorChapter = editorChapters[chIdx];

        // Create a chapter-specific node handles map
        const chapterNodeHandles = new Map<string, Map<string, Set<string>>>();

        // Initialize handle maps for nodes in this chapter only
        for (const chart of editorChapter.charts) {
            for (const node of chart.nodes) {
                if (!chapterNodeHandles.has(node.id)) {
                    chapterNodeHandles.set(node.id, new Map());
                }
            }
        }

        // Process edges from this chapter only
        for (const chart of editorChapter.charts) {
            for (const edge of chart.edges) {
                if (edge.source && edge.sourceHandle) {
                    const nodeHandles = chapterNodeHandles.get(edge.source);
                    if (nodeHandles) {
                        if (!nodeHandles.has(edge.sourceHandle)) {
                            nodeHandles.set(edge.sourceHandle, new Set());
                        }
                        nodeHandles.get(edge.sourceHandle)?.add("source");
                    }
                }
                if (edge.target && edge.targetHandle) {
                    const nodeHandles = chapterNodeHandles.get(edge.target);
                    if (nodeHandles) {
                        if (!nodeHandles.has(edge.targetHandle)) {
                            nodeHandles.set(edge.targetHandle, new Set());
                        }
                        nodeHandles.get(edge.targetHandle)?.add("target");
                    }
                }
            }
        }

        // Convert this chapter's handle data to the output format
        const nodeHandlesMap: { [nodeId: string]: HandleConfig[] } = {};

        for (const [nodeId, handleMap] of chapterNodeHandles.entries()) {
            const handles = [];

            for (const [handleId, types] of handleMap.entries()) {
                const [position, index] = handleId.split("-");
                const posStyle =
                    position === "top" || position === "bottom"
                        ? "left"
                        : "top";

                const positionValue = (parseInt(index) + 1) * (100 / (5 + 1));

                let type = "source";
                if (types.has("source") && types.has("target")) {
                    type = "source-target";
                } else if (types.has("target")) {
                    type = "target";
                }

                handles.push({
                    id: handleId,
                    position: position,
                    style: {
                        [posStyle]: `${positionValue}%`,
                    },
                    type,
                });
            }

            if (handles.length > 0) {
                nodeHandlesMap[nodeId] = handles;
            }
        }

        const resultChapter: Chapter = {
            numberOfDays: editorChapter.numberOfDays,
            title: editorChapter.title,
            charts: editorChapter.charts.map((chart, dayIdx) => {
                const nodes = chart.nodes.map((node) => {
                    return {
                        ...node,
                        type: "image",
                        selected: false,
                        data: {
                            title: node.data.title,
                            content: node.data.content,
                            imageSrc: node.data.imageSrc,
                            teamId: node.data.teamId,
                            status: node.data.status,
                            day: node.data.day,
                            bgCardColor: node.data.bgCardColor,
                            // Don't include handles here anymore
                        },
                    } as ImageNodeType;
                });

                const edges = chart.edges.map((edge) => {
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
            nodeHandles: nodeHandlesMap,
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
