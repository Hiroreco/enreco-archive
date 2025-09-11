"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import ViewInfoModal from "@/components/view/basic-modals/ViewInfoModal";
import ViewDayRecapCard from "@/components/view/chart-cards/ViewDayRecapCard";
import ViewEdgeCard from "@/components/view/chart-cards/ViewEdgeCard";
import ViewNodeCard from "@/components/view/chart-cards/ViewNodeCard";
import { useViewStore } from "@/store/viewStore";
import { FixedEdgeType, ImageNodeType } from "@enreco-archive/common/types";

import ViewChart from "@/components/view/chart/ViewChart";
import ViewReadCounter from "@/components/view/chart/ViewReadCounter";
import ViewTransportControls from "@/components/view/chart/ViewTransportControls";
import ViewMiniGameModal from "@/components/view/minigames/ViewMiniGameModal";
import ViewSettingsModal from "@/components/view/utility-modals/ViewSettingsModal";
import ViewVideoModal from "@/components/view/utility-modals/ViewVideoModal";
import { useBrowserHash } from "@/hooks/useBrowserHash";
import { useClickOutside } from "@/hooks/useClickOutsite";
import { useDisabledDefaultMobilePinchZoom } from "@/hooks/useDisabledDefaultMobilePinchZoom";
import { useAudioSettingsSync, useAudioStore } from "@/store/audioStore";
import { useSettingStore } from "@/store/settingStore";
import { IconButton } from "@enreco-archive/common-ui/components/IconButton";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { Book, Dice6, Disc3, Info, Palette, Settings } from "lucide-react";
import { DRAWER_OPEN_CLOSE_ANIM_TIME_MS } from "./components/view/chart-cards/VaulDrawer";

import ViewChapterRecapModal from "@/components/view/utility-modals/ViewChapterRecapModal";

import ViewFanartModal from "@/components/view/fanart/ViewFanartModal";
import ViewMusicPlayerModal from "@/components/view/jukebox/ViewMusicPlayerModal";
import {
    CurrentChapterDataContext,
    CurrentDayDataContext,
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
import { LS_CURRENT_VERSION, LS_CURRENT_VERSION_KEY } from "@/lib/constants";
import ViewChangelogModal from "@/components/view/basic-modals/ViewChangelog";

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
    const chapter = useViewStore((state) => state.data.chapter);
    const day = useViewStore((state) => state.data.day);
    const setDay = useViewStore((state) => state.data.setDay);
    const setChapter = useViewStore((state) => state.data.setChapter);

    const currentCard = useViewStore((state) => state.ui.currentCard);
    const openNodeCard = useViewStore((state) => state.ui.openNodeCard);
    const openEdgeCard = useViewStore((state) => state.ui.openEdgeCard);
    const openSettingsCard = useViewStore((state) => state.ui.openSettingsCard);
    const closeCard = useViewStore((state) => state.ui.closeCard);
    const selectedElement = useViewStore((state) => state.ui.selectedElement);
    const selectElement = useViewStore((state) => state.ui.selectElement);
    const deselectElement = useViewStore((state) => state.ui.deselectElement);

    const showOnlyNewEdges = useViewStore(
        (state) => state.visibility.showOnlyNewEdges,
    );
    const setShowOnlyNewEdges = useViewStore(
        (state) => state.visibility.setShowOnlyNewEdges,
    );
    const relationshipVisibility = useViewStore(
        (state) => state.visibility.relationship,
    );
    const toggleRelationship = useViewStore(
        (state) => state.visibility.toggleRelationship,
    );
    const toggleAllRelationships = useViewStore(
        (state) => state.visibility.toggleAllRelationships,
    );
    const setRelationshipKeys = useViewStore(
        (state) => state.visibility.setRelationshipKeys,
    );
    const team = useViewStore((state) => state.visibility.team);
    const toggleTeam = useViewStore((state) => state.visibility.toggleTeam);
    const toggleAllTeams = useViewStore(
        (state) => state.visibility.toggleAllTeams,
    );
    const setTeamKeys = useViewStore((state) => state.visibility.setTeamKeys);
    const character = useViewStore((state) => state.visibility.character);
    const toggleCharacter = useViewStore(
        (state) => state.visibility.toggleCharacter,
    );
    const toggleAllCharacters = useViewStore(
        (state) => state.visibility.toggleAllCharacters,
    );
    const setCharacterKeys = useViewStore(
        (state) => state.visibility.setCharacterKeys,
    );
    const openModal = useViewStore((state) => state.modal.openModal);
    const openInfoModal = useViewStore((state) => state.modal.openInfoModal);
    const openSettingsModal = useViewStore(
        (state) => state.modal.openSettingsModal,
    );
    const openMinigameModal = useViewStore(
        (state) => state.modal.openMinigameModal,
    );
    const openChapterRecapModal = useViewStore(
        (state) => state.modal.openChapterRecapModal,
    );
    const openFanartModal = useViewStore(
        (state) => state.modal.openFanartModal,
    );
    const openMusicPlayerModal = useViewStore(
        (state) => state.modal.openMusicPlayerModal,
    );
    const openReadCounterModal = useViewStore(
        (state) => state.modal.openReadCounterModal,
    );
    const openChangeLogModal = useViewStore(
        (state) => state.modal.openChangeLogModal,
    );
    const closeModal = useViewStore((state) => state.modal.closeModal);
    const videoUrl = useViewStore((state) => state.modal.videoUrl);

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

    /* Build initial nodes/edges by combining data from previous days. */
    const resolvedData = useMemo(() => {
        return resolveDataForDay(chapterData.charts, day);
    }, [chapterData.charts, day]);

    /* Set additional properties for nodes. */
    const completeNodes = useMemo(() => {
        return produce(resolvedData.nodes, (draft) => {
            for (const node of draft) {
                node.hidden = !(
                    team[node.data.teamId || "null"] && character[node.id]
                );
                if (selectedElement) {
                    if (isNode(selectedElement)) {
                        node.selected =
                            node.id === (selectedElement as ImageNodeType).id;
                    } else if (isEdge(selectedElement)) {
                        const selectedEdge = selectedElement as FixedEdgeType;
                        node.selected =
                            node.id === selectedEdge.target ||
                            node.id === selectedEdge.source;
                    }
                }
            }
        });
    }, [resolvedData.nodes, team, character, selectedElement]);

    /* Set additional properties for edges. */
    const completeEdges = useMemo(() => {
        return produce(resolvedData.edges, (draft) => {
            for (const edge of draft) {
                const sourceNode = resolvedData.nodes.find(
                    (n) => n.id === edge.source,
                );
                const targetNode = resolvedData.nodes.find(
                    (n) => n.id === edge.target,
                );

                const edgesNodesAreVisible =
                    sourceNode !== undefined &&
                    targetNode !== undefined &&
                    (character[sourceNode.id] ?? false) &&
                    (character[targetNode.id] ?? false) &&
                    (team[sourceNode.data.teamId] ?? false) &&
                    (team[targetNode.data.teamId] ?? false);

                edge.hidden = !(
                    edgesNodesAreVisible &&
                    edge.data !== undefined &&
                    relationshipVisibility[edge.data.relationshipId]
                );

                if (selectedElement && isEdge(selectedElement)) {
                    const selectedEdge = selectedElement as FixedEdgeType;
                    edge.selected = edge.id === selectedEdge.id;
                }

                edge.selectable =
                    (showOnlyNewEdges &&
                        edge.data !== undefined &&
                        edge.data.day === day) ||
                    !showOnlyNewEdges;
            }
        });
    }, [
        resolvedData.edges,
        resolvedData.nodes,
        character,
        team,
        relationshipVisibility,
        showOnlyNewEdges,
        selectedElement,
        day,
    ]);

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

    /* Memotized values for CurrentChapterDataContext and CurrentDayDataContext. */
    const currentChapterContextValue = useMemo(
        () => ({
            teams: chapterData.teams,
            relationships: chapterData.relationships,
        }),
        [chapterData.relationships, chapterData.teams],
    );

    const currentDayContextValue = useMemo(
        () => ({
            nodes: resolvedData.nodes,
            edges: resolvedData.edges,
        }),
        [resolvedData.edges, resolvedData.nodes],
    );

    useEffect(() => {
        if (!hasVisitedBefore && !isInLoadingScreen) {
            openInfoModal();
        }
    });

    // Pops up the changelog modal everytime the version changes
    // The version change is based on comparing the version in localStorage and the current version
    useEffect(() => {
        // Don't show the changelog if it's the user's first time, since they will see the info modal anyway
        if (!hasVisitedBefore || isInLoadingScreen) {
            return;
        }
        const lsVersion = localStorage.getItem(LS_CURRENT_VERSION_KEY);
        if (lsVersion !== LS_CURRENT_VERSION) {
            openChangeLogModal();
            localStorage.setItem(LS_CURRENT_VERSION_KEY, LS_CURRENT_VERSION);
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
            resolvedData.nodes.filter((node) => node.data.day === day).length +
            resolvedData.edges.filter((edge) => edge.data?.day === day).length,
        [resolvedData.nodes, resolvedData.edges, day],
    );

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

                    <CurrentDayDataContext value={currentDayContextValue}>
                        <ViewDayRecapCard
                            isCardOpen={currentCard === "setting"}
                            onCardClose={onCardClose}
                            dayRecap={dayData.dayRecap}
                            nodes={completeNodes}
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

                        <ViewNodeCard
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

                        <ViewEdgeCard
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
                    </CurrentDayDataContext>
                </CurrentChapterDataContext>
            </div>

            <ViewChangelogModal
                open={openModal === "changelog"}
                onClose={closeModal}
            />

            <ViewInfoModal
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

            <ViewSettingsModal
                open={openModal === "settings"}
                onClose={closeModal}
            />

            <ViewMiniGameModal
                open={openModal === "minigame"}
                onClose={closeModal}
            />

            <ViewVideoModal
                open={openModal === "video"}
                onClose={closeModal}
                videoUrl={videoUrl}
                bgImage={bgImage}
            />

            <ViewChapterRecapModal
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

            <ViewReadCounter
                open={openModal === "read-counter"}
                onClose={closeModal}
                day={day}
                chapter={chapter}
                nodes={completeNodes}
                edges={completeEdges}
                onEdgeClick={onEdgeClick}
                onNodeClick={onNodeClick}
            />
            <ViewMusicPlayerModal
                open={openModal === "music"}
                onClose={closeModal}
            />
            <ViewFanartModal
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
                    "z-50 fixed inset-x-0 bottom-0 mb-6 px-2 md:p-0 ",
                    {
                        "w-[60%] lg:block hidden": currentCard === "setting",
                        "w-full md:w-4/5 2xl:w-2/5 mx-auto":
                            currentCard === null,
                        hidden:
                            currentCard !== null && currentCard !== "setting",
                    },
                )}
            >
                <ViewTransportControls
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
