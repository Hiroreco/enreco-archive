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
import ViewChart from "@/components/view/ViewChart";
import ViewSettingsModal from "@/components/view/ViewSettingsModal";
import ViewTransportControls from "@/components/view/ViewTransportControls";
import { useBrowserHash } from "@/hooks/useBrowserHash";
import { useDisabledDefaultMobilePinchZoom } from "@/hooks/useDisabledDefaultMobilePinchZoom";
import { useClickOutside } from "@/hooks/useClickOutsite";
import { DRAWER_OPEN_CLOSE_ANIM_TIME_MS } from "./components/view/VaulDrawer";
import ViewReadCounter from "@/components/view/ViewReadCounter";

import ViewChapterRecapModal from "@/components/view/ViewChapterRecapModal";
import { CurrentChapterDataContext, CurrentDayDataContext } from "@/contexts/CurrentChartData";
import { resolveDataForDay } from "@/lib/chart-utils";
import { usePersistedViewStore } from "@/store/persistedViewStore";
import { produce } from "immer";
import { useShallow } from "zustand/react/shallow";
import { isEdge, isNode } from "@/lib/utils";

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
    /* Hooks that are not use*Store/useState/useMemo/useCallback */
    useAudioSettingsSync();
    useClickOutside();
    
    // For disabling default pinch zoom on mobiles, as it conflict with the chart's zoom
    // Also when pinch zoom when one of the cards are open, upon closing the zoom will stay that way permanently
    useDisabledDefaultMobilePinchZoom();

    /* Zustand store variables */
    // Settings Store
    const openDayRecapOnDayChange = useSettingStore(state => state.openDayRecapOnDayChange);
    
    // Audio Store
    const changeBGM = useAudioStore(state => state.changeBGM);

    // Main App Store
    const [ chapter, day, setChapter, setDay] = useViewStore(useShallow(state => [
        state.data.chapter, state.data.day, state.data.setChapter,state.data.setDay 
    ]));
    
    const [
        currentCard,
        openNodeCard,
        openEdgeCard,
        openSettingsCard,
        closeCard,
        isNodeCardOpen,
        isEdgeCardOpen,
        isSettingsCardOpen,
        isAnyCardOpen,
        selectedElement,
        selectElement,
        deselectElement,
    ] = useViewStore(useShallow(state => [
        state.ui.currentCard,
        state.ui.openNodeCard,
        state.ui.openEdgeCard,
        state.ui.openSettingsCard,
        state.ui.closeCard,
        state.ui.isNodeCardOpen,
        state.ui.isEdgeCardOpen,
        state.ui.isSettingsCardOpen,
        state.ui.isAnyCardOpen,
        state.ui.selectedElement, 
        state.ui.selectElement, 
        state.ui.deselectElement, 
    ]));

    const [
        showOnlyNewEdges,
        setShowOnlyNewEdges,
        edgeVisibility,
        toggleEdge,
        toggleAllEdges,
        setEdgeKeys,
        team,
        toggleTeam,
        toggleAllTeams,
        setTeamKeys,
        character,
        toggleCharacter,
        toggleAllCharacters,
        setCharacterKeys,
    ] = useViewStore(useShallow(state => [
        state.visibility.showOnlyNewEdges,
        state.visibility.setShowOnlyNewEdges,
        state.visibility.edge,
        state.visibility.toggleEdge,
        state.visibility.toggleAllEdges,
        state.visibility.setEdgeKeys,
        state.visibility.team,
        state.visibility.toggleTeam,
        state.visibility.toggleAllTeams,
        state.visibility.setTeamKeys,
        state.visibility.character,
        state.visibility.toggleCharacter,
        state.visibility.toggleAllCharacters,
        state.visibility.setCharacterKeys,
    ]));

    const [
        openInfoModal,
        openSettingsModal,
        openMinigameModal,
        openChapterRecapModal,
        closeModal,
        isInfoModalOpen,
        isSettingsModalOpen,
        isMinigameModalOpen,
        isChapterRecapModalOpen,
        isVideoModalOpen,
        videoUrl,
    ] = useViewStore(useShallow(state => [
        state.modal.openInfoModal,
        state.modal.openSettingsModal,
        state.modal.openMinigameModal,
        state.modal.openChapterRecapModal,
        state.modal.closeModal,
        state.modal.isInfoModalOpen,
        state.modal.isSettingsModalOpen,
        state.modal.isMinigameModalOpen,
        state.modal.isChapterRecapModalOpen,
        state.modal.isVideoModalOpen,
        state.modal.videoUrl,
    ]));

    // Persisted Store
    const [
        countReadElements,
        getReadStatus, 
        setReadStatus
    ] = usePersistedViewStore(useShallow(state => [state.countReadElements, state.getReadStatus, state.setReadStatus]));
    const [hasVisitedBefore, setHasVisitedBefore] = usePersistedViewStore(useShallow(state => [state.hasVisitedBefore, state.setHasVisitedBefore]));

    /* State variables */
    const [chartShrink, setChartShrink] = useState(0);
    const { browserHash, setBrowserHash } = useBrowserHash(onBrowserHashChange);

    /* Data variables */
    const chapterData = siteData.chapters[chapter];
    const dayData = chapterData.charts[day];

    /* Build initial nodes/edges by combining data from previous days. */
    const resolvedData = useMemo(() => {
        return resolveDataForDay(chapterData.charts, day);
    }, [chapterData.charts, day]);

    /* Set additional properties for nodes. */
    const completeNodes = useMemo(() => {
        return produce(resolvedData.nodes,
            draft => {
                for(const node of draft) {
                    node.hidden = !(
                        team[node.data.teamId || "null"] &&
                        character[node.id]
                    );

                    if(selectedElement) {
                        if(isNode(selectedElement)) {
                            node.selected = node.id === (selectedElement as ImageNodeType).id;
                        }
                        else if(isEdge(selectedElement)) {
                            const selectedEdge = (selectedElement as FixedEdgeType);
                            node.selected = (
                                node.id === selectedEdge.target ||
                                node.id === selectedEdge.source
                            );
                        }
                    }
                    
                    
                    node.data.isRead = getReadStatus(chapter, day, node.id);
                }
            }
        );
    }, [
        resolvedData.nodes, 
        team, 
        character, 
        selectedElement, 
        getReadStatus, 
        chapter, 
        day
    ]);

    /* Set additional properties for edges. */
    const completeEdges = useMemo(() => {
        return produce(resolvedData.edges,
            draft => {
                for(const edge of draft) {
                    const sourceNode = resolvedData.nodes.find(n => n.id === edge.source);
                    const targetNode = resolvedData.nodes.find(n => n.id === edge.target);

                    const edgesNodesAreVisible = (
                        (sourceNode !== undefined) && 
                        (targetNode !== undefined) && 
                        (character[sourceNode.id] ?? false) &&
                        (character[targetNode.id] ?? false) &&
                        (team[sourceNode.data.teamId] ?? false) && 
                        (team[targetNode.data.teamId] ?? false)
                    );

                    edge.hidden = edgesNodesAreVisible && 
                        edge.data !== undefined &&
                        edgeVisibility[edge.data.relationshipId];

                    if(selectedElement && isEdge(selectedElement)) {
                        const selectedEdge = (selectedElement as FixedEdgeType);
                        edge.selected = edge.id === selectedEdge.id;
                    }
                    
                    edge.selectable = (
                        showOnlyNewEdges && 
                        edge.data !== undefined &&
                        edge.data.day === day
                    ) || (!showOnlyNewEdges);

                    if(edge.data) {
                        edge.data.isRead = getReadStatus(chapter, day, edge.id);
                    }
                }
            }
        );
    }, [
        resolvedData.edges, 
        resolvedData.nodes, 
        character, 
        team, 
        edgeVisibility, 
        showOnlyNewEdges, 
        selectedElement, 
        day, 
        getReadStatus, 
        chapter
    ]);

    /* Helper function to coordinate state updates when data changes. */
    function changeWorkingData(newChapter: number, newDay: number) {
        if (
            newChapter < 0 ||
            newChapter > siteData.numberOfChapters ||
            newDay < 0 ||
            newDay > siteData.chapters[chapter].numberOfDays
        ) {
            return;
        }

        const newChapterData = siteData.chapters[newChapter];
        const newDayData = resolveDataForDay(
            newChapterData.charts,
            newDay,
        );

        if(selectedElement) {
            if (isNode(selectedElement)) {
                const selectedNode = (selectedElement as ImageNodeType);

                const newSelectedNode = newDayData.nodes.find(
                    n => n.id === selectedNode.id);
                
                if(newSelectedNode) {
                    newSelectedNode.selected = true;
                }
                else {
                    deselectElement();
                }
            }
            else if (isEdge(selectedElement)) {
                const selectedEdge = (selectedElement as FixedEdgeType);
                const newSelectedEdge = newDayData.edges.find(
                    e => e.id === selectedEdge.id);
                
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
                    deselectElement();
                }
            }
        }

        // Reset edge/team/character visibility on data change.
        setEdgeKeys(newDayData.edges);
        setTeamKeys(newChapterData.teams);
        setCharacterKeys(newDayData.nodes);

        changeBGM(newChapterData.bgmSrc);
        setChapter(newChapter);
        setDay(newDay);
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
                day >= siteData.chapters[chapter].numberOfDays
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
        deselectElement();
        closeCard();
        setChartShrink(0);
    },
        [closeCard, deselectElement],
    );

    const onSettingsCardOpen = useCallback(() => {
        deselectElement();
        openSettingsCard();
    }, [deselectElement, openSettingsCard]);

    const onNodeClick = useCallback((node: ImageNodeType) => {
            selectElement(node);
            openNodeCard();
        },
        [openNodeCard, selectElement],
    );

    const onEdgeClick = useCallback((edge: FixedEdgeType) => {
            selectElement(edge);
            openEdgeCard();
        },
        [openEdgeCard, selectElement],
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

    /* Memotized values for CurrentChapterDataContext and CurrentDayDataContext. */
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
            openInfoModal();
        }
    })

    /* Init block, runs only on first render/load. */
    if (!didInit) {
        didInit = true;
        onBrowserHashChange(browserHash);    
    }

    let selectedNodeTeam = null;
    let selectedEdgeRelationship = null;
    let selectedNodeRead = false;
    let selectedEdgeRead = false;
    let selectedNode = null;
    let selectedEdge = null;
    if(selectedElement) {
        if(isNode(selectedElement)) {
            selectedNode = (selectedElement as ImageNodeType);
            selectedNodeTeam = chapterData.teams[selectedNode.data.teamId];
            selectedNodeRead = getReadStatus(chapter, day, selectedNode.id);
        }
        else if(isEdge(selectedElement)) {
            selectedEdge = (selectedElement as FixedEdgeType);
            const selectedEdgeRelationshipKey = selectedEdge.data?.relationshipId;
            selectedEdgeRelationship = selectedEdgeRelationshipKey ? chapterData.relationships[selectedEdgeRelationshipKey] : null;
            selectedEdgeRead = getReadStatus(chapter, day, selectedEdge.id);
        }
    }

    function onReadChange(newReadStatus: boolean) {
        if(selectedElement == null) {
            return;
        }

        setReadStatus(chapter, day, selectedElement.id, newReadStatus);
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
                        selectedElement={selectedElement}
                        widthToShrink={chartShrink}
                        currentCard={currentCard}
                        onNodeClick={onNodeClick}
                        onEdgeClick={onEdgeClick}
                        onPaneClick={onCardClose}
                    />
                    <div
                        className={cn(
                            "absolute top-0 left-0 w-screen h-full -z-10",
                            {
                                "brightness-90 dark:brightness-70":
                                    isAnyCardOpen(),
                                "brightness-100": !isAnyCardOpen(),
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
                        isCardOpen={isSettingsCardOpen()}
                        onCardClose={onCardClose}
                        dayRecap={dayData.dayRecap}
                        nodes={completeNodes}
                        edgeVisibility={edgeVisibility}
                        toggleEdgeVisible={toggleEdge}
                        toggleAllEdgesVisible={toggleAllEdges}
                        showOnlyNewEdges={showOnlyNewEdges}
                        setShowOnlyNewEdges={setShowOnlyNewEdges}
                        teamVisibility={team}
                        toggleTeamVisible={toggleTeam}
                        toggleAllTeamsVisible={toggleAllTeams}
                        characterVisibility={character}
                        toggleCharacterVisible={toggleCharacter}
                        toggleAllCharactersVisible={toggleAllCharacters}
                        chapter={chapter}
                        chapterData={chapterData}
                        setChartShrink={setChartShrinkAndFit}
                        day={day}
                        onDayChange={(newDay) => {
                            changeWorkingData(chapter, newDay);
                        }}
                    />

                    <ViewNodeCard
                        isCardOpen={isNodeCardOpen()}
                        selectedNode={selectedNode}
                        nodeTeam={selectedNodeTeam}
                        charts={chapterData.charts}
                        read={selectedNodeRead}
                        onCardClose={onCardClose}
                        onNodeLinkClicked={onNodeClick}
                        onEdgeLinkClicked={onEdgeClick}
                        onDayChange={(newDay) => {
                            changeWorkingData(chapter, newDay);
                        }}
                        onReadChange={onReadChange}
                        setChartShrink={setChartShrinkAndFit}
                    />

                    <ViewEdgeCard
                        isCardOpen={isEdgeCardOpen()}
                        selectedEdge={selectedEdge}
                        edgeRelationship={selectedEdgeRelationship}
                        charts={chapterData.charts}
                        read={selectedEdgeRead}
                        onCardClose={onCardClose}
                        onNodeLinkClicked={onNodeClick}
                        onEdgeLinkClicked={onEdgeClick}
                        onDayChange={(newDay) => {
                            changeWorkingData(chapter, newDay);
                        }}
                        onReadChange={onReadChange}
                        setChartShrink={setChartShrinkAndFit}
                    />
                </CurrentDayDataContext>
            </div>

            <ViewInfoModal
                open={isInfoModalOpen()}
                onClose={() => {
                    if(!hasVisitedBefore) {
                        setHasVisitedBefore(true);
                        closeModal();
                        onSettingsCardOpen();
                    }
                    else {
                        closeModal();
                    }
                }}
            />

            <ViewSettingsModal
                open={isSettingsModalOpen()}
                onClose={closeModal}
            />

            <ViewMiniGameModal
                open={isMinigameModalOpen()}
                onClose={closeModal}
            />

            <ViewVideoModal
                open={isVideoModalOpen()}
                onClose={closeModal}
                videoUrl={videoUrl}
                bgImage={bgImage}
            />

            <ViewChapterRecapModal
                key={`chapter-recap-modal-${chapter}`}
                open={isChapterRecapModalOpen()}
                onClose={closeModal}
                currentChapter={chapter}
            />

            <ViewReadCounter
                day={day}
                chapter={chapter}
                nodes={dayData.nodes}
                edges={dayData.edges}
                readCount={countReadElements(chapter, day)}
                getReadStatus={getReadStatus}
                hidden={!isAnyCardOpen()}
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
                        if(isSettingsCardOpen()) {
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
                    onClick={openInfoModal}
                >
                    <Info />
                </IconButton>

                <IconButton
                    id="settings-btn"
                    className="h-10 w-10 p-1"
                    tooltipText="Settings"
                    enabled={true}
                    tooltipSide="left"
                    onClick={openSettingsModal}
                >
                    <Settings />
                </IconButton>

                <IconButton
                    id="minigames-btn"
                    className="h-10 w-10 p-1"
                    tooltipText="Minigames"
                    enabled={true}
                    tooltipSide="left"
                    onClick={openMinigameModal}
                >
                    <Dice6 />
                </IconButton>

                <IconButton
                    id="chapter-recap-btn"
                    className="h-10 w-10 p-1"
                    tooltipText="Chatper Recap"
                    enabled={true}
                    tooltipSide="left"
                    onClick={openChapterRecapModal}
                >
                    <Book />
                </IconButton>
            </div>

            <div
                className={cn(
                    "z-50 fixed inset-x-0 bottom-0 mb-2 px-2 md:p-0 ",
                    {
                        "w-[60%] lg:block hidden":
                            isSettingsCardOpen(),
                        "w-full md:w-4/5 2xl:w-2/5 mx-auto":
                            !isSettingsCardOpen(),
                    },
                )}
            >
                <ViewTransportControls
                    chapter={chapter}
                    chapterData={siteData.chapters}
                    day={day}
                    numberOfChapters={siteData.numberOfChapters}
                    numberOfDays={chapterData.numberOfDays}
                    currentCard={currentCard}
                    onChapterChange={(newChapter) => {
                        deselectElement();
                        closeCard();
                        changeWorkingData(newChapter, 0);
                    }}
                    onDayChange={(newDay) => {
                        if (openDayRecapOnDayChange) {
                            onSettingsCardOpen();
                        }
                        changeWorkingData(chapter, newDay);
                    }}
                />
            </div>
        </>
    );
};

export default memo(ViewApp);
