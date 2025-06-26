"use client";
import chapter0 from "#/chapter0.json";
import chapter1 from "#/chapter1.json";
import siteMeta from "#/metadata.json";
import ViewGlossaryApp from "@/components/view/items-page/ViewGlossaryApp";
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
import ViewLoadingPage from "./components/view/ViewLoadingPage";
import { useSettingStore } from "./store/settingStore";

const data: SiteData = {
    version: siteMeta.version,
    numberOfChapters: siteMeta.numChapters,
    event: "ENigmatic Recollection",
    chapters: [chapter0 as Chapter, chapter1 as Chapter],
};

type AppType = "chart" | "glossary";

export const ViewAppWrapper = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [viewAppVisible, setViewAppVisible] = useState(false);
    const themeType = useSettingStore((state) => state.themeType);

    const useDarkMode = useLightDarkModeSwitcher(themeType);

    const [appType, setAppType] = useState<AppType>("chart");
    const chapter = useViewStore((state) => state.chapter);
    const currentCard = useViewStore((state) => state.currentCard);
    const chapterData = data.chapters[chapter];

    let bgImage = chapterData.bgiSrc;
    if (useDarkMode) {
        bgImage = chapterData.bgiSrc.replace(".webp", "-dark.webp");
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
                    onValueChange={(value) => setAppType(value as AppType)}
                    className={cn("absolute left-2 top-2 z-10 transition-all", {
                        "invisible opacity-0": currentCard !== null,
                        "visible opacity-100": currentCard === null,
                    })}
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
