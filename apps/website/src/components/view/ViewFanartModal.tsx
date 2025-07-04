import fanartData from "#/fanart.json";
import { LS_FANART_MODAL_HEADER_COLLAPSED } from "@/lib/constants";
import {
    CHARACTER_ORDER,
    getCharacterIdNameMap,
    sortByPredefinedOrder,
} from "@/lib/misc";
import { getBlurDataURL } from "@/lib/utils";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@enreco-archive/common-ui/components/tooltip";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, ExternalLink, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ViewLightbox from "./ViewLightbox";

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
    initialCharacter?: string;
}

interface CollapseButtonProps {
    isCollapsed: boolean;
    onClick: () => void;
    className?: string;
}

interface MasonryColumn {
    items: Array<{ entry: FanartEntry; index: number }>;
    height: number;
}

const CollapseButton = ({
    isCollapsed,
    onClick,
    className,
}: CollapseButtonProps) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger
                    asChild
                    onClick={onClick}
                    className={cn(
                        "bg-background border border-border rounded-full flex items-center justify-center hover:opacity-100 opacity-70 transition-colors z-10 cursor-pointer p-1",
                        className,
                    )}
                >
                    <ChevronUp
                        className={cn(
                            "transition-transform duration-200 size-8",
                            isCollapsed ? "rotate-180" : "rotate-0",
                        )}
                    />
                </TooltipTrigger>
                <TooltipContent side="right">
                    {isCollapsed ? "Expand header" : "Collapse header"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const ViewFanartModal = ({
    open,
    onOpenChange,
    chapter,
    day,
    initialCharacter = "all",
}: ViewFanartModalProps) => {
    // MULTI-SELECT: selectedCharacters is an array of character ids, or ["all"]
    const [selectedCharacters, setSelectedCharacters] = useState<string[]>(
        initialCharacter && initialCharacter !== "all" ? [initialCharacter] : ["all"]
    );
    const [selectedChapter, setSelectedChapter] = useState<string>(
        chapter.toString() || "all",
    );
    const [selectedDay, setSelectedDay] = useState<string>(
        day.toString() || "all",
    );
    const contentContainerRef = useRef<HTMLDivElement>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const [currentLightboxEntryIndex, setCurrentLightboxEntryIndex] = useState<
        number | null
    >(null);

    // Header collapse state - persisted in localStorage
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(
                LS_FANART_MODAL_HEADER_COLLAPSED,
            );
            return saved === "true";
        }
        return false;
    });

    // Masonry state
    const [masonryColumns, setMasonryColumns] = useState<MasonryColumn[]>([]);
    const [columnCount, setColumnCount] = useState(3);

    const fanart = useMemo(() => fanartData as FanartEntry[], []);
    const nameMap = useMemo(
        () =>
            getCharacterIdNameMap(
                selectedChapter !== "all" ? parseInt(selectedChapter) : -1,
            ),
        [selectedChapter],
    );

    const characters = useMemo(() => {
        const allCharacters = new Set<string>();
        // only add characters that are in the current chapter
        fanart.forEach((entry) => {
            if (
                entry.chapter === parseInt(selectedChapter) ||
                selectedChapter === "all"
            ) {
                entry.characters.forEach((char) => allCharacters.add(char));
            }
        });
        return sortByPredefinedOrder(
            Array.from(allCharacters),
            CHARACTER_ORDER,
            (char) => char,
            "alphabetical",
        );
    }, [fanart, selectedChapter]);

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
            // MULTI-SELECT: Only show art that includes ALL selected characters (unless "all" is selected)
            const characterMatch =
                selectedCharacters.includes("all") ||
                selectedCharacters.every((char) => entry.characters.includes(char));
            const chapterMatch =
                selectedChapter === "all" ||
                entry.chapter === parseInt(selectedChapter);
            const dayMatch =
                selectedDay === "all" || entry.day === parseInt(selectedDay);
            return characterMatch && chapterMatch && dayMatch;
        });
    }, [selectedCharacters, selectedChapter, selectedDay, fanart]);

    const currentEntry = useMemo(
        () =>
            currentLightboxEntryIndex !== null
                ? filteredFanart[currentLightboxEntryIndex]
                : null,
        [currentLightboxEntryIndex, filteredFanart],
    );

    // Calculate column count based on screen size
    useEffect(() => {
        const updateColumnCount = () => {
            const width = window.innerWidth;
            if (width < 768) setColumnCount(2);
            else if (width < 1024) setColumnCount(3);
            else if (width < 1280) setColumnCount(4);
            else setColumnCount(5);
        };

        updateColumnCount();
        window.addEventListener("resize", updateColumnCount);
        return () => window.removeEventListener("resize", updateColumnCount);
    }, []);

    // Calculate masonry layout
    const calculateMasonryLayout = useCallback(
        (entries: FanartEntry[]) => {
            const columns: MasonryColumn[] = Array.from(
                { length: columnCount },
                () => ({
                    items: [],
                    height: 0,
                }),
            );

            entries.forEach((entry, index) => {
                const firstImage = entry.images[0];
                if (!firstImage) return;

                // Find column with smallest height
                const shortestColumn = columns.reduce(
                    (min, col, i) =>
                        col.height < columns[min].height ? i : min,
                    0,
                );

                // Estimate item height (image height + padding + text)
                const aspectRatio = firstImage.height / firstImage.width;
                const estimatedWidth = 300; // Approximate column width
                const estimatedHeight = estimatedWidth * aspectRatio + 100; // Add padding for text

                columns[shortestColumn].items.push({ entry, index });
                columns[shortestColumn].height += estimatedHeight;
            });

            return columns;
        },
        [columnCount],
    );

    // Update masonry layout when data changes
    useEffect(() => {
        const columns = calculateMasonryLayout(filteredFanart);
        setMasonryColumns(columns);
    }, [filteredFanart, calculateMasonryLayout]);

    const handleNextEntry = useCallback(() => {
        if (currentLightboxEntryIndex !== null) {
            const nextIndex =
                currentLightboxEntryIndex < filteredFanart.length - 1
                    ? currentLightboxEntryIndex + 1
                    : 0;

            // Preload the first image of the next entry before switching
            const nextEntry = filteredFanart[nextIndex];
            if (nextEntry?.images[0]) {
                const img = new window.Image();
                img.src = nextEntry.images[0].src;
                // Switch immediately after starting preload
                setCurrentLightboxEntryIndex(nextIndex);
            } else {
                setCurrentLightboxEntryIndex(nextIndex);
            }
        }
    }, [currentLightboxEntryIndex, filteredFanart]);

    const handlePrevEntry = useCallback(() => {
        if (currentLightboxEntryIndex !== null) {
            const prevIndex =
                currentLightboxEntryIndex > 0
                    ? currentLightboxEntryIndex - 1
                    : filteredFanart.length - 1;

            // Preload the first image of the previous entry before switching
            const prevEntry = filteredFanart[prevIndex];
            if (prevEntry?.images[0]) {
                const img = new window.Image();
                img.src = prevEntry.images[0].src;
                // Switch immediately after starting preload
                setCurrentLightboxEntryIndex(prevIndex);
            } else {
                setCurrentLightboxEntryIndex(prevIndex);
            }
        }
    }, [currentLightboxEntryIndex, filteredFanart]);

    const handleOpenLightbox = useCallback((index: number) => {
        setCurrentLightboxEntryIndex(index);
        setIsLightboxOpen(true);
    }, []);

    const handleCloseLightbox = useCallback(() => {
        setIsLightboxOpen(false);
    }, []);

    const resetFilters = useCallback(() => {
        setSelectedCharacters(["all"]);
        setSelectedChapter("all");
        setSelectedDay("all");
    }, []);

    // Save collapse state to localStorage
    useEffect(() => {
        localStorage.setItem(
            LS_FANART_MODAL_HEADER_COLLAPSED,
            isHeaderCollapsed.toString(),
        );
    }, [isHeaderCollapsed]);

    // Add preloading effect for adjacent entries
    useEffect(() => {
        if (currentLightboxEntryIndex !== null && isLightboxOpen) {
            // Preload next and previous entry images
            const nextIndex =
                currentLightboxEntryIndex < filteredFanart.length - 1
                    ? currentLightboxEntryIndex + 1
                    : 0;
            const prevIndex =
                currentLightboxEntryIndex > 0
                    ? currentLightboxEntryIndex - 1
                    : filteredFanart.length - 1;

            [nextIndex, prevIndex].forEach((index) => {
                const entry = filteredFanart[index];
                if (entry?.images[0]) {
                    const img = new window.Image();
                    img.src = entry.images[0].src;
                }
            });
        }
    }, [currentLightboxEntryIndex, filteredFanart, isLightboxOpen]);

    // Reset scroll position when filters change
    useEffect(() => {
        if (contentContainerRef.current) {
            contentContainerRef.current.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }, [selectedCharacters, selectedChapter, selectedDay]);

    useEffect(() => {
        setSelectedDay("all");
    }, [selectedChapter]);


    // If initialCharacter changes (e.g. modal is opened for a new node), update selectedCharacter
    useEffect(() => {
        setSelectedCharacters(
            initialCharacter && initialCharacter !== "all"
                ? [initialCharacter]
                : ["all"]
        );
    }, [initialCharacter, open]);

    // if any selected character is not in the current chapter, reset to "all"
    useEffect(() => {
        if (
            !selectedCharacters.includes("all") &&
            selectedCharacters.some((char) => !characters.includes(char))
        ) {
            setSelectedCharacters(["all"]);
        }
    }, [selectedCharacters, characters]);

    useEffect(() => {
        setSelectedDay(day.toString() || "all");
    }, [day]);

    // Close lightbox when modal closes
    useEffect(() => {
        if (!open) {
            setCurrentLightboxEntryIndex(null);
        }
    }, [open]);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className="max-w-7xl md:h-[90vh] h-[80vh] flex flex-col gap-2 md:gap-4"
                    showXButtonForce={true}
                    showXButton={true}
                >
                    {/* Collapsible Header */}
                    <div className="relative">
                        {/* Header Content */}
                        <div
                            className={cn(
                                "overflow-hidden transition-all duration-300 ease-in-out",
                                isHeaderCollapsed
                                    ? "max-h-0 opacity-0"
                                    : "max-h-96 opacity-100",
                            )}
                        >
                            <div className="pb-4">
                                <DialogHeader className="space-y-0 mb-4">
                                    <DialogTitle>
                                        <div className="w-full justify-center md:justify-normal mx-auto md:mx-0 flex gap-2 items-center">
                                            <CollapseButton
                                                isCollapsed={isHeaderCollapsed}
                                                onClick={() =>
                                                    setIsHeaderCollapsed(
                                                        !isHeaderCollapsed,
                                                    )
                                                }
                                                className="shrink-0"
                                            />
                                            <span>Fanart Gallery</span>
                                        </div>
                                    </DialogTitle>
                                    <DialogDescription className="sr-only">
                                        Browse community fanart from the ENreco
                                        series
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
                                                    onValueChange={
                                                        setSelectedDay
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">
                                                            All
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
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-muted-foreground">
                                                    Chapter
                                                </label>
                                                <Select
                                                    value={selectedChapter}
                                                    onValueChange={
                                                        setSelectedChapter
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">
                                                            All
                                                        </SelectItem>
                                                        {chapters.map(
                                                            (chapter) => (
                                                                <SelectItem
                                                                    key={
                                                                        chapter
                                                                    }
                                                                    value={chapter.toString()}
                                                                >
                                                                    {chapter +
                                                                        1}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-between gap-2">
                                            <div className="flex-1">
                                                <label className="text-xs font-medium text-muted-foreground">
                                                    Character
                                                </label>
                                                {/* MULTI-SELECT: Replace Select with toggle buttons for each character */}
                                                <div className="flex flex-wrap gap-1">
                                                    <label className="text-xs font-medium text-muted-foreground w-full">Characters</label>
                                                    <button
                                                        type="button"
                                                        className={`px-2 py-1 rounded border text-xs ${selectedCharacters.includes("all") ? "bg-accent border-accent-foreground text-accent-foreground" : "bg-background border-border"}`}
                                                        onClick={() => setSelectedCharacters(["all"])}
                                                    >
                                                        All
                                                    </button>
                                                    {characters.map((character) => (
                                                        <button
                                                            type="button"
                                                            key={character}
                                                            className={`px-2 py-1 rounded border text-xs ${selectedCharacters.includes(character) ? "bg-accent border-accent-foreground text-accent-foreground" : "bg-background border-border"}`}
                                                            onClick={() => {
                                                                if (selectedCharacters.includes("all")) {
                                                                    setSelectedCharacters([character]);
                                                                } else if (selectedCharacters.includes(character)) {
                                                                    const next = selectedCharacters.filter((c) => c !== character);
                                                                    setSelectedCharacters(next.length === 0 ? ["all"] : next);
                                                                } else {
                                                                    setSelectedCharacters([...selectedCharacters, character]);
                                                                }
                                                            }}
                                                        >
                                                            {nameMap[character] || character.charAt(0).toUpperCase() + character.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
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
                                                    {filteredFanart.length}{" "}
                                                    items
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
                                            {/* MULTI-SELECT: Desktop version */}
                                            <div className="flex flex-wrap gap-1">
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 rounded border text-xs ${selectedCharacters.includes("all") ? "bg-accent border-accent-foreground text-accent-foreground" : "bg-background border-border"}`}
                                                    onClick={() => setSelectedCharacters(["all"])}
                                                >
                                                    All
                                                </button>
                                                {characters.map((character) => (
                                                    <button
                                                        type="button"
                                                        key={character}
                                                        className={`px-2 py-1 rounded border text-xs ${selectedCharacters.includes(character) ? "bg-accent border-accent-foreground text-accent-foreground" : "bg-background border-border"}`}
                                                        onClick={() => {
                                                            if (selectedCharacters.includes("all")) {
                                                                setSelectedCharacters([character]);
                                                            } else if (selectedCharacters.includes(character)) {
                                                                const next = selectedCharacters.filter((c) => c !== character);
                                                                setSelectedCharacters(next.length === 0 ? ["all"] : next);
                                                            } else {
                                                                setSelectedCharacters([...selectedCharacters, character]);
                                                            }
                                                        }}
                                                    >
                                                        {nameMap[character] || character.charAt(0).toUpperCase() + character.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium">
                                                Chapter:
                                            </label>
                                            <Select
                                                value={selectedChapter}
                                                onValueChange={
                                                    setSelectedChapter
                                                }
                                            >
                                                <SelectTrigger className="w-[100px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All
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
                                            <label className="text-sm font-medium">
                                                Day:
                                            </label>
                                            <Select
                                                value={selectedDay}
                                                onValueChange={setSelectedDay}
                                            >
                                                <SelectTrigger className="w-[100px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All
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
                            </div>
                        </div>

                        {/* Collapse button when header is collapsed - positioned absolutely */}
                        {isHeaderCollapsed && (
                            <CollapseButton
                                isCollapsed={isHeaderCollapsed}
                                onClick={() => setIsHeaderCollapsed(false)}
                                className="absolute top-0 left-0"
                            />
                        )}
                    </div>

                    {/* Masonry Grid */}
                    <div
                        className="flex-1 overflow-y-auto"
                        ref={contentContainerRef}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${selectedCharacters.join(",")}-${selectedChapter}-${selectedDay}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.125 }}
                                className="flex gap-4 items-start"
                                style={{ minHeight: "fit-content" }}
                            >
                                {masonryColumns.map((column, columnIndex) => (
                                    <div
                                        key={columnIndex}
                                        className="flex-1 flex flex-col"
                                    >
                                        {column.items.map(
                                            ({ entry, index }) => {
                                                const firstImage =
                                                    entry.images[0];
                                                const thumbnailSrc =
                                                    firstImage.src.replace(
                                                        "-opt.webp",
                                                        "-opt-thumb.webp",
                                                    );

                                                return (
                                                    <div
                                                        className="relative group bg-muted rounded-lg overflow-hidden cursor-pointer break-inside-avoid mb-4"
                                                        key={`${entry.url}-${index}`}
                                                        onClick={() =>
                                                            handleOpenLightbox(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <Image
                                                            src={thumbnailSrc}
                                                            alt={entry.label}
                                                            width={
                                                                firstImage.width
                                                            }
                                                            height={
                                                                firstImage.height
                                                            }
                                                            className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                                                            placeholder={
                                                                getBlurDataURL(
                                                                    thumbnailSrc,
                                                                )
                                                                    ? "blur"
                                                                    : "empty"
                                                            }
                                                            blurDataURL={getBlurDataURL(
                                                                thumbnailSrc,
                                                            )}
                                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                                                        />

                                                        {/* Image count badge */}
                                                        {entry.images.length >
                                                            1 && (
                                                            <div className="flex item-center gap-1 absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
                                                                <ImageIcon
                                                                    size={16}
                                                                />
                                                                <span>
                                                                    {
                                                                        entry
                                                                            .images
                                                                            .length
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Mobile - always visible full info */}
                                                        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                            <div className="text-white flex flex-col min-h-0">
                                                                <div className="flex-1 min-h-0 overflow-hidden">
                                                                    <p className="text-white text-xs font-semibold line-clamp-1 mb-0.5">
                                                                        {
                                                                            entry.label
                                                                        }
                                                                    </p>
                                                                    <p className="text-white/80 text-xs mb-1 line-clamp-1">
                                                                        by{" "}
                                                                        {
                                                                            entry.author
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center justify-between flex-shrink-0">
                                                                    <div className="flex gap-1 text-xs min-w-0">
                                                                        <div className="text-xs text-white whitespace-nowrap truncate">
                                                                            Ch.{" "}
                                                                            {entry.chapter +
                                                                                1}{" "}
                                                                            Day{" "}
                                                                            {entry.day +
                                                                                1}
                                                                        </div>
                                                                    </div>
                                                                    <a
                                                                        className="px-1.5 py-1 border-white/30 rounded-lg border stroke-white flex items-center justify-center hover:bg-white/20 pointer-events-auto flex-shrink-0 ml-2"
                                                                        href={
                                                                            entry.url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={(
                                                                            e,
                                                                        ) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                    >
                                                                        <ExternalLink className="size-3 stroke-inherit" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Desktop - hover overlay with full info */}
                                                        <div className="hidden md:flex flex-col absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors justify-end p-3 opacity-0 group-hover:opacity-100 pointer-events-none">
                                                            <div className="text-white flex flex-col min-h-0">
                                                                <div className="flex-1 min-h-0 overflow-hidden">
                                                                    <p className="font-semibold text-sm line-clamp-1 mb-1">
                                                                        {
                                                                            entry.label
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-white/80 mb-2 line-clamp-1">
                                                                        by{" "}
                                                                        {
                                                                            entry.author
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center justify-between flex-shrink-0">
                                                                    <div className="flex gap-1 text-xs min-w-0">
                                                                        <div className="text-xs text-white whitespace-nowrap truncate">
                                                                            Ch.{" "}
                                                                            {entry.chapter +
                                                                                1}{" "}
                                                                            Day{" "}
                                                                            {entry.day +
                                                                                1}
                                                                        </div>
                                                                    </div>
                                                                    <a
                                                                        className="px-2 py-1 border-white/30 rounded-lg border stroke-white flex items-center justify-center hover:bg-white/20 pointer-events-auto flex-shrink-0 ml-2"
                                                                        href={
                                                                            entry.url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={(
                                                                            e,
                                                                        ) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                    >
                                                                        <ExternalLink className="size-4 stroke-inherit" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                ))}
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

            {/* Centralized Lightbox, need this to support keyboard entry switching */}
            {currentEntry && (
                <ViewLightbox
                    src={currentEntry.images[0].src}
                    alt={currentEntry.label}
                    width={currentEntry.images[0].width}
                    height={currentEntry.images[0].height}
                    galleryImages={currentEntry.images.map((img) => ({
                        src: img.src,
                        alt: currentEntry.label + " by " + currentEntry.author,
                    }))}
                    priority={true}
                    alwaysShowNavigationArrows={true}
                    galleryIndex={0}
                    authorSrc={currentEntry.url}
                    onNextEnd={handleNextEntry}
                    onPrevEnd={handlePrevEntry}
                    isExternallyControlled={true}
                    externalIsOpen={isLightboxOpen}
                    onExternalClose={handleCloseLightbox}
                />
            )}
        </>
    );
};

export default ViewFanartModal;
