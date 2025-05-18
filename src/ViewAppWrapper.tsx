"use client";
import chapter0 from "@/data/chapter0.json";
import chapter1 from "@/data/chapter1.json";
import siteMeta from "@/data/metadata.json";
import { Chapter, SiteData } from "@/lib/type";
import { useState } from "react";
import ViewApp from "./ViewApp";
import ViewLoadingPage from "./components/view/ViewLoadingPage";
import useLightDarkModeSwitcher from "./hooks/useLightDarkModeSwitcher";
import { cn } from "./lib/utils";
import { useSettingStore } from "./store/settingStore";
import ViewItemsApp from "@/ViewItemsApp";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sword, Workflow } from "lucide-react";
import { useViewStore } from "@/store/viewStore";

const data: SiteData = {
    version: siteMeta.version,
    numberOfChapters: siteMeta.numChapters,
    event: "ENigmatic Recollection",
    chapters: [chapter0 as Chapter, chapter1 as Chapter],
};

type AppType = "chart" | "items";

export const ViewAppWrapper = () => {
    const viewStore = useViewStore();

    const [isLoading, setIsLoading] = useState(true);
    const [viewAppVisible, setViewAppVisible] = useState(false);
    const [appType, setAppType] = useState<AppType>("chart");
    const themeType = useSettingStore((state) => state.themeType);
    const useDarkMode = useLightDarkModeSwitcher(themeType);

    const chapterData = data.chapters[viewStore.chapter];

    let bgImage = chapterData.bgiSrc;
    if (useDarkMode) {
        bgImage = chapterData.bgiSrc.replace(".webp", "-dark.webp");
    }

    return (
        <>
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
                    "brightness-90 dark:brightness-70":
                        viewStore.currentCard !== null,
                    "brightness-100": viewStore.currentCard === null,
                })}
                style={{
                    backgroundImage: `url('${bgImage}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    transition: "brightness 0.5s",
                }}
            />

            <div
                className={cn("overflow-hidden", {
                    "visible opacity-1": viewAppVisible,
                    "invisible opacity-0": !viewAppVisible,
                })}
            >
                <Tabs
                    orientation="vertical"
                    defaultValue="chart"
                    onValueChange={(value) => setAppType(value as AppType)}
                    className={cn("absolute left-2 top-2 z-10 transition-all", {
                        "invisible opacity-0": viewStore.currentCard !== null,
                        "visible opacity-100": viewStore.currentCard === null,
                    })}
                >
                    <TabsList>
                        <TabsTrigger value="chart">
                            <Workflow size={24} />
                        </TabsTrigger>
                        <TabsTrigger value="items">
                            <Sword size={24} />
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
                    {appType === "items" && (
                        <motion.div
                            key="items"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ViewItemsApp bgImage={bgImage} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};
