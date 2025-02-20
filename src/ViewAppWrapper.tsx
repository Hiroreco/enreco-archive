"use client";
import chapter0 from "@/data/chapter0.json";
import siteMeta from "@/data/metadata.json";
import { Chapter, SiteData } from "@/lib/type";
import { useState } from "react";
import ViewApp from "./ViewApp";
import ViewLoadingPage from "./components/view/ViewLoadingPage";
import { useAudioStore } from "./store/audioStore";
import { useSettingStore } from "./store/settingStore";

const data: SiteData = {
    version: 1,
    numberOfChapters: siteMeta.numChapters,
    event: "Test Data V2",
    chapters: [chapter0 as Chapter],
};

export const ViewAppWrapper = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [viewAppVisible, setViewAppVisible] = useState(false);
    const playBGM = useAudioStore((state) => state.playBGM);

    const themeType = useSettingStore((state) => state.themeType);

    let isSystemDarkMode = false;
    if (typeof window !== "undefined") {
        isSystemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    const useDarkMode = (themeType === "dark" || (themeType === "system" && isSystemDarkMode));
    if (typeof document !== "undefined") {
        if (useDarkMode) {
            document.documentElement.classList.add("dark");
        }
        else {
            document.documentElement.classList.remove("dark");
        }
    }

    const handleStart = () => {
        setIsLoading(false);
        playBGM();
    };

    return (
        <>
            {isLoading && (
                <ViewLoadingPage
                    useDarkMode={useDarkMode}
                    onStart={handleStart}
                    setViewAppVisible={() => setViewAppVisible(true)}
                />
            )}
            <div className={!viewAppVisible ? "invisible" : ""}>
                <ViewApp 
                    useDarkMode={useDarkMode}
                    siteData={data} 
                />
            </div>
        </>
    );
};
