"use client";

import TranslationDislaimerModal from "@/components/view/basic-modals/TranslationDisclaimerModal";
import GlossaryApp from "@/components/view/glossary/GlossaryApp";
import { NowPlayingToast } from "@/components/view/jukebox/NowPlayingToast";
import VideoArchiveApp from "@/components/view/media-archive/MediaArchiveApp";
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
import {
    Film,
    LibraryBig,
    PanelLeftClose,
    PanelLeftOpen,
    Workflow,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ViewApp from "./ViewApp";
import LoadingPage from "./components/view/chart/LoadingPage";
import { useSettingStore } from "./store/settingStore";

const LS_SIDEBAR_KEY = "sidebar-labels-collapsed";

const NavTabTrigger = ({
    value,
    icon,
    label,
    collapsed,
    selected,
}: {
    value: string;
    icon: React.ReactNode;
    label: string;
    collapsed: boolean;
    selected: boolean;
}) => {
    const [hovered, setHovered] = useState(false);
    const showLabel = collapsed ? hovered : true;
    const labelActive = hovered || selected;

    return (
        <TabsTrigger
            className="group relative flex items-center justify-start w-10 p-0 bg-transparent border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            value={value}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <span className="flex items-center justify-center w-10 h-10 rounded-md transition-colors group-hover:bg-accent group-hover:text-accent-foreground group-data-[state=active]:bg-accent shrink-0 bg-card">
                {icon}
            </span>
            <motion.span
                className={cn(
                    "absolute top-0 left-11 flex items-center justify-center h-10 px-3 rounded-md overflow-hidden whitespace-nowrap text-sm transition-colors",
                    labelActive
                        ? "bg-accent text-accent-foreground"
                        : "bg-card text-foreground",
                )}
                animate={{
                    width: showLabel ? "5.25rem" : 0,
                    opacity: showLabel ? 1 : 0,
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
            >
                {label}
            </motion.span>
        </TabsTrigger>
    );
};

const ToggleButton = ({
    collapsed,
    onClick,
}: {
    collapsed: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center justify-center w-10 h-10 rounded-md bg-card mt-1 transition-all",
            "hover:brightness-90",
            "text-muted-foreground",
        )}
        aria-label={
            collapsed ? "Expand sidebar labels" : "Collapse sidebar labels"
        }
    >
        {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
    </button>
);

export const ViewAppWrapper = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [viewAppVisible, setViewAppVisible] = useState(false);
    const [labelsCollapsed, setLabelsCollapsed] = useState(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem(LS_SIDEBAR_KEY) === "true";
    });
    const themeType = useSettingStore((state) => state.themeType);
    const tApp = useTranslations("apps");

    const toggleLabelsCollapsed = () => {
        setLabelsCollapsed((v) => {
            const next = !v;
            localStorage.setItem(LS_SIDEBAR_KEY, String(next));
            return next;
        });
    };

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

    useEffect(() => {
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

    useEffect(() => {
        const chapterColors = {
            0: "207 39.1% 59.4%",
            1: "340 40% 45%",
            2: "25 40% 53%",
        };
        const accentColor =
            chapterColors[chapter as keyof typeof chapterColors] ||
            chapterColors[0];
        document.documentElement.style.setProperty("--accent", accentColor);
    }, [chapter]);

    const navItems = [
        {
            value: "chart",
            icon: <Workflow size={20} />,
            mobileIcon: <Workflow size={24} />,
            label: tApp("chart"),
        },
        {
            value: "glossary",
            icon: <LibraryBig size={20} />,
            mobileIcon: <LibraryBig size={24} />,
            label: tApp("glossary"),
        },
        {
            value: "archive",
            icon: <Film size={20} />,
            mobileIcon: <Film size={24} />,
            label: tApp("mediaArchive"),
        },
        // {
        //     value: "bingo",
        //     icon: (
        //         <Image
        //             src="/images-opt/bingo-logo-opt.webp"
        //             alt="Bingo"
        //             height={20}
        //             width={20}
        //             className="h-5 w-5 object-contain"
        //         />
        //     ),
        //     mobileIcon: (
        //         <Image
        //             src="/images-opt/bingo-logo-opt.webp"
        //             alt="Bingo"
        //             height={24}
        //             width={24}
        //             className="h-6 w-auto"
        //         />
        //     ),
        //     label: tApp("bingo"),
        // },
    ];

    return (
        <div>
            <TranslationDislaimerModal />
            <NowPlayingToast />
            {isLoading && (
                <LoadingPage
                    useDarkMode={useDarkMode}
                    onStart={() => setIsLoading(false)}
                    setViewAppVisible={() => setViewAppVisible(true)}
                />
            )}

            <AnimatePresence mode="sync">
                <motion.div
                    key={bgImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                        "absolute top-0 left-0 w-screen h-dvh -z-10",
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
                    {/* ── Mobile: vertical when on chart, horizontal otherwise ── */}
                    {isMobile && appType === "chart" && (
                        <TabsList className="flex-col h-fit">
                            {navItems.map(({ value, mobileIcon, label }) => (
                                <TabsTrigger
                                    key={value}
                                    value={value}
                                    title={label}
                                >
                                    {mobileIcon}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    )}
                    {isMobile && appType !== "chart" && (
                        <TabsList>
                            {navItems.map(({ value, mobileIcon, label }) => (
                                <TabsTrigger
                                    key={value}
                                    value={value}
                                    title={label}
                                >
                                    {mobileIcon}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    )}

                    {/* ── Desktop: always-visible OR hover-only labels ── */}
                    {!isMobile && (
                        <TabsList
                            className={cn(
                                "flex-col h-fit bg-transparent border-none gap-1",
                            )}
                        >
                            {navItems.map(({ value, icon, label }) => (
                                <NavTabTrigger
                                    key={value}
                                    value={value}
                                    icon={icon}
                                    label={label}
                                    collapsed={labelsCollapsed}
                                    selected={appType === value}
                                />
                            ))}

                            <ToggleButton
                                collapsed={labelsCollapsed}
                                onClick={toggleLabelsCollapsed}
                            />
                        </TabsList>
                    )}
                </Tabs>

                <AnimatePresence mode="wait">
                    {appType === "chart" && (
                        <motion.div
                            key="chart"
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
                    {/* {appType === "bingo" && (
                        <motion.div
                            key="bingo"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <BingoApp />
                        </motion.div>
                    )} */}
                </AnimatePresence>
            </div>
        </div>
    );
};
