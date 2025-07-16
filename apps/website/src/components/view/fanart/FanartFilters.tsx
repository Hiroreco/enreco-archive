import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Shuffle } from "lucide-react";
import CharacterSelector from "@/components/view/fanart/CharacterSelector";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@enreco-archive/common-ui/components/tooltip";
import { Checkbox } from "@enreco-archive/common-ui/components/checkbox";

interface FanartFiltersProps {
    selectedCharacters: string[];
    selectedChapter: string;
    selectedDay: string;
    characters: string[];
    chapters: number[];
    days: number[];
    nameMap: Record<string, string>;
    inclusiveMode: boolean;
    videosOnly: boolean;
    memesOnly?: boolean;
    onCharactersChange: (characters: string[]) => void;
    onChapterChange: (chapter: string) => void;
    onDayChange: (day: string) => void;
    onInclusiveModeChange: (inclusive: boolean) => void;
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
    return (
        <div className="border-b pb-4">
            {/* Mobile layout */}
            <div className="md:hidden space-y-2">
                <div className="grid grid-cols-2 gap-2 px-2">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Chapter
                        </label>
                        <Select
                            value={selectedChapter}
                            onValueChange={onChapterChange}
                        >
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
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
                            Day
                        </label>
                        <Select value={selectedDay} onValueChange={onDayChange}>
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
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

                {/* Mobile checkboxes container */}
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onReset}
                        className="w-full flex items-center justify-center h-6 text-xs"
                    >
                        Reset Filters
                    </Button>
                    <Button
                        variant={shuffled ? "default" : "outline"}
                        size="sm"
                        onClick={onShuffle}
                        title={shuffled ? "Unshuffle" : "Shuffle"}
                        aria-label={shuffled ? "Unshuffle" : "Shuffle"}
                        className="w-full flex items-center justify-center h-6 text-xs"
                    >
                        <Shuffle className="w-4 h-4 mr-1" />
                        {shuffled ? "Unshuffle" : "Shuffle"}
                    </Button>
                    {/* Videos Only checkbox */}
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
                            Videos Only
                        </label>
                    </div>

                    {selectedCharacters.includes("all") ||
                    selectedCharacters.includes("various") ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="inclusive-mobile"
                                        checked={inclusiveMode}
                                        onCheckedChange={(checked) =>
                                            onInclusiveModeChange(
                                                checked === true,
                                            )
                                        }
                                        disabled={true}
                                    />
                                    <label
                                        htmlFor="inclusive-mobile"
                                        className="text-xs font-medium text-muted-foreground"
                                    >
                                        Inclusive Characters
                                    </label>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                Can not turn on inclusive mode if “All” or
                                “Various” is selected
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="inclusive-mobile"
                                checked={inclusiveMode}
                                onCheckedChange={(checked) =>
                                    onInclusiveModeChange(checked === true)
                                }
                            />
                            <label
                                htmlFor="inclusive-mobile"
                                className="text-xs font-medium text-muted-foreground"
                            >
                                Inclusive Characters
                            </label>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="dna-of-the-souls-mobile"
                            checked={memesOnly}
                            onCheckedChange={(checked) =>
                                onMemesOnlyChange(checked === true)
                            }
                        />
                        <label
                            htmlFor="dna-of-the-souls-mobile"
                            className="text-xs font-medium text-muted-foreground"
                        >
                            DNA of the Souls
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
                    <label className="text-sm font-medium">Chapter:</label>
                    <Select
                        value={selectedChapter}
                        onValueChange={onChapterChange}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
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
                    <label className="text-sm font-medium">Day:</label>
                    <Select value={selectedDay} onValueChange={onDayChange}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {days.map((day) => (
                                <SelectItem key={day} value={day.toString()}>
                                    {day + 1}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Videos Only checkbox */}
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
                        Videos Only
                    </label>
                </div>

                {/* Desktop inclusive checkbox */}
                {selectedCharacters.includes("all") ||
                selectedCharacters.includes("various") ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="inclusive-desktop"
                                    checked={inclusiveMode}
                                    onCheckedChange={(checked) =>
                                        onInclusiveModeChange(checked === true)
                                    }
                                    disabled={true}
                                />
                                <label
                                    htmlFor="inclusive-desktop"
                                    className="text-sm font-medium"
                                >
                                    Inclusive
                                </label>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            Can not turn on inclusive mode if “All” or “Various”
                            is selected
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="inclusive-desktop"
                            checked={inclusiveMode}
                            onCheckedChange={(checked) =>
                                onInclusiveModeChange(checked === true)
                            }
                        />
                        <label
                            htmlFor="inclusive-desktop"
                            className="text-sm font-medium"
                        >
                            Inclusive
                        </label>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="dna-of-the-souls-mobile"
                        checked={memesOnly}
                        onCheckedChange={(checked) =>
                            onMemesOnlyChange(checked === true)
                        }
                    />
                    <label
                        htmlFor="dna-of-the-souls-mobile"
                        className="text-sm font-medium"
                    >
                        DNA of the Souls
                    </label>
                </div>

                <div className="flex flex-row gap-2 items-center">
                    <Button variant="outline" size="sm" onClick={onReset}>
                        Reset Filters
                    </Button>
                    <Button
                        size="sm"
                        onClick={onShuffle}
                        variant={"outline"}
                        title={shuffled ? "Unshuffle" : "Shuffle"}
                        aria-label={shuffled ? "Unshuffle" : "Shuffle"}
                        className={`${shuffled ? "bg-accent text-accent-foreground" : ""}`}
                    >
                        <Shuffle className="w-4 h-4" />
                    </Button>
                </div>

                <div className="ml-auto text-sm text-muted-foreground">
                    {totalItems} items
                </div>
            </div>
        </div>
    );
};

export default FanartFilters;
