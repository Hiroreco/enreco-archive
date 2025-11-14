import CharacterSelector from "@/components/view/fanart/CharacterSelector";
import { InclusiveMode, SortMode } from "@/components/view/fanart/FanartModal";
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
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { Shuffle } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import CollapsibleHeader from "./CollapsibleHeader";

interface FanartFiltersProps {
    selectedCharacters: string[];
    selectedChapter: string;
    selectedDay: string;
    characters: string[];
    chapters: number[];
    days: number[];
    nameMap: Record<string, string>;
    inclusiveMode: InclusiveMode;
    sortMode: SortMode;
    videosOnly: boolean;
    memesOnly?: boolean;
    onCharactersChange: (characters: string[]) => void;
    onChapterChange: (chapter: string) => void;
    onDayChange: (day: string) => void;
    onInclusiveModeChange: (currentMode: InclusiveMode) => void;
    onSortModeChange: (currentMode: SortMode) => void;
    onVideosOnlyChange: (videosOnly: boolean) => void;
    onMemesOnlyChange: (memesOnly: boolean) => void;
    onReset: () => void;
    onShuffle: () => void;
    shuffled: boolean;
    totalItems: number;
    isCollapsed: boolean;
    isPinned: boolean;
    onTogglePin: () => void;
    onToggleCollapse: () => void;
}

export const CHARACTER_ICON_MAP: Record<string, string> = {
    all: "node-lore-opt.webp",
    various: "node-lore-opt.webp",
    bloodraven: "cat-bloodraven-opt.webp",
    gura: "node-gura-opt.webp",
    ina: "node-ina-opt.webp",
    kiara: "node-kiara-opt.webp",
    ame: "node-ame-opt.webp",
    calli: "node-calli-opt.webp",
    bae: "node-bae-opt.webp",
    kronii: "node-kronii-opt.webp",
    irys: "node-irys-opt.webp",
    fauna: "node-fauna-opt.webp",
    moom: "node-mumei-opt.webp",
    fuwawa: "node-fuwawa-opt.webp",
    mococo: "node-mococo-opt.webp",
    shiori: "node-shiori-opt.webp",
    nerissa: "node-nerissa-opt.webp",
    bijou: "node-bijou-opt.webp",
    cecilia: "node-cecilia-opt.webp",
    liz: "node-liz-opt.webp",
    raora: "node-raora-opt.webp",
    gigi: "node-gigi-opt.webp",
    iphania: "node-iphania-opt.webp",
};

const FanartFilters = ({
    selectedCharacters,
    selectedChapter,
    selectedDay,
    characters,
    chapters,
    days,
    nameMap,
    inclusiveMode,
    sortMode,
    videosOnly,
    memesOnly,
    onCharactersChange,
    onChapterChange,
    onDayChange,
    onInclusiveModeChange,
    onSortModeChange,
    onVideosOnlyChange,
    onMemesOnlyChange,
    onReset,
    onShuffle,
    shuffled,
    isCollapsed,
    isPinned,
    onTogglePin,
    onToggleCollapse,
}: FanartFiltersProps) => {
    const t = useTranslations("modals.art");

    const handleCharacterClick = (character: string) => {
        if (
            character === "all" ||
            character === "various" ||
            character === "bloodraven"
        ) {
            onCharactersChange([character]);
        } else if (
            selectedCharacters.includes("all") ||
            selectedCharacters.includes("various") ||
            selectedCharacters.includes("bloodraven")
        ) {
            onCharactersChange([character]);
        } else if (selectedCharacters.includes(character)) {
            const next = selectedCharacters.filter((c) => c !== character);
            onCharactersChange(next.length === 0 ? ["all"] : next);
        } else {
            onCharactersChange([...selectedCharacters, character]);
        }
    };

    const handleBloodravenClick = () => {
        if (selectedCharacters.includes("bloodraven")) {
            onCharactersChange(["all"]);
        } else {
            onCharactersChange(["bloodraven"]);
        }
    };

    const getCharacterName = (character: string) => {
        return (
            nameMap[character] ||
            character.charAt(0).toUpperCase() + character.slice(1)
        );
    };

    return (
        <>
            {/* Desktop layout */}
            <div className="hidden md:flex h-full gap-2 flex-col">
                <p className="text-sm font-semibold">{t("character")}</p>
                <div className="flex flex-col gap-2 w-48 overflow-y-auto pr-1 py-2 border-y">
                    <button
                        type="button"
                        onClick={() => onCharactersChange(["all"])}
                        className={cn(
                            "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            "hover:bg-foreground/10 flex items-center gap-2",
                            selectedCharacters.includes("all") &&
                                "bg-foreground/20 font-semibold",
                        )}
                    >
                        <Image
                            src={`images-opt/${CHARACTER_ICON_MAP["all"]}`}
                            alt="all"
                            width={25}
                            height={25}
                            className="rounded-md object-cover"
                        />
                        {t("charFilter.all")}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleCharacterClick("various")}
                        className={cn(
                            "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            "hover:bg-foreground/10 flex items-center gap-2",
                            selectedCharacters.includes("various") &&
                                "bg-foreground/20 font-semibold",
                        )}
                    >
                        <Image
                            src={`images-opt/${CHARACTER_ICON_MAP["various"]}`}
                            alt="various"
                            width={25}
                            height={25}
                            className="rounded-md object-cover"
                        />
                        {t("charFilter.various")}
                    </button>
                    <button
                        type="button"
                        onClick={handleBloodravenClick}
                        className={cn(
                            "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            "hover:bg-foreground/10 flex items-center gap-2",
                            selectedCharacters.includes("bloodraven") &&
                                "bg-foreground/20 font-semibold",
                        )}
                    >
                        <Image
                            src={`images-opt/${CHARACTER_ICON_MAP["bloodraven"]}`}
                            alt="bloodraven"
                            width={25}
                            height={25}
                            className="rounded-md object-cover"
                        />
                        {t("charFilter.bloodraven")}
                    </button>
                    {characters.map((character) => (
                        <button
                            type="button"
                            key={character}
                            onClick={() => handleCharacterClick(character)}
                            className={cn(
                                "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                "hover:bg-foreground/10 flex items-center gap-2",
                                selectedCharacters.includes(character) &&
                                    "bg-foreground/20 font-semibold",
                            )}
                        >
                            <Image
                                src={`images-opt/${CHARACTER_ICON_MAP[character]}`}
                                alt={character}
                                width={25}
                                height={25}
                                className="rounded-md object-cover"
                            />
                            {getCharacterName(character)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile layout */}
            <CollapsibleHeader
                isCollapsed={isCollapsed}
                isPinned={isPinned}
                onTogglePin={onTogglePin}
                onToggleCollapse={onToggleCollapse}
            >
                <div className="md:hidden space-y-2 border-b pb-2">
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
                            <Select
                                value={selectedDay}
                                onValueChange={onDayChange}
                            >
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

                    <div className="grid grid-cols-2 gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    id="fanart-inclusive-mode-mobile"
                                    size={"sm"}
                                    variant={"outline"}
                                    disabled={
                                        selectedCharacters.includes("all") ||
                                        selectedCharacters.includes(
                                            "various",
                                        ) ||
                                        selectedCharacters.includes(
                                            "bloodraven",
                                        )
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
                                        {t(
                                            `inclusiveModes.${inclusiveMode}.label`,
                                        )}
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {t(
                                    `inclusiveModes.${inclusiveMode}.description`,
                                )}
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    id="fanart-sort-mode-mobile"
                                    size={"sm"}
                                    variant={"outline"}
                                    onClick={() => onSortModeChange(sortMode)}
                                    aria-label={t(
                                        `sortModes.${sortMode}.description`,
                                    )}
                                    className={`h-6 text-xs flex items-center gap-1`}
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

                        <Button
                            variant={shuffled ? "default" : "outline"}
                            size="sm"
                            onClick={onShuffle}
                            title={
                                shuffled ? t("shuffle.off") : t("shuffle.on")
                            }
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
            </CollapsibleHeader>
        </>
    );
};

export default FanartFilters;
