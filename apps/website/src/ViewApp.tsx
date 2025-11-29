"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import InfoModal from "@/components/view/basic-modals/InfoModal";
import DayRecapCard from "@/components/view/chart-cards/DayRecapCard";
import EdgeCard from "@/components/view/chart-cards/EdgeCard";
import NodeCard from "@/components/view/chart-cards/NodeCard";
import { useViewStore } from "@/store/viewStore";
import { FixedEdgeType, ImageNodeType } from "@enreco-archive/common/types";

import Chart from "@/components/view/chart/Chart";
import ReadCounter from "@/components/view/chart/ReadCounter";
import TransportControls from "@/components/view/chart/TransportControls";
import MiniGameModal from "@/components/view/minigames/MiniGameModal";
import SettingsModal from "@/components/view/utility-modals/SettingsModal";
import VideoModal from "@/components/view/utility-modals/VideoModal";
import { useBrowserHash } from "@/hooks/useBrowserHash";
import { useClickOutside } from "@/hooks/useClickOutsite";
import { useDisabledDefaultMobilePinchZoom } from "@/hooks/useDisabledDefaultMobilePinchZoom";
import { useAudioSettingsSync, useAudioStore } from "@/store/audioStore";
import { useSettingStore } from "@/store/settingStore";
import { IconButton } from "@enreco-archive/common-ui/components/IconButton";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { Book, Dice6, Disc3, Info, Palette, Settings } from "lucide-react";
import { DRAWER_OPEN_CLOSE_ANIM_TIME_MS } from "./components/view/chart-cards/VaulDrawer";

import ChapterRecapModal from "@/components/view/utility-modals/ChapterRecapModal";

import ChangelogModal from "@/components/view/basic-modals/Changelog";
import FanartModal from "@/components/view/fanart/FanartModal";
import MusicPlayerModal from "@/components/view/jukebox/MusicPlayerModal";
import {
    CurrentChapterDataContext,
} from "@/contexts/CurrentChartData";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { resolveDataForDay } from "@/lib/chart-utils";
import { useMusicPlayerStore } from "@/store/musicPlayerStore";
import {
    countReadElements,
    usePersistedViewStore,
} from "@/store/persistedViewStore";
import { isEdge, isNode } from "@xyflow/react";
import { produce } from "immer";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useResolvedData } from "./hooks/data/useResolvedData";

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
    isInLoadingScreen: boolean;
    bgImage: string;
}

let didInit = false;
const ViewApp = ({ isInLoadingScreen, bgImage }: Props) => {
    const tNavTooltips = useTranslations("navTooltips");
    const tReadStatus = useTranslations("modals.readStatus");
    /* Hooks that are not use*Store/useState/useMemo/useCallback */
    useAudioSettingsSync();
    useClickOutside();

    // For disabling default pinch zoom on mobiles, as it conflict with the chart's zoom
    // Also when pinch zoom when one of the cards are open, upon closing the zoom will stay that way permanently
    useDisabledDefaultMobilePinchZoom();

    /* Zustand store variables */
    // Settings Store
    const openDayRecapOnDayChange = useSettingStore(
        (state) => state.openDayRecapOnDayChange,
    );
    const locale = useSettingStore((state) => state.locale);

    // Audio Store
    const changeBGM = useAudioStore((state) => state.changeBGM);
    const setSiteBgmKey = useAudioStore((state) => state.setSiteBgmKey);

    // Music Player Store
    const isMusicPlayerPlaying = useMusicPlayerStore(
        (state) => state.isPlaying,
    );

    // Main App Store
    const chapter = useViewStore((state) => state.chapter);
    const day = useViewStore((state) => state.day);
    const setDay = useViewStore((state) => state.setDay);
    const setChapter = useViewStore((state) => state.setChapter);

    const currentCard = useViewStore((state) => state.currentCard);
    const openNodeCard = useViewStore((state) => state.openNodeCard);
    const openEdgeCard = useViewStore((state) => state.openEdgeCard);
    const openSettingsCard = useViewStore((state) => state.openSettingsCard);
    const closeCard = useViewStore((state) => state.closeCard);
    const selectedElement = useViewStore((state) => state.selectedElement);
    const selectElement = useViewStore((state) => state.selectElement);
    const deselectElement = useViewStore((state) => state.deselectElement);

    const showOnlyNewEdges = useViewStore(
        (state) => state.showOnlyNewEdges,
    );
    const setShowOnlyNewEdges = useViewStore(
        (state) => state.setShowOnlyNewEdges,
    );
    const relationshipVisibility = useViewStore(
        (state) => state.relationship,
    );
    const toggleRelationship = useViewStore(
        (state) => state.toggleRelationship,
    );
    const toggleAllRelationships = useViewStore(
        (state) => state.toggleAllRelationships,
    );
    const setRelationshipKeys = useViewStore(
        (state) => state.setRelationshipKeys,
    );
    const team = useViewStore((state) => state.team);
    const toggleTeam = useViewStore((state) => state.toggleTeam);
    const toggleAllTeams = useViewStore(
        (state) => state.toggleAllTeams,
    );
    const setTeamKeys = useViewStore((state) => state.setTeamKeys);
    const character = useViewStore((state) => state.character);
    const toggleCharacter = useViewStore(
        (state) => state.toggleCharacter,
    );
    const toggleAllCharacters = useViewStore(
        (state) => state.toggleAllCharacters,
    );
    const setCharacterKeys = useViewStore(
        (state) => state.setCharacterKeys,
    );
    const openModal = useViewStore((state) => state.openModal);
    const openInfoModal = useViewStore((state) => state.openInfoModal);
    const openSettingsModal = useViewStore(
        (state) => state.openSettingsModal,
    );
    const openMinigameModal = useViewStore(
        (state) => state.openMinigameModal,
    );
    const openChapterRecapModal = useViewStore(
        (state) => state.openChapterRecapModal,
    );
    const openFanartModal = useViewStore(
        (state) => state.openFanartModal,
    );
    const openMusicPlayerModal = useViewStore(
        (state) => state.openMusicPlayerModal,
    );
    const openReadCounterModal = useViewStore(
        (state) => state.openReadCounterModal,
    );
    const closeModal = useViewStore((state) => state.closeModal);
    const videoUrl = useViewStore((state) => state.videoUrl);

    // Persisted Store
    const readStatus = usePersistedViewStore((state) => state.readStatus);
    // Not wrapping this in useMemo because by doing so, it won't get updated as any of the read status changes.
    const readCount = countReadElements(readStatus, chapter, day);

    const hasVisitedBefore = usePersistedViewStore(
        (state) => state.hasVisitedBefore,
    );
    const setHasVisitedBefore = usePersistedViewStore(
        (state) => state.setHasVisitedBefore,
    );

    /* State variables */
    const [chartShrink, setChartShrink] = useState(0);
    const { browserHash, setBrowserHash } = useBrowserHash(onBrowserHashChange);

    /* Data variables */
    const { getSiteData, getChapter } = useLocalizedData();
    const siteData = getSiteData();
    const chapterData = getChapter(chapter);
    const dayData = chapterData.charts[day];

    /* Build complete nodes/edges by combining data from previous days and current app state. */
    const completeData = useResolvedData();

    /* Helper function to coordinate state updates when data changes. */
    function changeWorkingData(newChapter: number, newDay: number) {
        if (
            newChapter < 0 ||
            newChapter > siteData.numberOfChapters ||
            newDay < 0 ||
            newDay > siteData.chapters[locale][chapter].numberOfDays
        ) {
            return;
        }

        const newChapterData = siteData.chapters[locale][newChapter];
        const newDayData = resolveDataForDay(newChapterData.charts, newDay);

        if (selectedElement) {
            if (isNode(selectedElement)) {
                const selectedNode = selectedElement as ImageNodeType;

                const newSelectedNode = newDayData.nodes.find(
                    (n) => n.id === selectedNode.id,
                );

                if (newSelectedNode) {
                    newSelectedNode.selected = true;
                    selectElement(newSelectedNode);
                } else {
                    deselectElement();
                }
            } else if (isEdge(selectedElement)) {
                const selectedEdge = selectedElement as FixedEdgeType;
                const newSelectedEdge = newDayData.edges.find(
                    (e) => e.id === selectedEdge.id,
                );

                if (newSelectedEdge) {
                    newSelectedEdge.selected = true;
                    const sourceNode = newDayData.nodes.find(
                        (n) => n.id === newSelectedEdge.source,
                    );
                    if (sourceNode) {
                        sourceNode.selected = true;
                    }

                    const targetNode = newDayData.nodes.find(
                        (n) => n.id === newSelectedEdge.target,
                    );
                    if (targetNode) {
                        targetNode.selected = true;
                    }

                    selectElement(newSelectedEdge);
                } else {
                    deselectElement();
                }
            }
        }

        // Reset edge/team/character visibility on data change.
        setRelationshipKeys(newChapterData.relationships);
        setTeamKeys(newChapterData.teams);
        setCharacterKeys(newDayData.nodes);

        if (!isMusicPlayerPlaying) {
            changeBGM(newChapterData.bgmSrc);
        }
        setSiteBgmKey(newChapterData.bgmSrc);
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
                day >= siteData.chapters[locale][chapter].numberOfDays
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
    }, [closeCard, deselectElement]);

    const onSettingsCardOpen = useCallback(() => {
        deselectElement();
        openSettingsCard();
    }, [deselectElement, openSettingsCard]);

    const onNodeClick = useCallback(
        (node: ImageNodeType) => {
            selectElement(node);
            openNodeCard();
        },
        [openNodeCard, selectElement],
    );

    const onEdgeClick = useCallback(
        (edge: FixedEdgeType) => {
            selectElement(edge);
            openEdgeCard();
        },
        [openEdgeCard, selectElement],
    );

    const setChartShrinkAndFit = useCallback(
        (width: number) => {
            if (width !== chartShrink) {
                setTimeout(() => {
                    setChartShrink(width);
                }, DRAWER_OPEN_CLOSE_ANIM_TIME_MS * 0.6);
            }
        },
        [chartShrink],
    );

    /* Memotized values for CurrentChapterDataContext. */
    const currentChapterContextValue = useMemo(
        () => ({
            teams: chapterData.teams,
            relationships: chapterData.relationships,
        }),
        [chapterData.relationships, chapterData.teams],
    );

    useEffect(() => {
        if (!hasVisitedBefore && !isInLoadingScreen) {
            openInfoModal();
        }
    });

    useEffect(() => {
        // When locale changes, refresh the current data to get localized content
        // Doing this to prevent selected element staying stale when the locale changes
        changeWorkingData(chapter, day);
        // DO NOT add the rest of the missing dependencies, it will cause an infinite loop, screw react
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale]);

    /* Init block, runs only on first render/load. */
    if (!didInit) {
        didInit = true;
        onBrowserHashChange(browserHash);
    }

    let selectedNodeTeam = null;
    let selectedEdgeRelationship = null;
    let selectedNode = null;
    let selectedEdge = null;
    if (selectedElement) {
        if (isNode(selectedElement)) {
            selectedNode = selectedElement as ImageNodeType;
            selectedNodeTeam = chapterData.teams[selectedNode.data.teamId];
        } else if (isEdge(selectedElement)) {
            selectedEdge = selectedElement as FixedEdgeType;
            const selectedEdgeRelationshipKey =
                selectedEdge.data?.relationshipId;
            selectedEdgeRelationship = selectedEdgeRelationshipKey
                ? chapterData.relationships[selectedEdgeRelationshipKey]
                : null;
        }
    }

    const totalCount = useMemo(
        () =>
            completeData.nodes.filter((node) => node.data.day === day).length +
            completeData.edges.filter((edge) => edge.data?.day === day).length,
        [completeData.nodes, completeData.edges, day],
    );

    return (
        <>
            <div className="w-screen h-dvh top-0 inset-x-0 overflow-hidden">
                <CurrentChapterDataContext value={currentChapterContextValue}>
                    <Chart
                        nodes={completeData.nodes}
                        edges={completeData.edges}
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
                                    currentCard !== null,
                                "brightness-100": currentCard === null,
                            },
                        )}
                        style={{
                            backgroundImage: `url('${bgImage}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            transition:
                                "brightness 0.5s, background-image 0.3s",
                        }}
                    />
                    <DayRecapCard
                        isCardOpen={currentCard === "setting"}
                        onCardClose={onCardClose}
                        dayRecap={dayData.dayRecap}
                        nodes={completeData.nodes}
                        relationshipVisibility={relationshipVisibility}
                        toggleRelationshipVisible={toggleRelationship}
                        toggleAllRelationshipVisible={
                            toggleAllRelationships
                        }
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

                    <NodeCard
                        isCardOpen={currentCard === "node"}
                        selectedNode={selectedNode}
                        nodeTeam={selectedNodeTeam}
                        charts={chapterData.charts}
                        chapter={chapter}
                        day={day}
                        onCardClose={onCardClose}
                        onNodeLinkClicked={onNodeClick}
                        onEdgeLinkClicked={onEdgeClick}
                        onDayChange={(newDay) => {
                            changeWorkingData(chapter, newDay);
                        }}
                        setChartShrink={setChartShrinkAndFit}
                    />

                    <EdgeCard
                        isCardOpen={currentCard === "edge"}
                        selectedEdge={selectedEdge}
                        edgeRelationship={selectedEdgeRelationship}
                        charts={chapterData.charts}
                        chapter={chapter}
                        day={day}
                        onCardClose={onCardClose}
                        onNodeLinkClicked={onNodeClick}
                        onEdgeLinkClicked={onEdgeClick}
                        onDayChange={(newDay) => {
                            changeWorkingData(chapter, newDay);
                        }}
                        setChartShrink={setChartShrinkAndFit}
                    />
                </CurrentChapterDataContext>
            </div>

            <ChangelogModal
                open={openModal === "changelog"}
                onClose={closeModal}
            />

            <InfoModal
                open={openModal === "info"}
                onClose={() => {
                    if (!hasVisitedBefore) {
                        setHasVisitedBefore(true);
                        closeModal();
                        onSettingsCardOpen();
                    } else {
                        closeModal();
                    }
                }}
            />

            <SettingsModal
                open={openModal === "settings"}
                onClose={closeModal}
            />

            <MiniGameModal
                open={openModal === "minigame"}
                onClose={closeModal}
            />

            <VideoModal
                open={openModal === "video"}
                onClose={closeModal}
                videoUrl={videoUrl}
                bgImage={bgImage}
            />

            <ChapterRecapModal
                key={`chapter-recap-modal-${chapter}`}
                open={openModal === "chapterRecap"}
                onClose={closeModal}
                currentChapter={chapter}
            />

            {/* Moving this out of the counter modal in order to synchronize it with the other modals */}
            <button
                className={cn(
                    "fixed top-2 left-1/2 -translate-x-1/2 py-2 bg-background/80 border-2 hover:border-accent-foreground rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-all w-[120px]",
                    {
                        invisible: currentCard !== null,
                        visible: currentCard === null,
                    },
                )}
                onClick={openReadCounterModal}
            >
                {tReadStatus("readCount", {
                    count: readCount,
                    total: totalCount,
                })}
            </button>

            <ReadCounter
                open={openModal === "read-counter"}
                onClose={closeModal}
                day={day}
                chapter={chapter}
                nodes={completeData.nodes}
                edges={completeData.edges}
                onEdgeClick={onEdgeClick}
                onNodeClick={onNodeClick}
            />
            <MusicPlayerModal
                open={openModal === "music"}
                onClose={closeModal}
            />
            <FanartModal
                open={openModal === "fanart"}
                onClose={closeModal}
                chapter={chapter}
                day={day}
                initialCharacters={(() => {
                    if (currentCard === "edge" && selectedEdge) {
                        const { source, target } = selectedEdge;
                        return [source, target];
                    } else if (currentCard === "node" && selectedNode) {
                        return [selectedNode.id];
                    }
                    return undefined;
                })()}
            />

            <div className="fixed top-0 right-0 m-[8px] z-10 flex flex-col gap-[8px]">
                <IconButton
                    id="chart-info-btn"
                    className="h-10 w-10 p-0 bg-transparent outline-hidden border-0 transition-all cursor-pointer hover:opacity-80 hover:scale-110 relative"
                    tooltipText={tNavTooltips("dayRecapVisibility")}
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => {
                        if (currentCard === "setting") {
                            onCardClose();
                        } else {
                            onSettingsCardOpen();
                        }
                    }}
                >
                    <Image
                        src="images-opt/emblem-opt.webp"
                        className="w-full h-full"
                        fill
                        alt={tNavTooltips("dayRecapVisibility")}
                    />
                </IconButton>

                <IconButton
                    id="info-btn"
                    className="h-10 w-10 p-1"
                    tooltipText={tNavTooltips("info")}
                    enabled={true}
                    tooltipSide="left"
                    onClick={openInfoModal}
                >
                    <Info />
                </IconButton>

                <IconButton
                    id="settings-btn"
                    className="h-10 w-10 p-1"
                    tooltipText={tNavTooltips("settings")}
                    enabled={true}
                    tooltipSide="left"
                    onClick={openSettingsModal}
                >
                    <Settings />
                </IconButton>

                <IconButton
                    id="minigames-btn"
                    className="h-10 w-10 p-1"
                    tooltipText={tNavTooltips("minigames")}
                    enabled={true}
                    tooltipSide="left"
                    onClick={openMinigameModal}
                >
                    <Dice6 />
                </IconButton>

                <IconButton
                    id="chapter-recap-btn"
                    className="h-10 w-10 p-1"
                    tooltipText={tNavTooltips("chapterRecap")}
                    enabled={true}
                    tooltipSide="left"
                    onClick={openChapterRecapModal}
                >
                    <Book />
                </IconButton>

                <IconButton
                    id="jukebox-btn"
                    className="h-10 w-10 p-1"
                    tooltipText={tNavTooltips("jukebox")}
                    enabled={true}
                    tooltipSide="left"
                    onClick={openMusicPlayerModal}
                >
                    <Disc3 />
                </IconButton>

                <IconButton
                    id="gallery-btn"
                    className="h-10 w-10 p-1"
                    tooltipText={tNavTooltips("libestalGallery")}
                    enabled={true}
                    tooltipSide="left"
                    onClick={openFanartModal}
                >
                    <Palette />
                </IconButton>
            </div>

            <div
                className={cn(
                    "z-0 fixed inset-x-0 bottom-0 mb-6 px-2 md:p-0 ",
                    {
                        "w-[60%] lg:block hidden": currentCard === "setting",
                        "w-full md:w-4/5 2xl:w-2/5 mx-auto":
                            currentCard === null,
                        hidden:
                            currentCard !== null && currentCard !== "setting",
                    },
                )}
            >
                <TransportControls
                    isAnyModalOpen={openModal !== null}
                    chapter={chapter}
                    chapterData={siteData.chapters[locale]}
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
