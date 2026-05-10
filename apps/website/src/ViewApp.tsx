"use client";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import InfoModal from "@/components/view/basic-modals/InfoModal";
import DayRecapCard from "@/components/view/chart-cards/DayRecapCard";
import EdgeCard from "@/components/view/chart-cards/EdgeCard";
import NodeCard from "@/components/view/chart-cards/NodeCard";
import { useViewStore } from "@/store/viewStore";
import { FixedEdgeType, ImageNodeType } from "@enreco-archive/common/types";

import Chart, { ChartInstance } from "@/components/view/chart/Chart";
import ReadCounter from "@/components/view/chart/ReadCounter";
import TransportControls from "@/components/view/chart/TransportControls";
import MiniGameModal from "@/components/view/minigames/MiniGameModal";
import SettingsModal from "@/components/view/utility-modals/SettingsModal";
import VideoModal from "@/components/view/utility-modals/VideoModal";
import { useBrowserHash } from "@/hooks/useBrowserHash";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useDisabledDefaultMobilePinchZoom } from "@/hooks/useDisabledDefaultMobilePinchZoom";
import { useAudioSettingsSync, useAudioStore } from "@/store/audioStore";
import { useSettingStore } from "@/store/settingStore";
import { IconButton } from "@enreco-archive/common-ui/components/IconButton";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import {
    Book,
    Dice6,
    Disc3,
    Info,
    Newspaper,
    Palette,
    Settings,
    BarChart3,
} from "lucide-react";
import VaulDrawer from "./components/view/chart-cards/VaulDrawer";

import ChapterRecapModalContainer from "@/components/view/utility-modals/ChapterRecapModalContainer";

import newsDataEn from "#/news.json";
import ChangelogModal from "@/components/view/basic-modals/Changelog";
import NewsModal from "@/components/view/basic-modals/NewsModal";
import FanartModal from "@/components/view/fanart/FanartModal";
import MusicPlayerModal from "@/components/view/jukebox/MusicPlayerModal";
import { StatsModal } from "@/components/view/stats/StatsModal";
import ComingSoonCard from "@/components/view/other/ComingSoonCard";
import CountdownCard from "@/components/view/other/CountdownCard";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { resolveDataForDay } from "@/lib/chart-utils";
import { useMusicPlayerStore } from "@/store/musicPlayerStore";
import {
    countReadElements,
    usePersistedViewStore,
} from "@/store/persistedViewStore";
import { isEdge, isNode } from "@xyflow/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCompleteChartData } from "./hooks/data/useCompleteChartData";
import { AnimatePresence, motion } from "framer-motion";
import useIsMobileViewport from "@/hooks/useIsMobileViewport";

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

const CARD_OPEN_PADDING = 0.1;
const NORMAL_PADDING = 0.5;

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
    const setNodeCard = useViewStore((state) => state.setNodeCard);
    const setEdgeCard = useViewStore((state) => state.setEdgeCard);
    const setSettingsCard = useViewStore((state) => state.setSettingsCard);
    const clearCard = useViewStore((state) => state.clearCard);
    const selectedElement = useViewStore((state) => state.selectedElement);
    const selectElement = useViewStore((state) => state.selectElement);
    const deselectElement = useViewStore((state) => state.deselectElement);

    const setRelationshipKeys = useViewStore(
        (state) => state.setRelationshipKeys,
    );

    const setTeamKeys = useViewStore((state) => state.setTeamKeys);

    const setCharacterKeys = useViewStore((state) => state.setCharacterKeys);
    const openModal = useViewStore((state) => state.openModal);
    const openInfoModal = useViewStore((state) => state.openInfoModal);
    const openSettingsModal = useViewStore((state) => state.openSettingsModal);
    const openMinigameModal = useViewStore((state) => state.openMinigameModal);
    const openChapterRecapModal = useViewStore(
        (state) => state.openChapterRecapModal,
    );
    const openFanartModal = useViewStore((state) => state.openFanartModal);
    const openMusicPlayerModal = useViewStore(
        (state) => state.openMusicPlayerModal,
    );
    const openReadCounterModal = useViewStore(
        (state) => state.openReadCounterModal,
    );
    const openNewsModal = useViewStore((state) => state.openNewsModal);
    const openStatsModal = useViewStore((state) => state.openStatsModal);

    const closeModal = useViewStore((state) => state.closeModal);
    const videoUrl = useViewStore((state) => state.videoUrl);

    // Persisted Store
    const readStatus = usePersistedViewStore((state) => state.readStatus);
    // Not wrapping this in useMemo because by doing so, it won't get updated as any of the read status changes.
    const readCount = countReadElements(readStatus, chapter, day);

    // New-news tracking
    const newsData = (newsDataEn as any[]) || [];
    const latestNewsIso = newsData[0]?.date;

    const latestSeenNewsDate = useSettingStore((state) => state.latestNewsDate);
    const setLatestNewsDate = useSettingStore(
        (state) => state.setLatestNewsDate,
    );
    const autoPanBack = useSettingStore((state) => state.autoPanBack);

    const newNewsCount = useMemo(() => {
        if (!latestSeenNewsDate) return 0;

        return newsData.filter((p) => p.date > latestSeenNewsDate).length;
    }, [newsData, latestSeenNewsDate]);

    const hasVisitedBefore = usePersistedViewStore(
        (state) => state.hasVisitedBefore,
    );
    const setHasVisitedBefore = usePersistedViewStore(
        (state) => state.setHasVisitedBefore,
    );

    /* State variables */
    const [chartShrink, setChartShrink] = useState(0);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const { browserHash, setBrowserHash } = useBrowserHash(onBrowserHashChange);
    const disableWidthChange = useRef<boolean>(true);
    const chartRef = useRef<ChartInstance>(null);

    /* Data variables */
    const { getSiteData, getChapter } = useLocalizedData();
    const siteData = getSiteData();
    const chapterData = getChapter(chapter);
    const dayData = chapterData.charts[day];

    const isMobile = useIsMobileViewport();

    /* Build complete nodes/edges by combining data from previous days and current app state. */
    const completeData = useCompleteChartData();

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
            let [chapter, day] = parsedValues;
            // TODO: Remove this after chapter 3 has started. Defaulting to chapter 2 on load but still make it possible to select chapter 3.
            chapter = chapter === 2 ? 1 : chapter;
            console.log(chapter, day);

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
            // TODO: Remove this after chapter 3 has started. Defaulting to chapter 2 on load but still make it possible to select chapter 3.
            let chapter = siteData.numberOfChapters - 1;
            if (chapter === 2) {
                chapter = 1;
            }
            setBrowserHash(`${chapter}/0`);
            changeWorkingData(chapter, 0);
        }
    }

    /* VaulDrawer event handlers */
    function onDrawerFullyClosed() {
        deselectElement();
        clearCard();
    }

    function onDrawerOpenWidthChange(width: number) {
        if (
            currentCard !== null &&
            !isMobile &&
            !disableWidthChange.current &&
            chartRef.current !== null
        ) {
            setChartShrink(width + 56); // Add 56px for the right margin (14 * 4)
            chartRef.current.chartFitView(
                selectedElement,
                CARD_OPEN_PADDING,
                width + 56,
            );
        }
    }

    /* Drawer opening/closing event handlers */
    function openNodeCard(node: ImageNodeType) {
        setDrawerOpen(true);
        selectElement(node);
        setNodeCard();
        disableWidthChange.current = false;

        // If we just opened the drawer, defer chart fit view until we have the size of drawer.
        if (selectedElement !== null && chartRef.current !== null) {
            chartRef.current.chartFitView(
                selectedElement,
                CARD_OPEN_PADDING,
                chartShrink,
            );
        }
    }

    function openEdgeCard(edge: FixedEdgeType) {
        setDrawerOpen(true);
        selectElement(edge);
        setEdgeCard();
        disableWidthChange.current = false;

        // If we just opened the drawer, defer chart fit view until we have the size of drawer.
        if (selectedElement !== null && chartRef.current !== null) {
            chartRef.current.chartFitView(edge, CARD_OPEN_PADDING, chartShrink);
        }
    }

    function openSettingsCard() {
        setDrawerOpen(true);
        deselectElement();
        setSettingsCard();
        disableWidthChange.current = false;

        // If we just opened the drawer, defer chart fit view until we have the size of drawer.
        if (chartRef.current !== null) {
            chartRef.current.chartFitView(null, CARD_OPEN_PADDING, chartShrink);
        }
    }

    function closeCard() {
        setDrawerOpen(false);
        setChartShrink(0);
        disableWidthChange.current = true;

        if (chartRef.current !== null && autoPanBack) {
            chartRef.current.chartFitView(null, NORMAL_PADDING, 0);
        }
    }

    function openNewsModalHandler() {
        setLatestNewsDate(latestNewsIso);
        openNewsModal();
    }

    useEffect(() => {
        // When locale changes, refresh the current data to get localized content
        // Doing this to prevent selected element staying stale when the locale changes
        changeWorkingData(chapter, day);
        // DO NOT add the rest of the missing dependencies, it will cause an infinite loop, screw react
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale]);

    // When chapter changes, center the chart.
    useEffect(() => {
        if (chartRef.current !== null) {
            chartRef.current.chartFitView(null, NORMAL_PADDING, 0);
        }
    }, [chapter]);

    /* Init block, runs only on first render/load. */
    if (!didInit) {
        didInit = true;
        onBrowserHashChange(browserHash);
    }

    const totalCount = useMemo(
        () =>
            completeData.nodes.filter((node) => node.data.day === day).length +
            completeData.edges.filter((edge) => edge.data?.day === day).length,
        [completeData.nodes, completeData.edges, day],
    );

    const fanartModalKey = `${selectedElement?.id ?? "default"}-${chapter}-${day}`;

    const cardContent = (() => {
        switch (currentCard) {
            case "node":
                if (selectedElement === null || !isNode(selectedElement)) {
                    throw new Error(
                        "Tried to open node card without a selected node.",
                    );
                }

                return (
                    <NodeCard
                        selectedNode={selectedElement as ImageNodeType}
                        onNodeLinkClicked={openNodeCard}
                        onEdgeLinkClicked={openEdgeCard}
                        onDayChange={(newDay) => {
                            changeWorkingData(chapter, newDay);
                        }}
                    />
                );
            case "edge":
                if (selectedElement === null || !isEdge(selectedElement)) {
                    throw new Error(
                        "Tried to open edge card without a selected edge.",
                    );
                }

                return (
                    <EdgeCard
                        selectedEdge={selectedElement as FixedEdgeType}
                        onNodeLinkClicked={openNodeCard}
                        onEdgeLinkClicked={openEdgeCard}
                        onDayChange={(newDay) => {
                            changeWorkingData(chapter, newDay);
                        }}
                    />
                );
            case "setting":
                return (
                    <DayRecapCard
                        dayRecap={dayData.dayRecap}
                        chapterData={chapterData}
                        onDayChange={(newDay) => {
                            changeWorkingData(chapter, newDay);
                        }}
                    />
                );
            default:
                return null;
        }
    })();

    return (
        <>
            <div className="w-screen h-dvh top-0 inset-x-0 overflow-hidden">
                {chapter <= 1 && (
                    <Chart
                        onNodeClick={openNodeCard}
                        onEdgeClick={openEdgeCard}
                        onPaneClick={closeCard}
                        ref={chartRef}
                    />
                )}
                {/* Coming soon card, shown for chapter 3 only */}
                {chapter > 1 && <ComingSoonCard />}
                <AnimatePresence mode="sync">
                    <motion.div
                        key={bgImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
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
                            transition: "brightness 0.5s",
                        }}
                    />
                </AnimatePresence>

                <VaulDrawer
                    open={isDrawerOpen}
                    onClose={closeCard}
                    onFullyClosed={onDrawerFullyClosed}
                    onOpenWidthChange={onDrawerOpenWidthChange}
                >
                    {cardContent}
                </VaulDrawer>
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
                        openSettingsCard();
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

            <ChapterRecapModalContainer
                key={`chapter-recap-modal-${chapter}`}
                open={openModal === "chapterRecap"}
                onClose={closeModal}
                currentChapter={chapter}
            />

            {/* Moving this out of the counter modal in order to synchronize it with the other modals */}
            <div
                className={cn(
                    "fixed top-2 left-1/2 -translate-x-1/2 flex flex-col md:flex-row gap-2",
                    {
                        invisible: currentCard !== null,
                        visible: currentCard === null,
                        // TODO: remove when chapter 3 starts
                        hidden: chapter > 1,
                    },
                )}
            >
                <button
                    className="py-2 bg-background/80 border-2 hover:border-accent-foreground rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-all w-[120px]"
                    onClick={openReadCounterModal}
                >
                    {tReadStatus("readCount", {
                        count: readCount,
                        total: totalCount,
                    })}
                </button>
                <button
                    // TODO: Hiding this for now, show it when chapter 3 starts
                    className="hidden py-2 bg-background/80 border-2 hover:border-accent-foreground rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-all w-[120px] items-center justify-center gap-2"
                    onClick={openStatsModal}
                    title="Stats"
                >
                    <BarChart3 className="w-4 h-4" />
                    <span>{tNavTooltips("stats")}</span>
                </button>
            </div>

            <ReadCounter
                open={openModal === "read-counter"}
                onClose={closeModal}
                onEdgeClick={openEdgeCard}
                onNodeClick={openNodeCard}
            />
            <MusicPlayerModal
                open={openModal === "music"}
                onClose={closeModal}
            />
            <FanartModal
                key={fanartModalKey}
                open={openModal === "fanart"}
                onClose={closeModal}
            />
            <NewsModal open={openModal === "news"} onClose={closeModal} />
            <StatsModal open={openModal === "stats"} onClose={closeModal} />

            <div className="fixed top-0 right-0 m-[8px] z-10 flex flex-col gap-[8px]">
                <IconButton
                    id="chart-info-btn"
                    className="h-10 w-10 p-0 bg-transparent outline-hidden border-0 transition-all cursor-pointer hover:opacity-80 hover:scale-110 relative"
                    tooltipText={tNavTooltips("dayRecapVisibility")}
                    // TODO: remove when chapter 3 starts
                    enabled={chapter <= 1}
                    tooltipSide="left"
                    onClick={() => {
                        if (currentCard === "setting") {
                            closeCard();
                        } else {
                            openSettingsCard();
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
                    id="news-btn"
                    className="h-10 w-10 p-1 relative"
                    tooltipText={tNavTooltips("news")}
                    enabled={true}
                    tooltipSide="left"
                    onClick={openNewsModalHandler}
                >
                    <Newspaper />
                    {newNewsCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center bg-red-600 text-white rounded-full text-[11px] w-5 h-5">
                            {newNewsCount > 99 ? "99+" : String(newNewsCount)}
                        </span>
                    )}
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
                className={cn("z-0 fixed inset-x-0 bottom-0 mb-6 px-2 md:p-0", {
                    "w-[60%] lg:block hidden": currentCard === "setting",
                    "w-full md:w-4/5 2xl:w-2/5 mx-auto": currentCard === null,
                    hidden: currentCard !== null && currentCard !== "setting",
                })}
            >
                <TransportControls
                    isAnyModalOpen={openModal !== null}
                    onChapterChange={(newChapter) => {
                        deselectElement();
                        clearCard();
                        changeWorkingData(newChapter, 0);
                    }}
                    onDayChange={(newDay) => {
                        if (openDayRecapOnDayChange) {
                            openSettingsCard();
                        }
                        changeWorkingData(chapter, newDay);
                    }}
                />
            </div>

            <CountdownCard isInLoadingScreen={isInLoadingScreen} />
        </>
    );
};

export default memo(ViewApp);
