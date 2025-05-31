"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import ViewEdgeCard from "@/components/view/ViewEdgeCard";
import ViewInfoModal from "@/components/view/ViewInfoModal";
import ViewNodeCard from "@/components/view/ViewNodeCard";
import ViewSettingCard from "@/components/view/ViewSettingCard";
import {
    FixedEdgeType,
    ImageNodeType,
    SiteData,
} from "@enreco-archive/common/types";
import { useViewStore } from "@/store/viewStore";

import ViewMiniGameModal from "@/components/view/ViewMiniGameModal";
import ViewVideoModal from "@/components/view/ViewVideoModal";
import { useAudioSettingsSync, useAudioStore } from "@/store/audioStore";
import { useSettingStore } from "@/store/settingStore";
import { Book, Dice6, Info, Settings } from "lucide-react";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { IconButton } from "@enreco-archive/common-ui/components/IconButton";
import ViewChart from "./components/view/ViewChart";
import ViewSettingsModal from "./components/view/ViewSettingsModal";
import ViewTransportControls from "./components/view/ViewTransportControls";
import { useBrowserHash } from "./hooks/useBrowserHash";
import { useDisabledDefaultMobilePinchZoom } from "./hooks/useDisabledDefaultMobilePinchZoom";
import { useClickOutside } from "@/hooks/useClickOutsite";
import { DRAWER_OPEN_CLOSE_ANIM_TIME_MS } from "./components/view/VaulDrawer";
import ViewReadCounter from "@/components/view/ViewReadCounter";

import ViewChapterRecapModal from "@/components/view/ViewChapterRecapModal";
import { CurrentChapterDataContext, CurrentDayDataContext } from "@/contexts/CurrentChartData";
import { resolveDataForDay } from "@/lib/chart-utils";
import { usePersistedViewStore } from "./store/persistedViewStore";
import { produce } from "immer";
import { useShallow } from "zustand/react/shallow";

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
    isInLoadingScreen: boolean;
}

let didInit = false;
const ViewApp = ({ siteData, useDarkMode, isInLoadingScreen }: Props) => {
    useAudioSettingsSync();
    useClickOutside();
    /* State variables */
    const settingsStore = useSettingStore();
    const audioStore = useAudioStore();

    const viewStoreData = useViewStore(useShallow(state => state.data));
    const viewStoreUi = useViewStore(useShallow(state => state.ui));
    const viewStoreVisibility = useViewStore(useShallow(state => state.visibility));
    const viewStoreModal = useViewStore(useShallow(state => state.modal));

    const [
        countReadElements,
        getReadStatus, 
        setReadStatus
    ] = usePersistedViewStore(useShallow(state => [state.countReadElements, state.getReadStatus, state.setReadStatus]));
    const [hasVisitedBefore, setHasVisitedBefore] = usePersistedViewStore(useShallow(state => [state.hasVisitedBefore, state.setHasVisitedBefore]));

    const [chartShrink, setChartShrink] = useState(0);
    const { browserHash, setBrowserHash } = useBrowserHash(onBrowserHashChange);

    // For disabling default pinch zoom on mobiles, as it conflict with the chart's zoom
    // Also when pinch zoom when one of the cards are open, upon closing the zoom will stay that way permanently
    useDisabledDefaultMobilePinchZoom();

    /* Data variables */
    const chapterData = siteData.chapters[viewStoreData.chapter];
    const dayData = chapterData.charts[viewStoreData.day];

    const resolvedData = useMemo(() => {
        console.log("building initial nodes/edges");
        return resolveDataForDay(chapterData.charts, viewStoreData.day);
    }, [chapterData.charts, viewStoreData.day]);

    const completeNodes = useMemo(() => {
        return produce(resolvedData.nodes,
            draft => {
                for(const node of draft) {
                    node.hidden = !(
                        viewStoreVisibility.team[node.data.teamId || "null"] &&
                        viewStoreVisibility.character[node.id]
                    );

                    if(viewStoreUi.selectedElementIsNode()) {
                        node.selected = node.id === viewStoreUi.selectedElementAsNode()!.id;
                    }
                    else if(viewStoreUi.selectedElementIsEdge()) {
                        node.selected = (
                            node.id === viewStoreUi.selectedElementAsEdge()!.target ||
                            node.id === viewStoreUi.selectedElementAsEdge()!.source
                        );
                    }
                    
                    node.data.isRead = getReadStatus(viewStoreData.chapter, viewStoreData.day, node.id);
                }
            }
        );
    }, [
        getReadStatus, 
        resolvedData.nodes, 
        viewStoreData.chapter, 
        viewStoreData.day, 
        viewStoreUi, 
        viewStoreVisibility.character, 
        viewStoreVisibility.team
    ]);

    const completeEdges = useMemo(() => {
        return produce(resolvedData.edges,
            draft => {
                for(const edge of draft) {
                    const sourceNode = resolvedData.nodes.find(n => n.id === edge.source);
                    const targetNode = resolvedData.nodes.find(n => n.id === edge.target);

                    const edgesNodesAreVisible = (
                        (sourceNode !== undefined) && 
                        (targetNode !== undefined) && 
                        (viewStoreVisibility.character[sourceNode.id] ?? false) &&
                        (viewStoreVisibility.character[targetNode.id] ?? false) &&
                        (viewStoreVisibility.team[sourceNode.data.teamId] ?? false) && 
                        (viewStoreVisibility.team[targetNode.data.teamId] ?? false)
                    );

                    edge.hidden = edgesNodesAreVisible && 
                        edge.data !== undefined &&
                        viewStoreVisibility.edge[edge.data.relationshipId];

                    edge.selected = edge.id === viewStoreUi.selectedElementAsEdge()?.id;
                    edge.selectable = (
                        viewStoreVisibility.showOnlyNewEdges && 
                        edge.data !== undefined &&
                        edge.data.day === viewStoreData.day
                    ) || (!viewStoreVisibility.showOnlyNewEdges);

                    if(edge.data) {
                        edge.data.isRead = getReadStatus(viewStoreData.chapter, viewStoreData.day, edge.id);
                    }
                }
            }
        );
    }, [
        getReadStatus, 
        resolvedData.edges, 
        resolvedData.nodes, 
        viewStoreData.chapter, 
        viewStoreData.day, 
        viewStoreUi, 
        viewStoreVisibility.character, 
        viewStoreVisibility.edge, 
        viewStoreVisibility.showOnlyNewEdges, 
        viewStoreVisibility.team]
    );

    /* Helper function to coordinate state updates when data changes. */
    function changeWorkingData(newChapter: number, newDay: number) {
        if (
            newChapter < 0 ||
            newChapter > siteData.numberOfChapters ||
            newDay < 0 ||
            newDay > siteData.chapters[viewStoreData.chapter].numberOfDays
        ) {
            return;
        }

        const newChapterData = siteData.chapters[newChapter];
        const newDayData = resolveDataForDay(
            newChapterData.charts,
            newDay,
        );

        if (viewStoreUi.selectedElementIsNode()) {
            const newSelectedNode = newDayData.nodes.find(
                n => n.id === viewStoreUi.selectedElementAsNode()!.id);
            
            if(newSelectedNode) {
                newSelectedNode.selected = true;
            }
            else {
                viewStoreUi.deselectElement();
            }
        }

        if (viewStoreUi.selectedElementIsEdge()) {
            const newSelectedEdge = newDayData.edges.find(
                e => e.id === viewStoreUi.selectedElementAsEdge()!.id);
            
            if(newSelectedEdge) {
                newSelectedEdge.selected = true;
                const sourceNode = dayData.nodes.find(n => n.id === newSelectedEdge.source);
                if(sourceNode) {
                    sourceNode.selected = true;
                }

                const targetNode = dayData.nodes.find(n => n.id === newSelectedEdge.target);
                if(targetNode) {
                    targetNode.selected = true;
                }
            }
            else {
                viewStoreUi.deselectElement();
            }
        }

        // Reset edge/team/character visibility on data change.
        viewStoreVisibility.setEdgeKeys(newDayData.edges);
        viewStoreVisibility.setTeamKeys(newChapterData.teams);
        viewStoreVisibility.setCharacterKeys(newDayData.nodes);

        audioStore.changeBGM(newChapterData.bgmSrc);
        viewStoreData.setChapter(newChapter);
        viewStoreData.setDay(newDay);
        setBrowserHash(`${newChapter}/${newDay}`);
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
                day >= siteData.chapters[viewStoreData.chapter].numberOfDays
            ) {
                setBrowserHash(`${siteData.numberOfChapters - 1}/0`);
                changeWorkingData(siteData.numberOfChapters - 1, 0);
                return;
            }
            changeWorkingData(chapter, day);
        } else {
            setBrowserHash(`${siteData.numberOfChapters - 1}/0`);
            changeWorkingData(siteData.numberOfChapters - 1, 0);
        }
    }

    const onCardClose = useCallback(() => {
        viewStoreUi.deselectElement();
        viewStoreUi.closeCard();
        setChartShrink(0);
    },
        [viewStoreUi],
    );

    function onSettingsCardOpen() {
        viewStoreUi.deselectElement();
        viewStoreUi.openSettingsCard();
    }

    const onNodeClick = useCallback((node: ImageNodeType) => {
            viewStoreUi.selectElement(node);
            viewStoreUi.openNodeCard();
        },
        [viewStoreUi],
    );

    const onEdgeClick = useCallback((edge: FixedEdgeType) => {
            viewStoreUi.selectElement(edge);
            viewStoreUi.openEdgeCard();
        },
        [viewStoreUi],
    );

    const setChartShrinkAndFit = useCallback((width: number) => {
            if (width !== chartShrink) {
                setTimeout(() => {
                    setChartShrink(width);
                }, DRAWER_OPEN_CLOSE_ANIM_TIME_MS * 0.6);
            }
        },
        [chartShrink],
    );

    const currentChapterContextValue = useMemo(() => ({
        teams: chapterData.teams,
        relationships: chapterData.relationships
    }), [chapterData.relationships, chapterData.teams]);

    const currentDayContextValue = useMemo(() => ({
        nodes: resolvedData.nodes,
        edges: resolvedData.edges
    }), [resolvedData.edges, resolvedData.nodes]);

    useEffect(() => {
        if(!hasVisitedBefore && !isInLoadingScreen) {
            viewStoreModal.openInfoModal();
        }
    })

    /* Init block, runs only on first render/load. */
    if (!didInit) {
        didInit = true;
        onBrowserHashChange(browserHash);    
    }

    const selectedNodeTeamKey = viewStoreUi.selectedElementAsNode()?.data.teamId;
    const selectedNodeTeam = selectedNodeTeamKey ? chapterData.teams[selectedNodeTeamKey] : null;

    const selectedEdgeRelationshipKey = viewStoreUi.selectedElementAsEdge()?.data?.relationshipId;
    const selectedEdgeRelationship = selectedEdgeRelationshipKey ? chapterData.relationships[selectedEdgeRelationshipKey] : null;

    const selectedNodeRead = viewStoreUi.selectedElementIsNode() ? 
        getReadStatus(viewStoreData.chapter, viewStoreData.day, viewStoreUi.selectedElementAsNode()!.id) : false;
    const selectedEdgeRead = viewStoreUi.selectedElementIsEdge() ? 
        getReadStatus(viewStoreData.chapter, viewStoreData.day, viewStoreUi.selectedElementAsEdge()!.id) : false;
    function onReadChange(newReadStatus: boolean) {
        if(viewStoreUi.selectedElement == null) {
            return;
        }

        setReadStatus(viewStoreData.chapter, viewStoreData.day, viewStoreUi.selectedElement.id, newReadStatus);
    }

    let bgImage = chapterData.bgiSrc;
    if (useDarkMode) {
        bgImage = chapterData.bgiSrc.replace(".webp", "-dark.webp");
    }

    return (
        <>
            <div className="w-screen h-dvh top-0 inset-x-0 overflow-hidden">
                <CurrentChapterDataContext value={currentChapterContextValue}>
                    <ViewChart
                        nodes={completeNodes}
                        edges={completeEdges}
                        selectedElement={viewStoreUi.selectedElement}
                        widthToShrink={chartShrink}
                        currentCard={viewStoreUi.currentCard}
                        onNodeClick={onNodeClick}
                        onEdgeClick={onEdgeClick}
                        onPaneClick={onCardClose}
                    />
                    <div
                        className={cn(
                            "absolute top-0 left-0 w-screen h-full -z-10",
                            {
                                "brightness-90 dark:brightness-70":
                                    viewStoreUi.currentCard !== null,
                                "brightness-100": viewStoreUi.currentCard === null,
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
                </CurrentChapterDataContext>

                <CurrentDayDataContext value={currentDayContextValue}>
                    <ViewSettingCard
                        isCardOpen={viewStoreUi.currentCard === "setting"}
                        onCardClose={onCardClose}
                        dayRecap={dayData.dayRecap}
                        nodes={completeNodes}
                        edgeVisibility={viewStoreVisibility.edge}
                        toggleEdgeVisible={viewStoreVisibility.toggleEdge}
                        toggleAllEdgesVisible={viewStoreVisibility.toggleAllEdges}
                        showOnlyNewEdges={viewStoreVisibility.showOnlyNewEdges}
                        setShowOnlyNewEdges={viewStoreVisibility.setShowOnlyNewEdges}
                        teamVisibility={viewStoreVisibility.team}
                        toggleTeamVisible={viewStoreVisibility.toggleTeam}
                        toggleAllTeamsVisible={viewStoreVisibility.toggleAllTeams}
                        characterVisibility={viewStoreVisibility.character}
                        toggleCharacterVisible={viewStoreVisibility.toggleCharacter}
                        toggleAllCharactersVisible={viewStoreVisibility.toggleAllCharacters}
                        chapter={viewStoreData.chapter}
                        chapterData={chapterData}
                        setChartShrink={setChartShrinkAndFit}
                        day={viewStoreData.day}
                        onDayChange={(newDay) => {
                            changeWorkingData(viewStoreData.chapter, newDay);
                        }}
                    />

                    <ViewNodeCard
                        isCardOpen={viewStoreUi.currentCard === "node"}
                        selectedNode={viewStoreUi.selectedElementAsNode()}
                        nodeTeam={selectedNodeTeam}
                        charts={chapterData.charts}
                        read={selectedNodeRead}
                        onCardClose={onCardClose}
                        onNodeLinkClicked={onNodeClick}
                        onEdgeLinkClicked={onEdgeClick}
                        onDayChange={(newDay) => {
                            changeWorkingData(viewStoreData.chapter, newDay);
                        }}
                        onReadChange={onReadChange}
                        setChartShrink={setChartShrinkAndFit}
                    />

                    <ViewEdgeCard
                        isCardOpen={viewStoreUi.currentCard === "edge"}
                        selectedEdge={viewStoreUi.selectedElementAsEdge()}
                        edgeRelationship={selectedEdgeRelationship}
                        charts={chapterData.charts}
                        read={selectedEdgeRead}
                        onCardClose={onCardClose}
                        onNodeLinkClicked={onNodeClick}
                        onEdgeLinkClicked={onEdgeClick}
                        onDayChange={(newDay) => {
                            changeWorkingData(viewStoreData.chapter, newDay);
                        }}
                        onReadChange={onReadChange}
                        setChartShrink={setChartShrinkAndFit}
                    />
                </CurrentDayDataContext>
            </div>

            <ViewInfoModal
                open={viewStoreModal.isInfoModalOpen()}
                onClose={() => {
                    if(!hasVisitedBefore) {
                        setHasVisitedBefore(true);
                        viewStoreModal.closeModal();
                        onSettingsCardOpen();
                    }
                    else {
                        viewStoreModal.closeModal();
                    }
                }}
            />

            <ViewSettingsModal
                open={viewStoreModal.isSettingsModalOpen()}
                onClose={viewStoreModal.closeModal}
            />

            <ViewMiniGameModal
                open={viewStoreModal.isMinigameModalOpen()}
                onClose={viewStoreModal.closeModal}
            />

            <ViewVideoModal
                open={viewStoreModal.isVideoModalOpen()}
                onClose={viewStoreModal.closeModal}
                videoUrl={viewStoreModal.videoUrl}
                bgImage={bgImage}
            />

            <ViewChapterRecapModal
                key={`chapter-recap-modal-${viewStoreData.chapter}`}
                open={viewStoreModal.isChapterRecapModalOpen()}
                onClose={viewStoreModal.closeModal}
                currentChapter={viewStoreData.chapter}
            />

            <ViewReadCounter
                day={viewStoreData.day}
                chapter={viewStoreData.chapter}
                nodes={dayData.nodes}
                edges={dayData.edges}
                readCount={countReadElements(viewStoreData.chapter, viewStoreData.day)}
                getReadStatus={getReadStatus}
                hidden={viewStoreUi.currentCard !== null}
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
                    onClick={() => {
                        if(viewStoreUi.currentCard === "setting") {
                            onCardClose();
                        }
                        else {
                            onSettingsCardOpen();
                        }
                    }}
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
                    onClick={viewStoreModal.openInfoModal}
                >
                    <Info />
                </IconButton>

                <IconButton
                    id="settings-btn"
                    className="h-10 w-10 p-1"
                    tooltipText="Settings"
                    enabled={true}
                    tooltipSide="left"
                    onClick={viewStoreModal.openSettingsModal}
                >
                    <Settings />
                </IconButton>

                <IconButton
                    id="minigames-btn"
                    className="h-10 w-10 p-1"
                    tooltipText="Minigames"
                    enabled={true}
                    tooltipSide="left"
                    onClick={viewStoreModal.openMinigameModal}
                >
                    <Dice6 />
                </IconButton>

                <IconButton
                    id="chapter-recap-btn"
                    className="h-10 w-10 p-1"
                    tooltipText="Chatper Recap"
                    enabled={true}
                    tooltipSide="left"
                    onClick={viewStoreModal.openChapterRecapModal}
                >
                    <Book />
                </IconButton>
            </div>

            <div
                className={cn(
                    "z-50 fixed inset-x-0 bottom-0 mb-2 px-2 md:p-0 ",
                    {
                        "w-[60%] lg:block hidden":
                            viewStoreUi.currentCard === "setting",
                        "w-full md:w-4/5 2xl:w-2/5 mx-auto":
                            viewStoreUi.currentCard !== "setting",
                    },
                )}
            >
                <ViewTransportControls
                    chapter={viewStoreData.chapter}
                    chapterData={siteData.chapters}
                    day={viewStoreData.day}
                    numberOfChapters={siteData.numberOfChapters}
                    numberOfDays={chapterData.numberOfDays}
                    currentCard={viewStoreUi.currentCard}
                    onChapterChange={(newChapter) => {
                        viewStoreUi.deselectElement();
                        viewStoreUi.closeCard();
                        changeWorkingData(newChapter, 0);
                    }}
                    onDayChange={(newDay) => {
                        if (settingsStore.openDayRecapOnDayChange) {
                            onSettingsCardOpen();
                        }
                        changeWorkingData(viewStoreData.chapter, newDay);
                    }}
                />
            </div>
        </>
    );
};

export default memo(ViewApp);
