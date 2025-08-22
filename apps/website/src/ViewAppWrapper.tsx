"use client";
import chapter0_en from "#/chapter0.json";
import chapter1_en from "#/chapter1.json";

import chapter0_ja from "#/chapter0_ja.json";

import siteMeta from "#/metadata.json";
import { useViewStore } from "@/store/viewStore";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@enreco-archive/common-ui/components/tabs";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import useLightDarkModeSwitcher from "@enreco-archive/common/hooks/useLightDarkModeSwitcher";
import { Chapter, SiteData } from "@enreco-archive/common/types";
import { AnimatePresence, motion } from "framer-motion";
import { LibraryBig, Workflow } from "lucide-react";
import { useState } from "react";
import ViewApp from "./ViewApp";
import ViewLoadingPage from "./components/view/chart/ViewLoadingPage";
import { useSettingStore } from "./store/settingStore";
import ViewGlossaryApp from "@/components/view/glossary/ViewGlossaryApp";

const data: SiteData = {
    version: siteMeta.version,
    numberOfChapters: siteMeta.numChapters,
    event: "ENigmatic Recollection",
    chapters: {
        en: [chapter0_en as Chapter, chapter1_en as Chapter],
        ja: [chapter0_ja as Chapter, chapter1_en as Chapter],
    },
};

type AppType = "chart" | "glossary";

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

    const chapterData = data.chapters["en"][chapter];

    let bgImage = chapterData.bgiSrc;
    if (useDarkMode) {
        bgImage = chapterData.bgiSrc.replace("-opt.webp", "-dark-opt.webp");
    }

    return (
        <div>
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
                    <TabsList>
                        <TabsTrigger value="chart">
                            <Workflow size={24} />
                        </TabsTrigger>
                        <TabsTrigger value="glossary">
                            <LibraryBig size={24} />
                        </TabsTrigger>
                    </TabsList>
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
                                siteData={data}
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
                </AnimatePresence>
            </div>
        </div>
    );
};
