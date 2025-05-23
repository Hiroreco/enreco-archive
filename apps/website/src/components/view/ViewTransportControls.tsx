import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { Chapter } from "@enreco-archive/common/types";

import { IconButton } from "@enreco-archive/common-ui/components/IconButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useEffect } from "react";
import { CardType } from "@/store/viewStore";

interface ViewTransportControlsProps {
    chapter: number;
    chapterData: Chapter[];
    day: number;
    numberOfChapters: number;
    numberOfDays: number;
    currentCard: CardType;
    onChapterChange: (newChapter: number) => void;
    onDayChange: (newDay: number) => void;
}

export default function ViewTransportControls({
    chapter,
    chapterData,
    day,
    numberOfChapters,
    numberOfDays,
    currentCard,
    onChapterChange,
    onDayChange,
}: ViewTransportControlsProps) {
    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (currentCard !== null && currentCard !== "setting") return;

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
                                {`Day ${index + 1}`}:{" "}
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
