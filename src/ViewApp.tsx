"use client";
import { useState } from "react";

import ViewEdgeCard from "@/components/view/ViewEdgeCard";
import ViewInfoModal from "@/components/view/ViewInfoModal";
import ViewNodeCard from "@/components/view/ViewNodeCard";
import ViewSettingCard from "@/components/view/ViewSettingCard";
import {
    FitViewOperation,
    FixedEdgeType,
    ImageNodeType,
    SiteData,
} from "@/lib/type";
import { CardType, useViewStore } from "@/store/viewStore";

import ViewAskVideoModal from "@/components/view/ViewAskVideoModal";
import ViewMiniGameModal from "@/components/view/ViewMiniGameModal";
import ViewVideoModal from "@/components/view/ViewVideoModal";
import { useAudioSettingsSync } from "@/store/audioStore";
import { useSettingStore } from "@/store/settingStore";
import { Dice6, Info, Settings } from "lucide-react";
import { IconButton } from "./components/ui/IconButton";
import ViewChart from "./components/view/ViewChart";
import ViewSettingsModal from "./components/view/ViewSettingsModal";
import ViewTransportControls from "./components/view/ViewTransportControls";
import { useBrowserHash } from "./hooks/useBrowserHash";
import { useDisabledDefaultMobilePinchZoom } from "./hooks/useDisabledDefaultMobilePinchZoom";
import clsx from "clsx";

function parseChapterAndDayFromBrowserHash(hash: string): number[] | null {
    const parseOrZero = (value: string): number => {
        const parsed = parseInt(value, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
    };

    const parts = hash.split("/");

    if (parts.length === 2) {
        const chapter = parseOrZero(parts[0]);
        const day = parseOrZero(parts[1]);
        return [chapter, day];
    }

    return null;
}

interface Props {
    useDarkMode: boolean;
    siteData: SiteData;
}

let didInit = false;
const ViewApp = ({ siteData, useDarkMode }: Props) => {
    useAudioSettingsSync();
    /* State variables */
    const viewStore = useViewStore();
    const settingsStore = useSettingStore();

    const [chartShrink, setChartShrink] = useState(0);
    const [fitViewOperation, setFitViewOperation] =
        useState<FitViewOperation>("none");
    const [doFitView, setDoFitView] = useState(true);
    const { browserHash, setBrowserHash } = useBrowserHash(onBrowserHashChange);
    const [previousCard, setPreviousCard] = useState<CardType | null>(null);

    // For disabling default pinch zoom on mobiles, as it conflict with the chart's zoom
    // Also when pinch zoom when one of the cards are open, upon closing the zoom will stay that way permanently
    useDisabledDefaultMobilePinchZoom();

    /* Data variables */
    const chapterData = siteData.chapters[viewStore.chapter];
    const dayData = chapterData.charts[viewStore.day];

    const processedNodes = dayData.nodes
        .map((node) => {
            if (node.data.day !== viewStore.day) {
                // get the node from the latest day it was updated
                let latestUpdatedNode = undefined;
                for (let i = viewStore.day - 1; i >= 0; i--) {
                    latestUpdatedNode = chapterData.charts[i].nodes.find(
                        (n) => n.id === node.id && n.data && i === n.data.day,
                    );
                    if (latestUpdatedNode) {
                        break;
                    }
                }
                return latestUpdatedNode ? latestUpdatedNode : node;
            }
            return node;
        })
        .filter((node): node is ImageNodeType => node !== undefined);

    const processedEdges = dayData.edges
        .map((edge) => {
            if (edge.data && edge.data.day !== viewStore.day) {
                // get the edge from the latest day it was updated
                let latestUpdatedEdge = undefined;
                for (let i = viewStore.day - 1; i >= 0; i--) {
                    latestUpdatedEdge = chapterData.charts[i].edges.find(
                        (e) => e.id === edge.id && e.data && i === e.data.day,
                    );
                    if (latestUpdatedEdge) {
                        break;
                    }
                }
                return latestUpdatedEdge ? latestUpdatedEdge : edge;
            }
            return edge;
        })
        .filter((edge): edge is FixedEdgeType => edge !== undefined);

    // Update dayData with the processed nodes and edges
    dayData.nodes = processedNodes;
    dayData.edges = processedEdges;

    /* Helper function to coordinate state updates when data changes. */
    function updateData(newChapter: number, newDay: number) {
        if (
            newChapter < 0 ||
            newChapter > siteData.numberOfChapters ||
            newDay < 0 ||
            newDay > siteData.chapters[viewStore.chapter].numberOfDays
        ) {
            return;
        }

        const newChapterData = siteData.chapters[newChapter];
        const newDayData = newChapterData.charts[newDay];

        // Rest edge/team/character visibility on data change.
        // Setting the visibility of edges, teams and characters
        const edgeVisibilityLoaded: { [key: string]: boolean } = {};
        const teamVisibilityLoaded: { [key: string]: boolean } = {};
        const characterVisibilityLoaded: { [key: string]: boolean } = {};

        // To avoid overwriting current visibility for "new"
        edgeVisibilityLoaded["new"] = edgeVisibilityLoaded["new"] || true;

        Object.keys(newChapterData.relationships).forEach((key) => {
            edgeVisibilityLoaded[key] = true;
        });

        Object.keys(newChapterData.teams).forEach((key) => {
            teamVisibilityLoaded[key] = true;
        });

        newDayData.nodes.forEach(
            (node) => (characterVisibilityLoaded[node.id] = true),
        );

        viewStore.setEdgeVisibility(edgeVisibilityLoaded);
        viewStore.setTeamVisibility(teamVisibilityLoaded);
        viewStore.setCharacterVisibility(characterVisibilityLoaded);
        viewStore.setChapter(newChapter);
        viewStore.setDay(newDay);
        setBrowserHash(`${newChapter}/${newDay}`);
    }

    /* Event handler functions */
    function onBrowserHashChange(hash: string) {
        const parsedValues = parseChapterAndDayFromBrowserHash(hash);

        if (parsedValues) {
            const [chapter, day] = parsedValues;
            updateData(chapter, day);
        }
    }

    // Update react flow renderer width when setting card is open, so the flow is not covered by the card
    function onCurrentCardChange(newCurrentCard: CardType) {
        if (newCurrentCard !== "setting") {
            setChartShrink(0);
        }
        if (newCurrentCard === "setting" || newCurrentCard === null) {
            setFitViewOperation("fit-to-all");
        } else if (newCurrentCard === "node") {
            setFitViewOperation("fit-to-node");
        } else if (newCurrentCard === "edge") {
            setFitViewOperation("fit-to-edge");
        }
        setPreviousCard(viewStore.currentCard);
        viewStore.setCurrentCard(newCurrentCard);
        setDoFitView(!doFitView);
    }

    function onNodeClick(node: ImageNodeType) {
        onCurrentCardChange("node");
        viewStore.setSelectedNode(node);
    }

    function onEdgeClick(edge: FixedEdgeType) {
        onCurrentCardChange("edge");
        viewStore.setSelectedEdge(edge);
    }

    function onPaneClick() {
        onCurrentCardChange(null);
        viewStore.setSelectedNode(null);
        viewStore.setSelectedEdge(null);
    }

    /* Init block, runs only on first render/load. */
    if (!didInit) {
        didInit = true;

        const initialChapterDay =
            parseChapterAndDayFromBrowserHash(browserHash);
        if (initialChapterDay) {
            const [chapter, day] = initialChapterDay;
            updateData(chapter, day);
        } else {
            updateData(0, 0);
        }
    }

    const selectedNodeTeam =
        viewStore.selectedNode && viewStore.selectedNode.data.teamId
            ? chapterData.teams[viewStore.selectedNode.data.teamId]
            : null;
    const selectedEdgeRelationship =
        viewStore.selectedEdge && viewStore.selectedEdge.data?.relationshipId
            ? chapterData.relationships[
                  viewStore.selectedEdge.data?.relationshipId
              ]
            : null;

    let bgImage = "bg.webp";
    if(useDarkMode) {
        bgImage = "bg-dark.png";
    }

    return (
        <>
            <div className="w-screen h-screen top-0 inset-x-0 overflow-hidden">
                <ViewChart
                    nodes={dayData.nodes}
                    edges={dayData.edges}
                    edgeVisibility={viewStore.edgeVisibility}
                    teamVisibility={viewStore.teamVisibility}
                    characterVisibility={viewStore.characterVisibility}
                    selectedNode={viewStore.selectedNode}
                    selectedEdge={viewStore.selectedEdge}
                    chapterData={chapterData}
                    widthToShrink={chartShrink}
                    isCardOpen={viewStore.currentCard !== null}
                    doFitView={doFitView}
                    fitViewOperation={fitViewOperation}
                    onNodeClick={onNodeClick}
                    onEdgeClick={onEdgeClick}
                    onPaneClick={onPaneClick}
                    day={viewStore.day}
                    previousSelectedDay={viewStore.previousSelectedDay}
                    currentCard={viewStore.currentCard}
                    previousCard={previousCard}
                />
                <div
                    className="absolute top-0 left-0 w-screen h-screen -z-10"
                    style={{
                        // The optimized background looks bad so using original for now
                        backgroundImage: `url('${bgImage}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                />

                <ViewSettingCard
                    isCardOpen={viewStore.currentCard === "setting"}
                    onCardClose={() => onCurrentCardChange(null)}
                    dayData={dayData}
                    edgeVisibility={viewStore.edgeVisibility}
                    onEdgeVisibilityChange={viewStore.setEdgeVisibility}
                    teamVisibility={viewStore.teamVisibility}
                    onTeamVisibilityChange={viewStore.setTeamVisibility}
                    characterVisibility={viewStore.characterVisibility}
                    onCharacterVisibilityChange={
                        viewStore.setCharacterVisibility
                    }
                    chapterData={chapterData}
                    setChartShrink={setChartShrink}
                />

                <ViewNodeCard
                    isCardOpen={viewStore.currentCard === "node"}
                    selectedNode={viewStore.selectedNode}
                    onCardClose={() => onCurrentCardChange(null)}
                    onNodeLinkClicked={onNodeClick}
                    onEdgeLinkClicked={onEdgeClick}
                    nodeTeam={selectedNodeTeam}
                    chapter={viewStore.chapter}
                />

                <ViewEdgeCard
                    isCardOpen={viewStore.currentCard === "edge"}
                    selectedEdge={viewStore.selectedEdge}
                    onCardClose={() => onCurrentCardChange(null)}
                    onNodeLinkClicked={onNodeClick}
                    onEdgeLinkClicked={onEdgeClick}
                    edgeRelationship={selectedEdgeRelationship}
                    chapter={viewStore.chapter}
                />
            </div>

            <ViewInfoModal
                open={viewStore.infoModalOpen}
                onOpenChange={viewStore.setInfoModalOpen}
            />

            <ViewSettingsModal
                open={viewStore.settingsModalOpen}
                onOpenChange={viewStore.setSettingsModalOpen}
            />

            <ViewMiniGameModal
                open={viewStore.minigameModalOpen}
                onOpenChange={viewStore.setMinigameModalOpen}
            />

            <ViewVideoModal
                open={viewStore.videoModalOpen}
                onOpenChange={viewStore.setVideoModalOpen}
                videoUrl={viewStore.videoUrl}
            />

            <ViewAskVideoModal
                open={viewStore.askVideoModalOpen}
                onOpenChange={viewStore.setAskVideoModalOpen}
            />

            <div className="fixed top-0 right-0 m-2 z-10 flex flex-col gap-2">
                <IconButton
                    id="chart-info-btn"
                    className="h-10 w-10 p-0 bg-transparent outline-none border-0 transition-all cursor-pointer hover:opacity-80 hover:scale-110"
                    tooltipText="Chart Info / Visibility"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() =>
                        onCurrentCardChange(
                            viewStore.currentCard === "setting"
                                ? null
                                : "setting",
                        )
                    }
                >
                    <img
                        src="https://cdn.holoen.fans/hefw/media/emblem.webp"
                        className="w-full h-full"
                    />
                </IconButton>

                <IconButton
                    id="info-btn"
                    className="h-10 w-10 p-1"
                    tooltipText="Info"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => viewStore.setInfoModalOpen(true)}
                >
                    <Info />
                </IconButton>

                <IconButton
                    id="settings-btn"
                    className="h-10 w-10 p-1"
                    tooltipText="Settings"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => viewStore.setSettingsModalOpen(true)}
                >
                    <Settings />
                </IconButton>

                <IconButton
                    id="minigames-btn"
                    className="h-10 w-10 p-1"
                    tooltipText="Minigames"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => viewStore.setMinigameModalOpen(true)}
                >
                    <Dice6 />
                </IconButton>
            </div>

            <div
                className={clsx("fixed inset-x-0 bottom-0 mb-2 px-2 md:p-0 ", {
                    "w-[60%] lg:block hidden":
                        viewStore.currentCard === "setting",
                    "w-full md:w-4/5 2xl:w-2/5 mx-auto":
                        viewStore.currentCard !== "setting",
                })}
            >
                <ViewTransportControls
                    chapter={viewStore.chapter}
                    chapterData={siteData.chapters}
                    day={viewStore.day}
                    numberOfChapters={siteData.numberOfChapters}
                    numberOfDays={chapterData.numberOfDays}
                    currentCard={viewStore.currentCard}
                    onChapterChange={(newChapter) => {
                        setFitViewOperation("fit-to-all");
                        setDoFitView(!doFitView);
                        updateData(newChapter, viewStore.day);
                    }}
                    onDayChange={(newDay) => {
                        viewStore.setPreviousSelectedDay(viewStore.day);
                        if (settingsStore.openDayRecapOnDayChange) {
                            onCurrentCardChange("setting");
                        }
                        updateData(viewStore.chapter, newDay);
                    }}
                />
            </div>
        </>
    );
};

export default ViewApp;
