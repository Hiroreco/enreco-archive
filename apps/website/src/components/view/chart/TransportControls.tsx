import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { Chapter } from "@enreco-archive/common/types";

import { CardType, useViewStore } from "@/store/viewStore";
import { IconButton } from "@enreco-archive/common-ui/components/IconButton";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/react/shallow";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { useSettingStore } from "@/store/settingStore";

interface TransportControlsProps {
    onChapterChange: (newChapter: number) => void;
    onDayChange: (newDay: number) => void;
    isAnyModalOpen: boolean;
}

export default function TransportControls({
    onChapterChange,
    onDayChange,
    isAnyModalOpen,
}: TransportControlsProps) {
    const tDynamic = useTranslations("common");

    const {
        chapter,
        day,
        currentCard
    } = useViewStore(useShallow(state => ({
        chapter: state.chapter,
        day: state.day,
        currentCard: state.currentCard
    })));

    const locale = useSettingStore(state => state.locale);

    const { getSiteData, getChapter } = useLocalizedData();
    const siteData = getSiteData();
    const chapterData = siteData.chapters[locale];
    const numberOfChapters = siteData.numberOfChapters;
    const numberOfDays = getChapter(chapter).numberOfDays;
    
    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (currentCard !== null && currentCard !== "setting") return;

            // Disable keyboard navigation when any modal is open or when non-setting cards are open
            if (
                isAnyModalOpen ||
                (currentCard !== null && currentCard !== "setting")
            )
                return;

            if (event.key === "ArrowLeft") {
                if (day !== 0) onDayChange(day - 1);
            } else if (event.key === "ArrowRight") {
                if (day !== numberOfDays - 1) onDayChange(day + 1);
            } else if (event.key === "ArrowUp") {
                if (chapter !== 0 && currentCard !== "setting")
                    onChapterChange(chapter - 1);
            } else if (event.key === "ArrowDown") {
                if (
                    chapter !== numberOfChapters - 1 &&
                    currentCard !== "setting"
                )
                    onChapterChange(chapter + 1);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        chapter,
        day,
        numberOfChapters,
        numberOfDays,
        currentCard,
        onChapterChange,
        onDayChange,
        isAnyModalOpen,
    ]);

    return (
        <div
            className={cn(
                "w-full flex justify-center items-stretch md:items-center gap-2 transition-all",
                {
                    // Hide when a card is selected
                    "opacity-0 invisible":
                        currentCard !== null && currentCard !== "setting",
                    "opacity-100 visible":
                        currentCard === null || currentCard === "setting",
                },
            )}
        >
            <div
                className={cn("flex-1 flex gap-2", {
                    hidden: currentCard === "setting",
                })}
            >
                <IconButton
                    className="h-10 w-10 p-0 hidden md:block"
                    tooltipText={"Previous Chapter"}
                    enabled={chapter !== 0}
                    onClick={() => onChapterChange(chapter - 1)}
                >
                    <ChevronLeft />
                </IconButton>

                {/* Chapter Selector */}
                <Select
                    value={chapter.toString()}
                    onValueChange={(value: string) =>
                        onChapterChange(parseInt(value))
                    }
                >
                    <SelectTrigger className="grow" useUpChevron={true}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent side={"top"}>
                        {Array.from(chapterData.entries()).map(
                            ([index, chapter]) => (
                                <SelectItem
                                    key={`${index}-${chapter.title}`}
                                    value={index.toString()}
                                >
                                    {chapter.title || `Chapter ${index + 1}`}
                                </SelectItem>
                            ),
                        )}
                    </SelectContent>
                </Select>

                <IconButton
                    className="h-10 w-10 p-0 hidden md:block"
                    tooltipText={"Next Chapter"}
                    enabled={chapter !== numberOfChapters - 1}
                    onClick={() => onChapterChange(chapter + 1)}
                >
                    <ChevronRight />
                </IconButton>
            </div>
            <div
                className={cn("flex gap-2 h-10", {
                    "flex-1": currentCard !== "setting",
                    "w-1/2": currentCard === "setting",
                })}
            >
                <IconButton
                    className="h-10 w-10 p-0 hidden md:block"
                    tooltipText={"Previous Day"}
                    enabled={day !== 0}
                    onClick={() => onDayChange(day - 1)}
                >
                    <ChevronLeft />
                </IconButton>

                {/* Day Selector */}
                <Select
                    value={day.toString()}
                    onValueChange={(value: string) =>
                        onDayChange(parseInt(value))
                    }
                >
                    <SelectTrigger className="grow" useUpChevron={true}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent side={"top"}>
                        {[...Array(numberOfDays).keys()].map((index) => (
                            <SelectItem key={index} value={index.toString()}>
                                {tDynamic("day", { val: index + 1 })}:{" "}
                                {chapterData[chapter].charts[index].title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <IconButton
                    className="h-10 w-10 p-0 hidden md:block"
                    tooltipText={"Next Day"}
                    enabled={day !== numberOfDays - 1}
                    onClick={() => onDayChange(day + 1)}
                >
                    <ChevronRight />
                </IconButton>
            </div>
        </div>
    );
}
