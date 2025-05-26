"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import ViewEdgeCard from "@/components/view/ViewEdgeCard";
import ViewInfoModal from "@/components/view/ViewInfoModal";
import ViewNodeCard from "@/components/view/ViewNodeCard";
import ViewSettingCard from "@/components/view/ViewSettingCard";
import {
    Chapter,
    ChartData,
    FitViewOperation,
    FixedEdgeType,
    ImageNodeType,
    SiteData,
} from "@enreco-archive/common/types";
import { CardType, useViewStore } from "@/store/viewStore";

import ViewMiniGameModal from "@/components/view/ViewMiniGameModal";
import ViewVideoModal from "@/components/view/ViewVideoModal";
import { useAudioSettingsSync, useAudioStore } from "@/store/audioStore";
import { useSettingStore } from "@/store/settingStore";
import { idFromChapterDayId, isMobileViewport } from "@/lib/utils";
import { Book, Dice6, Info, Settings } from "lucide-react";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { IconButton } from "@enreco-archive/common-ui/components/IconButton";
import ViewChart from "./components/view/ViewChart";
import ViewSettingsModal from "./components/view/ViewSettingsModal";
import ViewTransportControls from "./components/view/ViewTransportControls";
import { useBrowserHash } from "./hooks/useBrowserHash";
import { useDisabledDefaultMobilePinchZoom } from "./hooks/useDisabledDefaultMobilePinchZoom";
import { LS_HAS_VISITED } from "@/lib/constants";
import { useClickOutside } from "@/hooks/useClickOutsite";
import { DRAWER_OPEN_CLOSE_ANIM_TIME_MS } from "./components/view/VaulDrawer";
import ViewReadCounter from "@/components/view/ViewReadCounter";
import {
    generateRenderableEdges,
    generateRenderableNodes,
} from "./lib/generate-renderable-chart-elems";
import ViewChapterRecapModal from "@/components/view/ViewChapterRecapModal";
import { CurrentChartDataContext } from "@/contexts/CurrentChartData";

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

function getAllNodesOfIdFromChapter(
    id: string,
    chapterData: Chapter,
): ImageNodeType[] {
    const res: ImageNodeType[] = [];
    chapterData.charts.forEach((chart) => {
        const node = chart.nodes.find((node) => node.id === id);
        if (node) {
            res.push(node);
        }
    });
    return res;
}

function getAllEdgesOfIdFromChapter(
    id: string,
    chapterData: Chapter,
): FixedEdgeType[] {
    const res: FixedEdgeType[] = [];
    chapterData.charts.forEach((chart) => {
        const edge = chart.edges.find((node) => node.id === id);
        if (edge) {
            res.push(edge);
        }
    });
    return res;
}

// combine the charts of the current day with the previous days
// works like git, the result is the final chart of the current dayconst mergeChartsIntoCurrentDay
function mergeChartsIntoCurrentDay(
    charts: ChartData[],
    currentDay: number,
): ChartData {
    const result: ChartData = {
        nodes: [] as ImageNodeType[],
        edges: [] as FixedEdgeType[],
        title: charts[currentDay].title,
        dayRecap: charts[currentDay].dayRecap,
    };

    // Process each day up to the current day
    for (let day = 0; day <= currentDay; day++) {
        const chart = charts[day];
        if (!chart) continue;

        // For nodes, merge by id - newer versions replace older ones
        chart.nodes.forEach((node: ImageNodeType) => {
            const existingIndex = result.nodes.findIndex(
                (n) => n.id === node.id,
            );

            if (existingIndex !== -1) {
                // Update existing node
                result.nodes[existingIndex] = node;
            } else {
                // Add new node
                result.nodes.push(node);
            }
        });

        // For edges, merge by id - newer versions replace older ones
        chart.edges.forEach((edge: FixedEdgeType) => {
            const existingIndex = result.edges.findIndex(
                (e) => e.id === edge.id,
            );
            if (existingIndex !== -1) {
                // Update existing edge
                if (edge.data) {
                    edge.data.isNewlyAdded = false;
                }
                result.edges[existingIndex] = edge;
            } else {
                // Add new edge
                if (edge.data) {
                    edge.data.isNewlyAdded = true;
                }
                result.edges.push(edge);
            }
        });
    }

    return result;
}

interface Props {
    useDarkMode: boolean;
    siteData: SiteData;
    isInLoadingScreen: boolean;
}

let didInit = false;
const ViewApp = ({ siteData, useDarkMode, isInLoadingScreen }: Props) => {
    useAudioSettingsSync();
    useClickOutside();
    /* State variables */
    const viewStore = useViewStore();
    const settingsStore = useSettingStore();
    const audioStore = useAudioStore();

    const [chartShrink, setChartShrink] = useState(0);
    const [fitViewOperation, setFitViewOperation] =
        useState<FitViewOperation>("none");
    const [doFitView, setDoFitView] = useState(true);
    const { browserHash, setBrowserHash } = useBrowserHash(onBrowserHashChange);
    const [previousCard, setPreviousCard] = useState<CardType | null>(null);

    const [firstVisit, setFirstVisit] = useState(false);

    // For disabling default pinch zoom on mobiles, as it conflict with the chart's zoom
    // Also when pinch zoom when one of the cards are open, upon closing the zoom will stay that way permanently
    useDisabledDefaultMobilePinchZoom();

    // For handling first visit, show the info modal
    // Also play the bgm here
    useEffect(() => {
        if (isInLoadingScreen) {
            return;
        }
        const hasVisited = localStorage.getItem(LS_HAS_VISITED);
        if (!hasVisited) {
            viewStore.setOpenModal("info");
            setFirstVisit(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewStore.setOpenModal, setFirstVisit, isInLoadingScreen]);

    /* Data variables */
    const chapterData = siteData.chapters[viewStore.chapter];
    const dayData = useMemo(
        () => mergeChartsIntoCurrentDay(chapterData.charts, viewStore.day),
        [chapterData.charts, viewStore.day],
    );

    const processedNodes = useMemo(() => {
        const selectedNodes = [
            viewStore.selectedNode?.id,
            viewStore.selectedEdge?.source,
            viewStore.selectedEdge?.target,
        ].filter((s) => s !== undefined && s !== null);

        return generateRenderableNodes(
            dayData,
            viewStore.chapter,
            viewStore.day,
            viewStore.teamVisibility,
            viewStore.characterVisibility,
            selectedNodes
        );
    }, [
        viewStore.selectedNode?.id,
        viewStore.selectedEdge?.source,
        viewStore.selectedEdge?.target,
        viewStore.chapter,
        viewStore.day,
        viewStore.teamVisibility,
        viewStore.characterVisibility,
        dayData,
    ]);

    const processedEdges = useMemo(() => {
        return generateRenderableEdges(
            chapterData,
            dayData,
            viewStore.chapter,
            viewStore.day,
            viewStore.teamVisibility,
            viewStore.characterVisibility,
            viewStore.edgeVisibility,
            processedNodes,
            viewStore.selectedEdge,
        );
    }, [
        chapterData,
        viewStore.chapter,
        viewStore.day,
        viewStore.teamVisibility,
        viewStore.characterVisibility,
        viewStore.edgeVisibility,
        viewStore.selectedEdge,
        processedNodes,
        dayData,
    ]);

    // Update processed edges' read status
    processedEdges.forEach((edge) => {
        if (edge.data && typeof window !== "undefined") {
            const status = localStorage.getItem(
                idFromChapterDayId(viewStore.chapter, viewStore.day, edge.id),
            );
            edge.data.isRead = status === "read";
        }
    });

    // Memoize the entire dayData with processed nodes and edges
    const memoizedDayData = useMemo(() => {
        return {
            ...dayData,
            nodes: processedNodes,
            edges: processedEdges,
        };
    }, [dayData, processedNodes, processedEdges]);

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
        const newDayData = mergeChartsIntoCurrentDay(
            newChapterData.charts,
            newDay,
        );

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
        audioStore.changeBGM(newChapterData.bgmSrc);
        viewStore.setEdgeVisibility(edgeVisibilityLoaded);
        viewStore.setTeamVisibility(teamVisibilityLoaded);
        viewStore.setCharacterVisibility(characterVisibilityLoaded);
        viewStore.setChapter(newChapter);
        viewStore.setDay(newDay);
        setBrowserHash(`${newChapter}/${newDay}`);

        if (viewStore.selectedNode) {
            viewStore.setSelectedNode(
                newDayData.nodes.find(
                    (node) => node.id === viewStore.selectedNode!.id,
                )!,
            );
        }

        if (viewStore.selectedEdge) {
            viewStore.setSelectedEdge(
                newDayData.edges.find(
                    (edge) => edge.id === viewStore.selectedEdge!.id,
                )!,
            );
        }
    }

    /* Event handler functions */
    function onBrowserHashChange(hash: string) {
        const parsedValues = parseChapterAndDayFromBrowserHash(hash);

        // Verify values, if invalid, reset to 0/0
        if (parsedValues) {
            const [chapter, day] = parsedValues;
            if (
                chapter < 0 ||
                chapter >= siteData.numberOfChapters ||
                day < 0 ||
                day >= siteData.chapters[viewStore.chapter].numberOfDays
            ) {
                setBrowserHash(`${siteData.numberOfChapters - 1}/0`);
                updateData(siteData.numberOfChapters - 1, 0);
                return;
            }
            updateData(chapter, day);
        } else {
            setBrowserHash(`${siteData.numberOfChapters - 1}/0`);
            updateData(siteData.numberOfChapters - 1, 0);
        }
    }

    // Update react flow renderer width when setting card is open, so the flow is not covered by the card
    const onCurrentCardChange = useCallback(
        (newCurrentCard: CardType) => {
            // Only reset the chart shrink when all cards are closed
            if (newCurrentCard === null) {
                viewStore.setSelectedNode(null);
                viewStore.setSelectedEdge(null);
                setChartShrink(0);
            }
            if (newCurrentCard === "setting" || newCurrentCard === null) {
                viewStore.setSelectedNode(null);
                viewStore.setSelectedEdge(null);
                setFitViewOperation("fit-to-all");
            } else if (newCurrentCard === "node") {
                viewStore.setSelectedEdge(null);
                setFitViewOperation("fit-to-node");
            } else if (newCurrentCard === "edge") {
                viewStore.setSelectedNode(null);
                setFitViewOperation("fit-to-edge");
            }
            setPreviousCard(viewStore.currentCard);
            viewStore.setCurrentCard(newCurrentCard);

            // Skip fitting the view if we are opening a new card; we will re-fit when setChartShrinkAndFit
            // is called.
            if (
                viewStore.currentCard !== null ||
                newCurrentCard === null ||
                isMobileViewport()
            ) {
                setDoFitView(!doFitView);
            }
        },
        [doFitView, viewStore],
    );

    const onCardClose = useCallback(
        function () {
            onCurrentCardChange(null);
        },
        [onCurrentCardChange],
    );

    // Then when the user closes the modal, open the day recap card
    // Only doing this for first visit
    useEffect(() => {
        if (firstVisit && !viewStore.isInfoModalOpen()) {
            viewStore.setOpenModal(null);
            onCurrentCardChange("setting");
            setFirstVisit(false);
            localStorage.setItem(LS_HAS_VISITED, "true");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewStore.setOpenModal, firstVisit, onCurrentCardChange]);

    const onNodeClick = useCallback(
        function (node: ImageNodeType) {
            onCurrentCardChange("node");
            viewStore.setSelectedNode(node);
            viewStore.setSelectedEdge(null);
        },
        [onCurrentCardChange, viewStore],
    );

    const onEdgeClick = useCallback(
        function (edge: FixedEdgeType) {
            onCurrentCardChange("edge");
            viewStore.setSelectedEdge(edge);
            viewStore.setSelectedNode(null);
        },
        [onCurrentCardChange, viewStore],
    );

    const onPaneClick = useCallback(
        function () {
            onCurrentCardChange(null);
            viewStore.setSelectedNode(null);
            viewStore.setSelectedEdge(null);
        },
        [onCurrentCardChange, viewStore],
    );

    const setChartShrinkAndFit = useCallback(
        function (width: number) {
            if (width !== chartShrink) {
                setTimeout(() => {
                    setChartShrink(width);
                    setDoFitView(!doFitView);
                }, DRAWER_OPEN_CLOSE_ANIM_TIME_MS * 0.6);
            }
        },
        [chartShrink, doFitView],
    );

    /* Init block, runs only on first render/load. */
    if (!didInit) {
        didInit = true;
        onBrowserHashChange(browserHash);
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

    let bgImage = chapterData.bgiSrc;
    if (useDarkMode) {
        bgImage = chapterData.bgiSrc.replace(".webp", "-dark.webp");
    }

    return (
        <>
            <div className="w-screen h-dvh top-0 inset-x-0 overflow-hidden">
                <CurrentChartDataContext
                    value={{
                        nodes: memoizedDayData.nodes,
                        edges: memoizedDayData.edges,
                        teams: chapterData.teams,
                        relationships: chapterData.relationships
                    }}
                >
                    <ViewChart
                        nodes={memoizedDayData.nodes}
                        edges={memoizedDayData.edges}
                        edgeVisibility={viewStore.edgeVisibility}
                        selectedNode={viewStore.selectedNode}
                        selectedEdge={viewStore.selectedEdge}
                        widthToShrink={chartShrink}
                        isCardOpen={viewStore.currentCard !== null}
                        doFitView={doFitView}
                        fitViewOperation={fitViewOperation}
                        onNodeClick={onNodeClick}
                        onEdgeClick={onEdgeClick}
                        onPaneClick={onPaneClick}
                        day={viewStore.day}
                        currentCard={viewStore.currentCard}
                        previousCard={previousCard}
                    />
                    <div
                        className={cn(
                            "absolute top-0 left-0 w-screen h-full -z-10",
                            {
                                "brightness-90 dark:brightness-70":
                                    viewStore.currentCard !== null,
                                "brightness-100": viewStore.currentCard === null,
                            },
                        )}
                        style={{
                            backgroundImage: `url('${bgImage}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            transition: "brightness 0.5s, background-image 0.3s",
                        }}
                    />

                    <ViewSettingCard
                        isCardOpen={viewStore.currentCard === "setting"}
                        onCardClose={onCardClose}
                        dayData={memoizedDayData}
                        edgeVisibility={viewStore.edgeVisibility}
                        onEdgeVisibilityChange={viewStore.setEdgeVisibility}
                        teamVisibility={viewStore.teamVisibility}
                        onTeamVisibilityChange={viewStore.setTeamVisibility}
                        characterVisibility={viewStore.characterVisibility}
                        onCharacterVisibilityChange={
                            viewStore.setCharacterVisibility
                        }
                        chapter={viewStore.chapter}
                        chapterData={chapterData}
                        setChartShrink={setChartShrinkAndFit}
                        day={viewStore.day}
                        onDayChange={(newDay) => {
                            updateData(viewStore.chapter, newDay);
                        }}
                    />

                    <ViewNodeCard
                        isCardOpen={viewStore.currentCard === "node"}
                        selectedNode={viewStore.selectedNode}
                        onCardClose={onCardClose}
                        onNodeLinkClicked={onNodeClick}
                        onEdgeLinkClicked={onEdgeClick}
                        nodeTeam={selectedNodeTeam}
                        chapter={viewStore.chapter}
                        setChartShrink={setChartShrinkAndFit}
                        onDayChange={(newDay) => {
                            updateData(viewStore.chapter, newDay);
                        }}
                        availiableNodes={
                            viewStore.selectedNode
                                ? getAllNodesOfIdFromChapter(
                                      viewStore.selectedNode.id,
                                      chapterData,
                                  )
                                : []
                        }
                    />

                    <ViewEdgeCard
                        isCardOpen={viewStore.currentCard === "edge"}
                        selectedEdge={viewStore.selectedEdge}
                        onCardClose={onCardClose}
                        onNodeLinkClicked={onNodeClick}
                        onEdgeLinkClicked={onEdgeClick}
                        edgeRelationship={selectedEdgeRelationship}
                        chapter={viewStore.chapter}
                        setChartShrink={setChartShrinkAndFit}
                        availiableEdges={
                            viewStore.selectedEdge
                                ? getAllEdgesOfIdFromChapter(
                                      viewStore.selectedEdge.id,
                                      chapterData,
                                  )
                                : []
                        }
                        onDayChange={(newDay) => {
                            updateData(viewStore.chapter, newDay);
                        }}
                    />
                </CurrentChartDataContext>
            </div>

            <ViewInfoModal
                open={viewStore.isInfoModalOpen()}
                onOpenChange={(open) => viewStore.setOpenModal(open ? "info" : null)}
            />

            <ViewSettingsModal
                open={viewStore.isSettingsModalOpen()}
                onOpenChange={(open) => viewStore.setOpenModal(open ? "settings" : null)}
            />

            <ViewMiniGameModal
                open={viewStore.isMinigameModalOpen()}
                onOpenChange={(open) => viewStore.setOpenModal(open ? "minigame" : null)}
            />

            <ViewVideoModal
                open={viewStore.isVideoModalOpen()}
                onOpenChange={(open) => viewStore.setOpenModal(open ? "video" : null)}
                videoUrl={viewStore.videoUrl}
                bgImage={bgImage}
            />

            <ViewChapterRecapModal
                key={`chapter-recap-modal-${viewStore.chapter}`}
                open={viewStore.isChapterRecapModalOpen()}
                onOpenChange={(open) => viewStore.setOpenModal(open ? "chapterRecap" : null)}
                currentChapter={viewStore.chapter}
            />
            <ViewReadCounter
                day={viewStore.day}
                chapter={viewStore.chapter}
                chartData={memoizedDayData}
                hidden={viewStore.currentCard !== null}
                onEdgeClick={onEdgeClick}
                onNodeClick={onNodeClick}
            />

            <div className="fixed top-0 right-0 m-2 z-10 flex flex-col gap-2">
                <IconButton
                    id="chart-info-btn"
                    className="h-10 w-10 p-0 bg-transparent outline-hidden border-0 transition-all cursor-pointer hover:opacity-80 hover:scale-110"
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
                        src="images-opt/emblem.webp"
                        className="w-full h-full"
                    />
                </IconButton>

                <IconButton
                    id="info-btn"
                    className="h-10 w-10 p-1"
                    tooltipText="Info"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => viewStore.setOpenModal("info")}
                >
                    <Info />
                </IconButton>

                <IconButton
                    id="settings-btn"
                    className="h-10 w-10 p-1"
                    tooltipText="Settings"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => viewStore.setOpenModal("settings")}
                >
                    <Settings />
                </IconButton>

                <IconButton
                    id="minigames-btn"
                    className="h-10 w-10 p-1"
                    tooltipText="Minigames"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => viewStore.setOpenModal("minigame")}
                >
                    <Dice6 />
                </IconButton>

                <IconButton
                    id="chapter-recap-btn"
                    className="h-10 w-10 p-1"
                    tooltipText="Chatper Recap"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => viewStore.setOpenModal("chapterRecap")}
                >
                    <Book />
                </IconButton>
            </div>

            <div
                className={cn(
                    "z-50 fixed inset-x-0 bottom-0 mb-2 px-2 md:p-0 ",
                    {
                        "w-[60%] lg:block hidden":
                            viewStore.currentCard === "setting",
                        "w-full md:w-4/5 2xl:w-2/5 mx-auto":
                            viewStore.currentCard !== "setting",
                    },
                )}
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
                        updateData(newChapter, 0);
                    }}
                    onDayChange={(newDay) => {
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

export default memo(ViewApp);
