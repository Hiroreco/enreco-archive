"use client";
import chapter0 from "@/data/chapter0.json";
import siteMeta from "@/data/metadata.json";
import { Chapter, SiteData } from "@/lib/type";
import { useState } from "react";
import ViewApp from "./ViewApp";
import ViewLoadingPage from "./components/view/ViewLoadingPage";
import { useAudioStore } from "./store/audioStore";

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

    return (
        <>
            {isLoading && (
                <ViewLoadingPage
                    onStart={() => {
                        setIsLoading(false);
                        playBGM();
                    }}
                    setViewAppVisible={() => setViewAppVisible(true)}
                />
            )}
            <div className={!viewAppVisible ? "invisible" : ""}>
                <ViewApp siteData={data} isInLoadingScreen={isLoading} />
            </div>
        </>
    );
};
