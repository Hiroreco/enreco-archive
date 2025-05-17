"use client";

import * as Toggle from "@radix-ui/react-toggle";
import * as Toolbar from "@radix-ui/react-toolbar";
import { useReactFlow } from "@xyflow/react";
import {
    LucideArrowRightFromLine,
    LucideFolderOpen,
    LucideSave,
} from "lucide-react";

import EditorChart from "@/components/editor/EditorChart";
import EdgeEditorCard from "@/components/editor/EditorEdgeCard";
import EditorGeneralCard from "@/components/editor/EditorGeneralCard";
import EditorNodeCard from "@/components/editor/EditorNodeCard";
import EditorRelationshipsCard from "@/components/editor/EditorRelationshipsCard";
import EditorTeamsCard from "@/components/editor/EditorTeamsCard";
import EditorTransportControls from "@/components/editor/EditorTransportControls";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Checkbox } from "@enreco-archive/common-ui/components/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import useKeyboard from "@/hooks/useKeyboard";
import { DEFAULT_NODE_IMAGE } from "@/lib/constants";
import { exportData, loadData, saveData } from "@/lib/datahelper";
import { generateEdgeId } from "@/lib/editor-utils";
import {
    CustomEdgeType,
    CustomEdgeTypeNames,
    EditorImageNodeType,
    RelationshipMap,
    TeamMap,
} from "@/lib/type";
import { EditorMode, useEditorStore } from "@/store/editorStore";
import { ThemeType, useSettingStore } from "@/store/settingStore";
import { Label } from "@enreco-archive/common-ui/components/label";
import useLightDarkModeSwitcher from "@/hooks/useLightDarkModeSwitcher";

const EMPTY_NODE: EditorImageNodeType = {
    id: "",
    type: "editorImage",
    position: { x: 0, y: 0 },
    data: {
        title: "",
        content: "",
        imageSrc: DEFAULT_NODE_IMAGE,
        teamId: "",
        status: "",
        day: 0,
        bgCardColor: "",
        renderShowHandles: true,
    },
};

const EMPTY_EDGE: CustomEdgeType = {
    id: "",
    type: "custom",
    source: "",
    target: "",
    style: {},
    data: {
        relationshipId: "",
        title: "",
        content: "",
        day: 0,
        pathType: "invalid",
        offsets: {
            HL: 0,
            VL: 0,
            HC: 0,
            VR: 0,
            HR: 0,
        },
    },
};

const EditorApp = () => {
    const { updateEdge, updateNode, deleteElements } = useReactFlow();
    const editorStore = useEditorStore();
    const { themeType, setThemeType } = useSettingStore();
    const isDarkMode = useLightDarkModeSwitcher(themeType);
    useKeyboard();

    const currentChapter = editorStore.chapter !== null ? editorStore.data[editorStore.chapter] ?? null : null;
    const currentDay = editorStore.day !== null ? currentChapter?.charts[editorStore.day] ?? null : null;
    const numChapters = editorStore.data.length;
    const numDays = currentChapter?.numberOfDays ?? 0;
    const teams = currentChapter?.numberOfDays ?? {};
    const relationships = currentChapter?.relationships ?? {};

    const rawNodes = editorStore.chapter !== null && editorStore.day !== null ? 
        currentChapter?.charts[editorStore.day]?.nodes ?? [] : 
        [];
    const nodes = rawNodes.map((node) => {
        const newNode = structuredClone(node);
        newNode.data.renderShowHandles = editorStore.showHandles;
        return newNode;
    });

    const processedNodes = nodes
        .map((node) => {
            if (node.data.day !== editorStore.day) {
                if (!currentChapter?.charts[node.data.day]) {
                    return undefined;
                }
                // get the node from the latest day it was updated
                const latestNodes = currentChapter.charts;
                const dayNodes = latestNodes[node.data.day]?.nodes;
                if (!dayNodes) return;
                const latestUpdatedNode = dayNodes.find(
                    (n) => n.id === node.id && n.data.day === node.data.day,
                );
                return latestUpdatedNode ? latestUpdatedNode : node;
            }
            return node;
        })
        .filter((node): node is EditorImageNodeType => node !== undefined);

    const rawEdges = editorStore.chapter !== null && editorStore.day !== null ? 
        currentChapter?.charts[editorStore.day]?.edges ?? [] : 
        [];;
    const edges = rawEdges.map((edge) => {
        const newEdge = structuredClone(edge);
        if (newEdge.data && newEdge.data.relationshipId) {
            newEdge.style =
                relationships[newEdge.data.relationshipId]?.style || {};
        } else {
            newEdge.style = {};
        }
        return newEdge;
    });

    const processedEdges = edges
        .map((edge) => {
            if (edge.data && edge.data.day !== editorStore.day) {
                if (!currentChapter?.charts[edge.data.day]) {
                    return undefined;
                }
                // get the edge from the latest day it was updated
                if (edge.data && edge.data.day !== editorStore.day) {
                    const latestUpdatedEdges = currentChapter?.charts[edge.data.day]?.edges ?? [];
                    const latestUpdatedEdge = latestUpdatedEdges.find(
                        (e) =>
                            e.id === edge.id && e.data?.day === edge.data?.day,
                    );
                    return latestUpdatedEdge ? latestUpdatedEdge : edge;
                }
                return edge;
            }
            return edge;
        })
        .filter((edge): edge is CustomEdgeType => edge !== undefined);

    const updateEdgeEH = (oldEdge: CustomEdgeType, newEdge: CustomEdgeType) => {
        updateEdge(oldEdge.id, newEdge);
    };

    const updateNodeEH = (
        oldNode: EditorImageNodeType,
        newNode: EditorImageNodeType,
    ) => {
        if (oldNode.id !== newNode.id) {
            edges
                .filter((edge) => edge.source === oldNode.id)
                .forEach((edge) => {
                    edge.source = newNode.id;
                    edge.id = generateEdgeId(
                        newNode.id,
                        edge.target,
                        edge.sourceHandle,
                        edge.targetHandle,
                    );
                });
            edges
                .filter((edge) => edge.target === oldNode.id)
                .forEach((edge) => {
                    edge.target = newNode.id;
                    edge.id = generateEdgeId(
                        edge.source,
                        newNode.id,
                        edge.sourceHandle,
                        edge.targetHandle,
                    );
                });
            editorStore.setEdges(edges);
        }

        updateNode(oldNode.id, newNode);
    };

    const deleteEdge = () => {
        if (editorStore.selectedEdge) {
            deleteElements({
                edges: [editorStore.selectedEdge],
            });
        }
        editorStore.setSelectedEdge(null);
        editorStore.setCurrentCard(null);
    };

    const deleteNode = () => {
        if (editorStore.selectedNode) {
            deleteElements({
                nodes: [editorStore.selectedNode],
            });
        }
        editorStore.setSelectedNode(null);
        editorStore.setCurrentCard(null);
    };

    const addChapterEH = () => {
        if (editorStore.chapter === null) {
            editorStore.setChapter(0);
            editorStore.addChapter();
        } else {
            editorStore.insertChapter(editorStore.chapter);
            editorStore.setChapter(editorStore.chapter + 1);
        }
        editorStore.setDay(null);
    };

    const deleteChapterEH = () => {
        if (editorStore.chapter === 0) {
            editorStore.deleteChapter(0);
            editorStore.setChapter(numChapters === 1 ? null : 0);
        } else if (editorStore.chapter === numChapters - 1) {
            editorStore.deleteChapter(editorStore.chapter);
            editorStore.setChapter(editorStore.chapter - 1);
        } else if (editorStore.chapter !== null) {
            editorStore.deleteChapter(editorStore.chapter);
        }
    };

    const addDayEH = () => {
        if (editorStore.day === null) {
            editorStore.setDay(0);
            editorStore.addDay();
        } else {
            editorStore.insertDay(editorStore.day);
            editorStore.setDay(editorStore.day + 1);
        }
    };

    const deleteDayEH = () => {
        if (editorStore.day === 0) {
            editorStore.deleteDay(0);
            editorStore.setDay(numDays === 1 ? null : 0);
        } else if (editorStore.day === numDays - 1) {
            editorStore.deleteDay(editorStore.day);
            editorStore.setDay(editorStore.day - 1);
        } else if (editorStore.day !== null) {
            editorStore.deleteDay(editorStore.day);
        }
    };

    return (
        <>
            <div className="w-screen h-screen">
                <EditorChart
                    nodes={processedNodes}
                    setNodes={editorStore.setNodes}
                    edges={processedEdges}
                    setEdges={editorStore.setEdges}
                    edgeType={editorStore.edgeType}
                    areNodesDraggable={editorStore.mode === "edit"}
                    canPlaceNewNode={editorStore.mode === "place"}
                    isDarkMode={isDarkMode}
                    onNodeClick={(node: EditorImageNodeType) => {
                        editorStore.setCurrentCard("node");
                        editorStore.setSelectedNode(node);
                        editorStore.setSelectedEdge(null);
                    }}
                    onEdgeClick={(edge: CustomEdgeType) => {
                        editorStore.setCurrentCard("edge");
                        editorStore.setSelectedEdge(edge);
                        editorStore.setSelectedNode(null);
                    }}
                />
            </div>

            <Toolbar.Root
                id="main-toolbar"
                className="flex flex-row fixed top-5 left-[2.5%] right-[2.5%] w-[95%] mx-auto p-2 px-5 bg-muted rounded-lg"
            >
                <div className="w-2/12 flex flex-col gap-y-0.5">
                    <span className="text-md font-bold">Editor Mode</span>
                    <Select
                        value={editorStore.mode}
                        onValueChange={(value: EditorMode) =>
                            editorStore.setMode(value)
                        }
                    >
                        <Toolbar.Button asChild>
                            <SelectTrigger className="h-8" useUpChevron={false}>
                                <SelectValue />
                            </SelectTrigger>
                        </Toolbar.Button>

                        <SelectContent side={"bottom"}>
                            <SelectItem value={"view"}>View</SelectItem>
                            <SelectItem value={"edit"}>Edit</SelectItem>
                            <SelectItem value={"place"}>Place</SelectItem>
                            <SelectItem value={"delete"}>Delete</SelectItem>
                        </SelectContent>
                    </Select>

                    <span className="text-md font-bold">Edge Type</span>
                    <Select
                        value={editorStore.edgeType}
                        onValueChange={(value: CustomEdgeTypeNames) =>
                            editorStore.setEdgeType(value)
                        }
                    >
                        <Toolbar.Button asChild>
                            <SelectTrigger className="h-8" useUpChevron={false}>
                                <SelectValue />
                            </SelectTrigger>
                        </Toolbar.Button>

                        <SelectContent side={"bottom"}>
                            <SelectItem value={"custom"}>Custom</SelectItem>
                            <SelectItem value={"customSmooth"}>
                                Custom (Smooth)
                            </SelectItem>
                            <SelectItem value={"customStraight"}>
                                Custom (Straight)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Toolbar.Separator className="mx-2.5 w-px bg-black" />
                <EditorTransportControls
                    className="w-4/12"
                    chapter={editorStore.chapter}
                    chapters={editorStore.data}
                    day={editorStore.day}
                    onChapterChange={(newChapter: number) => {
                        editorStore.setChapter(newChapter);

                        let newChapterHasDays = (editorStore.data[newChapter]?.numberOfDays ?? 0) !== 0;
                        editorStore.setDay(newChapterHasDays ? 0 : null);
                    }}
                    onDayChange={(newDay: number) => editorStore.setDay(newDay)}
                    onChapterAdd={addChapterEH}
                    onChapterDelete={deleteChapterEH}
                    onDayAdd={addDayEH}
                    onDayDelete={deleteDayEH}
                    onDayClone={editorStore.cloneDay}
                    onDayMove={editorStore.moveDay}
                />
                <Toolbar.Separator className="mx-2.5 w-px bg-black" />
                <div className="w-2/12 flex flex-col gap-y-2">
                    <Toggle.Root
                        disabled={editorStore.chapter === null}
                        pressed={editorStore.currentCard === "general"}
                        onPressedChange={(pressed: boolean) => {
                            if (pressed) {
                                editorStore.setCurrentCard("general");
                                editorStore.setSelectedNode(null);
                                editorStore.setSelectedEdge(null);
                            } else {
                                editorStore.setCurrentCard(null);
                            }
                        }}
                        className="h-8 disabled:opacity-50 disabled:hover:bg-background outline-hidden bg-background text-foreground hover:bg-accent rounded-lg data-[state=on]:bg-accent"
                    >
                        <span className="text-md">
                            Chapter Title / Day Recap
                        </span>
                    </Toggle.Root>
                    <Toggle.Root
                        disabled={editorStore.chapter === null}
                        pressed={editorStore.currentCard === "teams"}
                        onPressedChange={(pressed: boolean) => {
                            if (pressed) {
                                editorStore.setCurrentCard("teams");
                            } else {
                                editorStore.setCurrentCard(null);
                            }
                        }}
                        className="h-8 disabled:opacity-50 disabled:hover:bg-background outline-hidden bg-background text-foreground hover:bg-accent rounded-lg data-[state=on]:bg-accent"
                    >
                        <span className="text-md">Chapter Teams</span>
                    </Toggle.Root>
                    <Toggle.Root
                        disabled={editorStore.chapter === null}
                        pressed={editorStore.currentCard === "relationships"}
                        onPressedChange={(pressed: boolean) => {
                            if (pressed) {
                                editorStore.setCurrentCard("relationships");
                            } else {
                                editorStore.setCurrentCard(null);
                            }
                        }}
                        className="h-8 disabled:opacity-50 disabled:hover:bg-background outline-hidden bg-background text-foreground hover:bg-accent rounded-lg data-[state=on]:bg-accent"
                    >
                        <span className="text-md">Chapter Relationships</span>
                    </Toggle.Root>
                </div>
                <Toolbar.Separator className="mx-2.5 w-px bg-black" />
                <div className="w-1/12 flex flex-col gap-y-2">
                    <Button
                        className="h-8 gap-2 bg-background text-foreground"
                        onClick={() => saveData(editorStore.data)}
                    >
                        <LucideSave />
                        <span className="text-md">Save</span>
                    </Button>
                    <Button
                        className="h-8 gap-2 bg-background text-foreground"
                        onClick={() => loadData(editorStore.setData)}
                    >
                        <LucideFolderOpen />
                        <span className="text-md">Load</span>
                    </Button>
                    <Button
                        className="h-8 gap-2 bg-background text-foreground"
                        onClick={() => exportData(editorStore.data)}
                    >
                        <LucideArrowRightFromLine />
                        <span className="text-md">Export</span>
                    </Button>
                </div>
                <Toolbar.Separator className="mx-2.5 w-px bg-black" />
                <div className="w-1/12 flex flex-col gap-y-0.5">
                    <span className="text-md font-bold">Settings</span>
                    <div className="flex content-center h-fit gap-2">
                        <Checkbox
                            id="toggleHandles"
                            className="my-auto"
                            checked={editorStore.showHandles}
                            onCheckedChange={(checked) =>
                                checked && checked !== "indeterminate"
                                    ? editorStore.setShowHandles(true)
                                    : editorStore.setShowHandles(false)
                            }
                        />
                        <label htmlFor="toggleHandles">Show Handles</label>
                    </div>
                    <div className="flex flex-row justify-between items-center w-full">
                        <Label htmlFor="theme-option">App Theme</Label>
                        <Select
                            onValueChange={(value) =>
                                setThemeType(value as ThemeType)
                            }
                            value={themeType}
                        >
                            <SelectTrigger
                                id="theme-option"
                                name="theme-option"
                                className="w-[100px]"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="system">System</SelectItem>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Toolbar.Root>

            <EditorNodeCard
                key={
                    editorStore.selectedNode
                        ? `${editorStore.selectedNode.id}-node-editor-card`
                        : "null-node-editor-card"
                }
                isVisible={editorStore.currentCard === "node"}
                selectedNode={editorStore.selectedNode || EMPTY_NODE}
                teams={teams}
                nodes={nodes}
                updateNode={updateNodeEH}
                deleteNode={deleteNode}
                onCardClose={() => editorStore.setCurrentCard(null)}
                numberOfDays={numDays}
                isDarkMode={isDarkMode}
            />

            <EdgeEditorCard
                key={
                    editorStore.selectedEdge
                        ? `${editorStore.selectedEdge.id}-edge-editor-card`
                        : "null-edge-editor-card"
                }
                isVisible={editorStore.currentCard === "edge"}
                selectedEdge={editorStore.selectedEdge || EMPTY_EDGE}
                relationships={relationships}
                deleteEdge={deleteEdge}
                updateEdge={updateEdgeEH}
                onCardClose={() => editorStore.setCurrentCard(null)}
                numberOfDays={numDays}
                isDarkMode={isDarkMode}
            />

            <EditorGeneralCard
                key={`${editorStore.chapter}/${editorStore.day}`}
                isVisible={editorStore.currentCard === "general"}
                chapterData={currentChapter}
                dayData={currentDay}
                isDarkMode={isDarkMode}
                onChapterTitleChange={editorStore.setChapterTitle}
                onDayTitleChange={editorStore.setDayTitle}
                onDayRecapChange={editorStore.setDayRecap}
                onBGImageChange={editorStore.setChapterBackgroundImage}
                onBGMChange={editorStore.setChapterBgm}
                onCardClose={() => editorStore.setCurrentCard(null)}
            />

            <EditorTeamsCard
                key={`${editorStore.chapter}-teams-card`}
                isVisible={editorStore.currentCard === "teams"}
                teamData={currentChapter?.teams ?? {}}
                onTeamsChange={(teams: TeamMap) => {
                    editorStore.setChapterTeams(teams);
                }}
                onCardClose={() => editorStore.setCurrentCard(null)}
            />

            <EditorRelationshipsCard
                key={`${editorStore.chapter}-relationships-card`}
                isVisible={editorStore.currentCard === "relationships"}
                relationshipData={currentChapter?.relationships ?? {}}
                onRelationshipsChange={(relationships: RelationshipMap) => {
                    editorStore.setChapterRelationships(relationships);
                }}
                onCardClose={() => editorStore.setCurrentCard(null)}
            />
        </>
    );
};

export default EditorApp;
