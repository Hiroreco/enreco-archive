"use client";

import {
    Chapter,
    ChartData,
    CustomEdgeType,
    EditorChapter,
    EditorImageNodeType,
    EditorSaveMetadata,
    FixedEdgeType,
    ImageNodeType,
    Metadata,
} from "@/lib/type";

import JSZip from "jszip";

const SAVE_VERSION = 1;

function getChapterFileName(chapterIndex: number) {
    return `chapter${chapterIndex}.json`;
}

// Clear the data for nodes on later dates if the same node (based on id and day) is present on an earlier date
// example:
// nodes = [chart[0] has {id: "1", data: {title: "title1", day: 1}}, chart[1] has {id: "1", data: {title: "title1", day: 1}}]
// clearDuplicateNodes(chapter) => [chart[0] has {id: "1", data: {title: "title1", day: 1}}, chart[1] has {id: "1", data: {day: 1}}]
const clearDuplicateNodesData = (chapter: EditorChapter) => {
    const nodeMap = new Map<string, EditorImageNodeType>();

    chapter.charts.forEach((chart) => {
        chart.nodes.forEach((node) => {
            if (!node.data) return;
            const existingNode = nodeMap.get(node.id);
            if (
                !existingNode ||
                !existingNode.data ||
                existingNode.data.day > node.data.day
            ) {
                nodeMap.set(node.id, node);
            }
        });
    });
    const updatedChapter = {
        ...chapter,
        charts: chapter.charts.map((chart, index) => {
            const newNodes = chart.nodes.map((node) => {
                if (node.data.day < index) {
                    const existingNode = nodeMap.get(node.id);
                    if (existingNode) {
                        return {
                            ...node,
                            data: {
                                day: existingNode.data.day,
                            },
                        };
                    }
                }
                return node;
            });
            return {
                ...chart,
                nodes: newNodes,
            };
        }),
    };

    return updatedChapter;
};

// Clear the data for edges on later dates if the same edge is present on an earlier date
// Clear based on if the edge's day is greater than the current day aka the index of the chapter
const clearDuplicateEdgesData = (chapter: EditorChapter) => {
    const edgeMap = new Map<string, CustomEdgeType>();

    chapter.charts.forEach((chart) => {
        chart.edges.forEach((edge) => {
            if (!edge.data) return;
            const existingEdge = edgeMap.get(edge.id);
            if (
                !existingEdge ||
                !existingEdge.data ||
                existingEdge.data.day > edge.data.day
            ) {
                edgeMap.set(edge.id, edge);
            }
        });
    });

    const updatedChapter = {
        ...chapter,
        charts: chapter.charts.map((chart, index) => {
            const newEdges = chart.edges.map((edge) => {
                if (edge.data && edge.data.day < index) {
                    const existingEdge = edgeMap.get(edge.id);
                    if (existingEdge) {
                        return {
                            ...edge,
                            data: {
                                day: existingEdge.data
                                    ? existingEdge.data.day
                                    : 0,
                            },
                        };
                    }
                }
                return edge;
            });
            return {
                ...chart,
                edges: newEdges,
            };
        }),
    };

    return updatedChapter;
};

export async function saveData(editorChapters: EditorChapter[]) {
    const utf8Encoder = new TextEncoder();
    const zipFile = new JSZip();
    let chNum = 0;

    for (const editorChapter of editorChapters) {
        // Clear duplicate nodes and edges in the save data
        const updatedChapter = clearDuplicateNodesData(editorChapter);
        // @ts-expect-error asd
        const updatedChapterWithEdges = clearDuplicateEdgesData(updatedChapter);
        const chJson = JSON.stringify(updatedChapterWithEdges, null, 2);

        zipFile.file(getChapterFileName(chNum), utf8Encoder.encode(chJson));
        chNum++;
    }

    const saveDate = new Date().toISOString();
    const metadata: EditorSaveMetadata = {
        version: SAVE_VERSION,
        numChapters: chNum,
        saveDatetime: saveDate,
    };

    const metadataJson = JSON.stringify(metadata, null, 2);
    zipFile.file("metadata.json", utf8Encoder.encode(metadataJson));

    const zipBlob = await zipFile.generateAsync({ type: "blob" });
    const zipBlobUrl = URL.createObjectURL(zipBlob);

    const dlLink = document.createElement("a");
    dlLink.setAttribute("href", zipBlobUrl);
    dlLink.setAttribute(
        "download",
        `enreco-archive-editor-save-${saveDate}.zip`,
    );
    dlLink.style.display = "none";

    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);

    URL.revokeObjectURL(zipBlobUrl);
}

export async function loadData(setData: (newData: EditorChapter[]) => void) {
    const utf8Decoder = new TextDecoder("utf-8");

    const fileInput = document.createElement("input");
    fileInput.setAttribute("type", "file");
    fileInput.setAttribute("accept", "application/zip");

    fileInput.addEventListener("change", async (event) => {
        const target = event.target as HTMLInputElement;

        if (!target.files) {
            return;
        }

        const file = target.files[0];

        if (
            file.type !== "application/zip" &&
            file.type !== "application/x-zip-compressed"
        ) {
            return;
        }

        const zipData = await file.arrayBuffer();
        const zipFile = await JSZip.loadAsync(zipData);

        const metadataFile = zipFile.filter(
            (_, file) => file.name === "metadata.json",
        )[0];
        const metadataData = await metadataFile.async("uint8array");
        const metadata: EditorSaveMetadata = JSON.parse(
            utf8Decoder.decode(metadataData),
        );

        if (metadata.version !== SAVE_VERSION) {
            return;
        }

        const data = [];
        for (let i = 0; i < metadata.numChapters; i++) {
            const chFileName = getChapterFileName(i);
            const chFile = zipFile.filter(
                (_, file) => file.name === chFileName,
            )[0];
            const chData = await chFile.async("uint8array");
            const ch: EditorChapter = JSON.parse(utf8Decoder.decode(chData));
            data.push(ch);
        }

        setData(data);
    });

    fileInput.click();
}

export async function exportData(editorChapters: EditorChapter[]) {
    const exportData = editorChapters.map<Chapter>((editorChapter) => {
        const chartData = editorChapter.charts.map<ChartData>((chart) => {
            const nodes = chart.nodes.map((node) => {
                const resultNode: ImageNodeType = {
                    ...node,
                    type: "image",
                    data: {
                        title: node.data.title,
                        content: node.data.content,
                        imageSrc: node.data.imageSrc,
                        teamId: node.data.teamId,
                        status: node.data.status,
                        day: node.data.day,
                        bgCardColor: node.data.bgCardColor,
                    },
                };

                return resultNode;
            });

            const edges = chart.edges.map((edge) => {
                const resultEdge: FixedEdgeType = {
                    ...edge,
                    type: "fixed",
                    data: {
                        relationshipId: edge.data!.relationshipId,
                        title: edge.data!.title,
                        content: edge.data!.content,
                        pathType: edge.data!.pathType,
                        day: edge.data!.day,
                        offsets: edge.data!.offsets,
                    },
                };

                return resultEdge;
            });

            const resultChart: ChartData = {
                dayRecap: chart.dayRecap,
                title: chart.title,
                nodes: nodes,
                edges: edges,
            };
            return resultChart;
        });

        const resultChapter: Chapter = {
            numberOfDays: editorChapter.numberOfDays,
            title: editorChapter.title,
            charts: chartData,
            teams: editorChapter.teams,
            relationships: editorChapter.relationships,
        };

        return resultChapter;
    });

    const utf8Encoder = new TextEncoder();
    const zipFile = new JSZip();
    let chNum = 0;

    for (const chapter of exportData) {
        // @ts-expect-error asd
        const updatedChapter = clearDuplicateNodesData(chapter);
        // @ts-expect-error asd
        const updatedChapterWithEdges = clearDuplicateEdgesData(updatedChapter);
        const chJson = JSON.stringify(updatedChapterWithEdges, null, 2);
        zipFile.file(getChapterFileName(chNum), utf8Encoder.encode(chJson));
        chNum++;
    }

    const exportDate = new Date().toISOString();
    const metadata: Metadata = {
        version: SAVE_VERSION,
        numChapters: chNum,
        exportDatetime: exportDate,
    };

    const metadataJson = JSON.stringify(metadata, null, 2);
    zipFile.file("metadata.json", utf8Encoder.encode(metadataJson));

    const zipBlob = await zipFile.generateAsync({ type: "blob" });
    const zipBlobUrl = URL.createObjectURL(zipBlob);

    const dlLink = document.createElement("a");
    dlLink.setAttribute("href", zipBlobUrl);
    dlLink.setAttribute("download", `enreco-archive-export-${exportDate}.zip`);
    dlLink.style.display = "none";

    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);

    URL.revokeObjectURL(zipBlobUrl);
}
