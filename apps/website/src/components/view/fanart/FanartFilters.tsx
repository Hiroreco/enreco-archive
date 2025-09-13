import CharacterSelector from "@/components/view/fanart/CharacterSelector";
import { InclusiveMode } from "@/components/view/fanart/ViewFanartModal";
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

interface FanartFiltersProps {
    selectedCharacters: string[];
    selectedChapter: string;
    selectedDay: string;
    characters: string[];
    chapters: number[];
    days: number[];
    nameMap: Record<string, string>;
    inclusiveMode: InclusiveMode;
    videosOnly: boolean;
    memesOnly?: boolean;
    onCharactersChange: (characters: string[]) => void;
    onChapterChange: (chapter: string) => void;
    onDayChange: (day: string) => void;
    onInclusiveModeChange: (currentMode: InclusiveMode) => void;
    onVideosOnlyChange: (videosOnly: boolean) => void;
    onMemesOnlyChange: (memesOnly: boolean) => void;
    onReset: () => void;
    onShuffle: () => void;
    shuffled: boolean;
    totalItems: number;
}

const FanartFilters = ({
    selectedCharacters,
    selectedChapter,
    selectedDay,
    characters,
    chapters,
    days,
    nameMap,
    inclusiveMode,
    videosOnly,
    memesOnly,
    onCharactersChange,
    onChapterChange,
    onDayChange,
    onInclusiveModeChange,
    onVideosOnlyChange,
    onMemesOnlyChange,
    onReset,
    onShuffle,
    shuffled,
    totalItems,
}: FanartFiltersProps) => {
    const t = useTranslations("modals.art");
    return (
        <div className="border-b pb-4">
            {/* Mobile layout */}
            <div className="md:hidden space-y-2">
                <div className="grid grid-cols-2 gap-2 px-2">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            {t("chapter")}
                        </label>
                        <Select
                            value={selectedChapter}
                            onValueChange={onChapterChange}
                        >
                            <SelectTrigger className="h-8 text-sm">
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
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            {t("day")}
                        </label>
                        <Select value={selectedDay} onValueChange={onDayChange}>
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {t("charFilter.all")}
                                </SelectItem>
                                {days.map((day) => (
                                    <SelectItem
                                        key={day}
                                        value={day.toString()}
                                    >
                                        {day + 1}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <CharacterSelector
                    selectedCharacters={selectedCharacters}
                    characters={characters}
                    nameMap={nameMap}
                    onCharactersChange={onCharactersChange}
                    mobile={true}
                />

                {/* Mobile filters container */}
                <div className="grid grid-cols-2 gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                id="fanart-inclusive-mode-mobile"
                                size={"sm"}
                                variant={"outline"}
                                disabled={
                                    selectedCharacters.includes("all") ||
                                    selectedCharacters.includes("various")
                                }
                                onClick={() =>
                                    onInclusiveModeChange(inclusiveMode)
                                }
                                aria-label={t(
                                    `inclusiveModes.${inclusiveMode}.description`,
                                )}
                                className={`h-6 text-xs flex items-center gap-1`}
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

                    <Button
                        variant={shuffled ? "default" : "outline"}
                        size="sm"
                        onClick={onShuffle}
                        title={shuffled ? t("shuffle.off") : t("shuffle.on")}
                        aria-label={
                            shuffled ? t("shuffle.off") : t("shuffle.on")
                        }
                        className="w-full flex items-center justify-center h-6 text-xs"
                    >
                        <Shuffle className="w-4 h-4 mr-1" />
                        {shuffled ? t("shuffle.off") : t("shuffle.on")}
                    </Button>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="videos-only-mobile"
                            checked={videosOnly}
                            onCheckedChange={(checked) =>
                                onVideosOnlyChange(checked === true)
                            }
                        />
                        <label
                            htmlFor="videos-only-mobile"
                            className="text-xs font-medium text-muted-foreground"
                        >
                            {t("videosOnly")}
                        </label>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onReset}
                        className="w-full flex items-center justify-center h-6 text-xs"
                    >
                        {t("reset")}
                    </Button>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="dna-of-the-soul-mobile"
                            checked={memesOnly}
                            onCheckedChange={(checked) =>
                                onMemesOnlyChange(checked === true)
                            }
                        />
                        <label
                            htmlFor="dna-of-the-soul-mobile"
                            className="text-xs font-medium text-muted-foreground"
                        >
                            {t("memes")}
                        </label>
                    </div>
                </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden md:flex flex-wrap gap-4 items-center">
                <CharacterSelector
                    selectedCharacters={selectedCharacters}
                    characters={characters}
                    nameMap={nameMap}
                    onCharactersChange={onCharactersChange}
                    mobile={false}
                />

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
                        id="dna-of-the-soul-mobile"
                        checked={memesOnly}
                        onCheckedChange={(checked) =>
                            onMemesOnlyChange(checked === true)
                        }
                    />
                    <label
                        htmlFor="dna-of-the-soul-mobile"
                        className="text-sm font-medium"
                    >
                        {t("memes")}
                    </label>
                </div>

                <div className="flex flex-row gap-2 items-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                id="fanart-inclusive-mode"
                                size={"sm"}
                                variant={"outline"}
                                disabled={
                                    selectedCharacters.includes("all") ||
                                    selectedCharacters.includes("various")
                                }
                                className={`min-w-36 flex items-center gap-1`}
                                onClick={() =>
                                    onInclusiveModeChange(inclusiveMode)
                                }
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
                    <Button variant="outline" size="sm" onClick={onReset}>
                        {t("reset")}
                    </Button>
                    <Button
                        size="sm"
                        onClick={onShuffle}
                        variant={"outline"}
                        title={shuffled ? t("shuffle.off") : t("shuffle.on")}
                        aria-label={
                            shuffled ? t("shuffle.off") : t("shuffle.on")
                        }
                        className={`${shuffled ? "bg-accent text-accent-foreground" : ""}`}
                    >
                        <Shuffle className="w-4 h-4" />
                    </Button>
                </div>

                <div className="ml-auto text-sm text-muted-foreground">
                    {t("items", { val: totalItems })}
                </div>
            </div>
        </div>
    );
};

export default FanartFilters;
