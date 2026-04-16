"use client";

import TranslationDislaimerModal from "@/components/view/basic-modals/TranslationDisclaimerModal";
import GlossaryApp from "@/components/view/glossary/GlossaryApp";
import { NowPlayingToast } from "@/components/view/jukebox/NowPlayingToast";
import VideoArchiveApp from "@/components/view/media-archive/MediaArchiveApp";
import BingoApp from "@/components/view/minigames/bingo/BingoApp";
import useIsMobileViewport from "@/hooks/useIsMobileViewport";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { LS_KEYS } from "@/lib/constants";
import { usePersistedViewStore } from "@/store/persistedViewStore";
import { useViewStore } from "@/store/viewStore";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@enreco-archive/common-ui/components/tabs";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import useLightDarkModeSwitcher from "@enreco-archive/common/hooks/useLightDarkModeSwitcher";
import { AnimatePresence, motion } from "framer-motion";
import { Film, LibraryBig, Workflow } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import ViewApp from "./ViewApp";
import LoadingPage from "./components/view/chart/LoadingPage";
import { useSettingStore } from "./store/settingStore";
import { useTranslations } from "next-intl";

export const ViewAppWrapper = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [viewAppVisible, setViewAppVisible] = useState(false);
    const themeType = useSettingStore((state) => state.themeType);
    const tApp = useTranslations("apps");

    const tabsTriggerClass =
        "group flex items-center justify-start w-full p-0 bg-transparent border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-0";
    const iconSpanClass =
        "flex items-center justify-center w-9 h-9 rounded-md transition-colors group-hover:bg-accent group-hover:text-accent-foreground group-data-[state=active]:bg-accent shrink-0 bg-card";
    const spacerSpanClass = "w-1 shrink-0";
    const labelSpanClass =
        "flex items-center h-9 px-3 rounded-md transition-colors group-hover:bg-accent group-hover:text-accent-foreground group-data-[state=active]:bg-accent w-20 bg-card";

    const useDarkMode = useLightDarkModeSwitcher(themeType);
    const appType = useViewStore((state) => state.appType);
    const setAppType = useViewStore((state) => state.setAppType);
    const chapter = useViewStore((state) => state.chapter);
    const currentCard = useViewStore((state) => state.currentCard);
    const closeCard = useViewStore((state) => state.closeCard);
    const deselectElement = useViewStore((state) => state.deselectElement);

    const { getChapter } = useLocalizedData();
    const chapterData = getChapter(chapter);
    const hasVisitedBefore = usePersistedViewStore(
        (state) => state.hasVisitedBefore,
    );

    const openChangeLogModal = useViewStore(
        (state) => state.openChangeLogModal,
    );
    const isMobile = useIsMobileViewport();

    let bgImage = chapterData.bgiSrc;
    if (useDarkMode) {
        bgImage = chapterData.bgiSrc.replace("-opt.webp", "-dark-opt.webp");
    }

    // Pops up the changelog modal everytime the version changes
    // The version change is based on comparing the version in localStorage and the current version
    useEffect(() => {
        // Don't show the changelog if it's the user's first time, since they will see the info modal anyway
        if (!hasVisitedBefore || isLoading) {
            return;
        }
        const lsVersion = localStorage.getItem(LS_KEYS.CURRENT_VERSION_KEY);
        if (lsVersion !== LS_KEYS.CURRENT_VERSION) {
            openChangeLogModal();
            localStorage.setItem(
                LS_KEYS.CURRENT_VERSION_KEY,
                LS_KEYS.CURRENT_VERSION,
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, openChangeLogModal]);

    return (
        <div>
            <TranslationDislaimerModal />
            <NowPlayingToast />
            {isLoading && (
                <LoadingPage
                    useDarkMode={useDarkMode}
                    onStart={() => {
                        setIsLoading(false);
                    }}
                    setViewAppVisible={() => setViewAppVisible(true)}
                />
            )}

            {/* Setting the background here so both apps can use it */}
            <AnimatePresence mode="sync">
                <motion.div
                    key={bgImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={cn("absolute top-0 left-0 w-screen h-dvh -z-10", {
                        "brightness-90 dark:brightness-70": currentCard !== null,
                        "brightness-100": currentCard === null,
                    })}
                    style={{
                        backgroundImage: `url('${bgImage}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        transition: "brightness 0.5s",
                    }}
                />
            </AnimatePresence>

            <div
                className={cn("overflow-hidden", {
                    "visible opacity-100": viewAppVisible,
                    "invisible opacity-0": !viewAppVisible,
                })}
            >
                <Tabs
                    orientation="vertical"
                    value={appType}
                    onValueChange={(value) => {
                        // To avoid soft-locking when the user chooses a card, and quickly switches to glossary
                        if (value === "glossary") {
                            closeCard();
                            deselectElement();
                        }
                        setAppType(value as typeof appType);
                    }}
                    className={cn(
                        "absolute left-[8px] top-[8px] z-10 transition-all",
                        {
                            "invisible opacity-0": currentCard !== null,
                            "visible opacity-100": currentCard === null,
                        },
                    )}
                >
                    {/* I know this looks incredibly stupid, but if I do conditional rendering with the style for flex-col h-fit instead,  */}
                    {/* when the direction switches, a very noticable stutter of the selected tab can be seen */}

                    {isMobile && appType === "chart" && (
                        <TabsList
                            className={cn("flex-col h-fit", {
                                "flex-col h-fit":
                                    !isMobile ||
                                    (isMobile && appType === "chart"),
                            })}
                        >
                            <TabsTrigger value="chart">
                                <Workflow size={24} />
                            </TabsTrigger>
                            <TabsTrigger value="glossary">
                                <LibraryBig size={24} />
                            </TabsTrigger>
                            <TabsTrigger value="archive">
                                <Film size={24} />
                            </TabsTrigger>
                            <TabsTrigger value="bingo" title="Bingo">
                                <Image
                                    src="/images-opt/bingo-logo-opt.webp"
                                    alt="Bingo"
                                    height={24}
                                    width={24}
                                    className="h-6 w-auto"
                                />
                            </TabsTrigger>
                        </TabsList>
                    )}
                    {!isMobile && (
                        <TabsList
                            className={cn(
                                "flex-col h-fit bg-transparent border-none gap-1",
                                {
                                    "flex-col h-fit":
                                        !isMobile ||
                                        (isMobile && appType === "chart"),
                                },
                            )}
                        >
                            <TabsTrigger
                                className={tabsTriggerClass}
                                value="chart"
                            >
                                <span className={iconSpanClass}>
                                    <Workflow size={20} />
                                </span>
                                <span className={spacerSpanClass} />
                                <span className={labelSpanClass}>
                                    {tApp("chart")}
                                </span>
                            </TabsTrigger>

                            <TabsTrigger
                                className={tabsTriggerClass}
                                value="glossary"
                            >
                                <span className={iconSpanClass}>
                                    <LibraryBig size={20} />
                                </span>
                                <span className={spacerSpanClass} />
                                <span className={labelSpanClass}>
                                    {tApp("glossary")}
                                </span>
                            </TabsTrigger>

                            <TabsTrigger
                                className={tabsTriggerClass}
                                value="archive"
                            >
                                <span className={iconSpanClass}>
                                    <Film size={20} />
                                </span>
                                <span className={spacerSpanClass} />
                                <span className={labelSpanClass}>
                                    {tApp("mediaArchive")}
                                </span>
                            </TabsTrigger>

                            <TabsTrigger
                                className={tabsTriggerClass}
                                value="bingo"
                                title="Bingo"
                            >
                                <span className={iconSpanClass}>
                                    <Image
                                        src="/images-opt/bingo-logo-opt.webp"
                                        alt="Bingo"
                                        height={20}
                                        width={20}
                                        className="h-5 w-5 object-contain"
                                    />
                                </span>
                                <span className={spacerSpanClass} />
                                <span className={labelSpanClass}>
                                    {tApp("bingo")}
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    )}
                    {isMobile && appType !== "chart" && (
                        <TabsList>
                            <TabsTrigger value="chart">
                                <Workflow size={24} />
                            </TabsTrigger>
                            <TabsTrigger value="glossary">
                                <LibraryBig size={24} />
                            </TabsTrigger>
                            <TabsTrigger value="archive">
                                <Film size={24} />
                            </TabsTrigger>
                            <TabsTrigger value="bingo" title="Bingo">
                                <Image
                                    src="/images-opt/bingo-logo-opt.webp"
                                    alt="Bingo"
                                    height={24}
                                    width={24}
                                    className="h-6 w-auto"
                                />
                            </TabsTrigger>
                        </TabsList>
                    )}
                </Tabs>

                <AnimatePresence mode="wait">
                    {appType === "chart" && (
                        <motion.div
                            key={`chart`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ViewApp
                                bgImage={bgImage}
                                isInLoadingScreen={isLoading}
                            />
                        </motion.div>
                    )}
                    {appType === "glossary" && (
                        <motion.div
                            key="glossary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <GlossaryApp bgImage={bgImage} />
                        </motion.div>
                    )}
                    {appType === "archive" && (
                        <motion.div
                            key="archive"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <VideoArchiveApp bgImage={bgImage} />
                        </motion.div>
                    )}
                    {appType === "bingo" && (
                        <motion.div
                            key="bingo"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <BingoApp />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
