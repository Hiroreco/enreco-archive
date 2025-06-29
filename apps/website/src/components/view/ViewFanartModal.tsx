import fanartData from "#/fanart.json";
import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { ExternalLink, Image } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ViewLightbox from "./ViewLightbox";
import { getCharacterIdNameMap } from "@/lib/misc";
import { AnimatePresence, motion } from "framer-motion";

interface FanartEntry {
    url: string;
    label: string;
    author: string;
    chapter: number;
    day: number;
    characters: string[];
    images: {
        src: string;
        width: number;
        height: number;
    }[];
}

interface ViewFanartModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    chapter: number;
    day: number;
}

const ViewFanartModal = ({
    open,
    onOpenChange,
    chapter,
    day,
}: ViewFanartModalProps) => {
    const [selectedCharacter, setSelectedCharacter] = useState<string>("all");
    const [selectedChapter, setSelectedChapter] = useState<string>(
        chapter.toString() || "all",
    );
    const [selectedDay, setSelectedDay] = useState<string>(
        day.toString() || "all",
    );
    const contentContainerRef = useRef<HTMLDivElement>(null);

    const fanart = fanartData as FanartEntry[];
    const nameMap = getCharacterIdNameMap(chapter);

    // Get unique values for filters
    const characters = useMemo(() => {
        const allCharacters = new Set<string>();
        fanart.forEach((entry) => {
            entry.characters.forEach((char) => allCharacters.add(char));
        });
        return Array.from(allCharacters).sort();
    }, [fanart]);

    const chapters = useMemo(() => {
        const allChapters = new Set<number>();
        fanart.forEach((entry) => allChapters.add(entry.chapter));
        return Array.from(allChapters).sort((a, b) => a - b);
    }, [fanart]);

    const days = useMemo(() => {
        const allDays = new Set<number>();
        fanart.forEach((entry) => allDays.add(entry.day));
        return Array.from(allDays).sort((a, b) => a - b);
    }, [fanart]);

    // Filter fanart based on selected filters
    const filteredFanart = useMemo(() => {
        return fanart.filter((entry) => {
            const characterMatch =
                selectedCharacter === "all" ||
                entry.characters.includes(selectedCharacter);
            const chapterMatch =
                selectedChapter === "all" ||
                entry.chapter === parseInt(selectedChapter);
            const dayMatch =
                selectedDay === "all" || entry.day === parseInt(selectedDay);

            return characterMatch && chapterMatch && dayMatch;
        });
    }, [selectedCharacter, selectedChapter, selectedDay, fanart]);

    const resetFilters = () => {
        setSelectedCharacter("all");
        setSelectedChapter("all");
        setSelectedDay("all");
    };

    useEffect(() => {
        if (contentContainerRef.current) {
            contentContainerRef.current.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }, [selectedCharacter, selectedChapter, selectedDay]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-7xl h-[90vh] flex flex-col gap-2 md:gap-4"
                showXButtonForce={true}
                showXButton={true}
            >
                <DialogHeader className="space-y-0">
                    <DialogTitle className="">Fanart Gallery</DialogTitle>
                    <DialogDescription className="sr-only">
                        Browse community fanart from the ENreco series
                    </DialogDescription>
                </DialogHeader>

                {/* Filters */}
                <div className="border-b pb-4">
                    {/* Mobile layout */}
                    <div className="md:hidden space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Day
                                </label>
                                <Select
                                    value={selectedDay}
                                    onValueChange={setSelectedDay}
                                >
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
                                    onValueChange={setSelectedChapter}
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
                        <div className="flex items-end justify-between gap-2">
                            <div className="flex-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Character
                                </label>
                                <Select
                                    value={selectedCharacter}
                                    onValueChange={setSelectedCharacter}
                                >
                                    <SelectTrigger className="h-8 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {characters.map((character) => (
                                            <SelectItem
                                                key={character}
                                                value={character}
                                            >
                                                {nameMap[character] ||
                                                    character
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        character.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={resetFilters}
                                >
                                    Reset
                                </Button>
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                    {filteredFanart.length} items
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden md:flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">
                                Character:
                            </label>
                            <Select
                                value={selectedCharacter}
                                onValueChange={setSelectedCharacter}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {characters.map((character) => (
                                        <SelectItem
                                            key={character}
                                            value={character}
                                        >
                                            {nameMap[character] ||
                                                character
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    character.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">
                                Chapter:
                            </label>
                            <Select
                                value={selectedChapter}
                                onValueChange={setSelectedChapter}
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
                            <Select
                                value={selectedDay}
                                onValueChange={setSelectedDay}
                            >
                                <SelectTrigger className="w-[100px]">
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

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                        >
                            Reset Filters
                        </Button>

                        <div className="ml-auto text-sm text-muted-foreground">
                            {filteredFanart.length} items
                        </div>
                    </div>
                </div>

                {/* Masonry Grid */}
                <div
                    className="flex-1 overflow-y-auto"
                    ref={contentContainerRef}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${selectedCharacter}-${selectedChapter}-${selectedDay}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.125 }}
                            className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4"
                        >
                            {filteredFanart.map((entry, index) => {
                                const firstImage = entry.images[0];
                                const thumbnailSrc = firstImage.src.replace(
                                    "-opt.webp",
                                    "-opt-thumb.webp",
                                );
                                const aspectRatio =
                                    firstImage.height / firstImage.width;

                                const galleryImages = entry.images.map(
                                    (img) => ({
                                        src: img.src,
                                        alt: entry.label,
                                    }),
                                );

                                return (
                                    <div
                                        className="relative group bg-muted rounded-lg overflow-hidden"
                                        key={`${entry.url}-${index}`}
                                    >
                                        <ViewLightbox
                                            src={thumbnailSrc}
                                            alt={entry.label}
                                            width={300}
                                            height={300 * aspectRatio}
                                            className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                                            galleryImages={galleryImages}
                                            galleryIndex={0}
                                            authorSrc={entry.url}
                                        />

                                        {/* Image count badge - always visible*/}
                                        {entry.images.length > 1 && (
                                            <div className="flex item-center gap-1 absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
                                                <Image size={16} />
                                                <span>
                                                    {entry.images.length}
                                                </span>
                                            </div>
                                        )}

                                        {/* Overlay with info - pointer events disabled except for button */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 pointer-events-none">
                                            <div className="text-white">
                                                <p className="font-semibold text-sm line-clamp-2 mb-1">
                                                    {entry.label}
                                                </p>
                                                <p className="text-xs text-white/80 mb-2">
                                                    by {entry.author}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-1 text-xs">
                                                        <div className="text-xs h-5 border-white/30 text-white">
                                                            Ch.
                                                            {entry.chapter +
                                                                1}{" "}
                                                            Day {entry.day + 1}
                                                        </div>
                                                    </div>
                                                    <a
                                                        className="px-2 py-1 border-white/30 rounded-lg border stroke-white flex items-center justify-center hover:bg-white/20 pointer-events-auto"
                                                        href={entry.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <ExternalLink className="size-4 stroke-inherit" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>

                    {filteredFanart.length === 0 && (
                        <div className="flex items-center justify-center h-full text-center">
                            <div>
                                <p className="text-lg font-medium text-muted-foreground mb-2">
                                    No fanart found
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Try adjusting your filters to see more
                                    results
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewFanartModal;
