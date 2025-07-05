import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { Button } from "@enreco-archive/common-ui/components/button";
import CharacterSelector from "@/components/view/fanart/CharacterSelector";

interface FanartFiltersProps {
    selectedCharacters: string[];
    selectedChapter: string;
    selectedDay: string;
    characters: string[];
    chapters: number[];
    days: number[];
    nameMap: Record<string, string>;
    onCharactersChange: (characters: string[]) => void;
    onChapterChange: (chapter: string) => void;
    onDayChange: (day: string) => void;
    onReset: () => void;
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
    onCharactersChange,
    onChapterChange,
    onDayChange,
    onReset,
    totalItems,
}: FanartFiltersProps) => {
    return (
        <div className="border-b pb-4">
            {/* Mobile layout */}
            <div className="md:hidden space-y-3">
                <div className="grid grid-cols-2 gap-2">
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
                </div>
                <CharacterSelector
                    selectedCharacters={selectedCharacters}
                    characters={characters}
                    nameMap={nameMap}
                    onCharactersChange={onCharactersChange}
                    mobile={true}
                />
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

                <Button variant="outline" size="sm" onClick={onReset}>
                    Reset Filters
                </Button>

                <div className="ml-auto text-sm text-muted-foreground">
                    {totalItems} items
                </div>
            </div>
        </div>
    );
};

export default FanartFilters;
