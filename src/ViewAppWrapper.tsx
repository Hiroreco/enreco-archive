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

const data: SiteData = {
    version: siteMeta.version,
    numberOfChapters: siteMeta.numChapters,
    event: "ENigmatic Recollection",
    chapters: [chapter0 as Chapter, chapter1 as Chapter],
};

export const ViewAppWrapper = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [viewAppVisible, setViewAppVisible] = useState(false);
    const themeType = useSettingStore((state) => state.themeType);

    const useDarkMode = useLightDarkModeSwitcher(themeType);

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
            <div
                className={cn({
                    "visible opacity-1": viewAppVisible,
                    "invisible opacity-0": !viewAppVisible,
                })}
            >
                <ViewApp
                    useDarkMode={useDarkMode}
                    siteData={data}
                    isInLoadingScreen={isLoading}
                />
            </div>
        </>
    );
};
