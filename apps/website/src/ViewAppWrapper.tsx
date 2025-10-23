"use client";

import ViewGlossaryApp from "@/components/view/glossary/ViewGlossaryApp";
import { useLocalizedData } from "@/hooks/useLocalizedData";
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
import { useEffect, useState } from "react";
import ViewApp from "./ViewApp";
import ViewLoadingPage from "./components/view/chart/ViewLoadingPage";
import { useSettingStore } from "./store/settingStore";
import ViewTranslationDislaimerModal from "@/components/view/basic-modals/ViewTranslationDisclaimerModal";
import { usePersistedViewStore } from "@/store/persistedViewStore";
import { LS_KEYS } from "@/lib/constants";
import ViewVideoArchiveApp from "@/components/view/recollection-archive/ViewVideoArchiveApp";

type AppType = "chart" | "glossary" | "archive";

export const ViewAppWrapper = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [viewAppVisible, setViewAppVisible] = useState(false);
    const themeType = useSettingStore((state) => state.themeType);

    const useDarkMode = useLightDarkModeSwitcher(themeType);

    const [appType, setAppType] = useState<AppType>("chart");
    const chapter = useViewStore((state) => state.data.chapter);
    const currentCard = useViewStore((state) => state.ui.currentCard);
    const closeCard = useViewStore((state) => state.ui.closeCard);
    const deselectElement = useViewStore((state) => state.ui.deselectElement);

    const { getChapter } = useLocalizedData();
    const chapterData = getChapter(chapter);
    const hasVisitedBefore = usePersistedViewStore(
        (state) => state.hasVisitedBefore,
    );
    const openChangeLogModal = useViewStore(
        (state) => state.modal.openChangeLogModal,
    );

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
            <ViewTranslationDislaimerModal />

            {isLoading && (
                <ViewLoadingPage
                    useDarkMode={useDarkMode}
                    onStart={() => {
                        setIsLoading(false);
                    }}
                    setViewAppVisible={() => setViewAppVisible(true)}
                />
            )}

            {/* Setting the background here so both apps can use it */}
            <div
                className={cn("absolute top-0 left-0 w-screen h-dvh -z-10", {
                    "brightness-90 dark:brightness-70": currentCard !== null,
                    "brightness-100": currentCard === null,
                })}
                style={{
                    backgroundImage: `url('${bgImage}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    transition: "brightness 0.5s, background-image 0.3s",
                }}
            />

            <div
                className={cn("overflow-hidden", {
                    "visible opacity-100": viewAppVisible,
                    "invisible opacity-0": !viewAppVisible,
                })}
            >
                <Tabs
                    orientation="vertical"
                    defaultValue="chart"
                    onValueChange={(value) => {
                        // To avoid soft-locking when the user chooses a card, and quickly switches to glossary
                        if (value === "glossary") {
                            closeCard();
                            deselectElement();
                        }
                        setAppType(value as AppType);
                    }}
                    className={cn(
                        "absolute left-[8px] top-[8px] z-10 transition-all",
                        {
                            "invisible opacity-0": currentCard !== null,
                            "visible opacity-100": currentCard === null,
                        },
                    )}
                >
                    <TabsList className="md:flex-col md:h-fit">
                        <TabsTrigger value="chart">
                            <Workflow size={24} />
                        </TabsTrigger>
                        <TabsTrigger value="glossary">
                            <LibraryBig size={24} />
                        </TabsTrigger>
                        <TabsTrigger value="archive">
                            <Film size={24} />
                        </TabsTrigger>
                    </TabsList>
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
                            <ViewGlossaryApp bgImage={bgImage} />
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
                            <ViewVideoArchiveApp bgImage={bgImage} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
