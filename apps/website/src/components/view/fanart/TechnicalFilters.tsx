import { Button } from "@enreco-archive/common-ui/components/button";
import { Checkbox } from "@enreco-archive/common-ui/components/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@enreco-archive/common-ui/components/tooltip";
import { Shuffle } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

interface TechnicalFiltersProps {
    selectedChapter: string;
    onChapterChange: (value: string) => void;
    selectedDay: string;
    onDayChange: (value: string) => void;
    videosOnly: boolean;
    onVideosOnlyChange: (value: boolean) => void;
    memesOnly: boolean;
    onMemesOnlyChange: (value: boolean) => void;
    inclusiveMode: string;
    onInclusiveModeChange: (value: string) => void;
    sortMode: string;
    onSortModeChange: (value: string) => void;
    onReset: () => void;
    onShuffle: () => void;
    shuffled: boolean;
    chapters: number[];
    days: number[];
    selectedCharacters: string[];
}

const TechnicalFilters = ({
    selectedChapter,
    onChapterChange,
    selectedDay,
    onDayChange,
    videosOnly,
    onVideosOnlyChange,
    memesOnly,
    onMemesOnlyChange,
    inclusiveMode,
    onInclusiveModeChange,
    sortMode,
    onSortModeChange,
    onReset,
    onShuffle,
    shuffled,
    chapters,
    days,
    selectedCharacters,
}: TechnicalFiltersProps) => {
    const t = useTranslations("modals.art");

    return (
        <div className="flex-col gap-4 min-w-0 md:flex hidden">
            <div className="flex gap-2 items-center border-b mt-2 mb-2 pb-2">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                        {t("chapter")}:
                    </label>
                    <Select
                        value={selectedChapter}
                        onValueChange={onChapterChange}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t("charFilter.all")}
                            </SelectItem>
                            {chapters.map((chapter) => (
                                <SelectItem
                                    key={chapter}
                                    value={chapter.toString()}
                                >
                                    {chapter + 1}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">{t("day")}:</label>
                    <Select value={selectedDay} onValueChange={onDayChange}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t("charFilter.all")}
                            </SelectItem>
                            {days.map((day) => (
                                <SelectItem key={day} value={day.toString()}>
                                    {day + 1}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="videos-only-desktop"
                        checked={videosOnly}
                        onCheckedChange={(checked) =>
                            onVideosOnlyChange(checked === true)
                        }
                    />
                    <label
                        htmlFor="videos-only-desktop"
                        className="text-sm font-medium"
                    >
                        {t("videosOnly")}
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="dna-of-the-soul-desktop"
                        checked={memesOnly}
                        onCheckedChange={(checked) =>
                            onMemesOnlyChange(checked === true)
                        }
                    />
                    <label
                        htmlFor="dna-of-the-soul-desktop"
                        className="text-sm font-medium"
                    >
                        {t("memes")}
                    </label>
                </div>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            id="fanart-inclusive-mode"
                            size={"sm"}
                            variant={"outline"}
                            disabled={
                                selectedCharacters.includes("all") ||
                                selectedCharacters.includes("various") ||
                                selectedCharacters.includes("bloodraven")
                            }
                            className={`min-w-36 flex items-center gap-1`}
                            onClick={() => onInclusiveModeChange(inclusiveMode)}
                            aria-label={t(
                                `inclusiveModes.${inclusiveMode}.description`,
                            )}
                        >
                            <span>{t("inclusiveModes.include")}:</span>
                            <span className="font-bold">
                                {t(`inclusiveModes.${inclusiveMode}.label`)}
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {t(`inclusiveModes.${inclusiveMode}.description`)}
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            id="fanart-sort-mode"
                            size={"sm"}
                            variant={"outline"}
                            className={`min-w-36 flex items-center gap-1`}
                            onClick={() => onSortModeChange(sortMode)}
                            aria-label={t(`sortModes.${sortMode}.description`)}
                        >
                            <span>{t("sortModes.sort")}:</span>
                            <span className="font-bold">
                                {t(`sortModes.${sortMode}.label`)}
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {t(`sortModes.${sortMode}.description`)}
                    </TooltipContent>
                </Tooltip>

                <Button variant="outline" size="sm" onClick={onReset}>
                    {t("reset")}
                </Button>

                <Button
                    size="sm"
                    onClick={onShuffle}
                    variant={"outline"}
                    title={shuffled ? t("shuffle.off") : t("shuffle.on")}
                    aria-label={shuffled ? t("shuffle.off") : t("shuffle.on")}
                    className={`${shuffled ? "bg-accent text-accent-foreground" : ""}`}
                >
                    <Shuffle className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
export default TechnicalFilters;
