import fanartData from "#/fanart.json";
import CollapsibleHeader from "@/components/view/fanart/CollapsibleHeader";
import FanartFilters from "@/components/view/fanart/FanartFilters";
import FanartMasonryGrid from "@/components/view/fanart/FanartMasonryGrid";
import ViewLightbox from "@/components/view/ViewLightbox";
import { LS_FANART_MODAL_HEADER_COLLAPSED } from "@/lib/constants";
import {
    CHARACTER_ORDER,
    getCharacterIdNameMap,
    sortByPredefinedOrder,
} from "@/lib/misc";
import {
    Dialog,
    DialogContent,
} from "@enreco-archive/common-ui/components/dialog";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

interface MasonryColumn {
    items: Array<{ entry: FanartEntry; index: number }>;
    height: number;
}

const ViewFanartModal = ({
    open,
    onOpenChange,
    chapter,
    day,
    initialCharacter = "all",
}: ViewFanartModalProps) => {
    // State
    const [selectedCharacters, setSelectedCharacters] = useState<string[]>([
        initialCharacter,
    ]);
    const [selectedChapter, setSelectedChapter] = useState<string>(
        chapter.toString() || "all",
    );
    const [selectedDay, setSelectedDay] = useState<string>(
        day.toString() || "all",
    );
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentLightboxEntryIndex, setCurrentLightboxEntryIndex] = useState<
        number | null
    >(null);
    const [masonryColumns, setMasonryColumns] = useState<MasonryColumn[]>([]);
    const [columnCount, setColumnCount] = useState(3);

    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(
                LS_FANART_MODAL_HEADER_COLLAPSED,
            );
            return saved === "true";
        }
        return false;
    });

    const contentContainerRef = useRef<HTMLDivElement>(null);
    const fanart = useMemo(() => fanartData as FanartEntry[], []);

    // Derived state
    const nameMap = useMemo(
        () =>
            getCharacterIdNameMap(
                selectedChapter !== "all" ? parseInt(selectedChapter) : -1,
            ),
        [selectedChapter],
    );

    const characters = useMemo(() => {
        const allCharacters = new Set<string>();
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

    const filteredFanart = useMemo(() => {
        return fanart.filter((entry) => {
            let characterMatch = false;

            if (selectedCharacters.includes("all")) {
                characterMatch = true;
            } else if (selectedCharacters.includes("various")) {
                characterMatch = entry.characters.length > 1;
            } else {
                characterMatch = selectedCharacters.some((char) =>
                    entry.characters.includes(char),
                );
            }

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

    // Handlers
    const resetFilters = useCallback(() => {
        setSelectedCharacters(["all"]);
        setSelectedChapter("all");
        setSelectedDay("all");
    }, []);

    const handleOpenLightbox = useCallback((index: number) => {
        setCurrentLightboxEntryIndex(index);
        setIsLightboxOpen(true);
    }, []);

    const handleCloseLightbox = useCallback(() => {
        setIsLightboxOpen(false);
    }, []);

    const handleNextEntry = useCallback(() => {
        if (currentLightboxEntryIndex !== null) {
            const nextIndex =
                currentLightboxEntryIndex < filteredFanart.length - 1
                    ? currentLightboxEntryIndex + 1
                    : 0;
            const nextEntry = filteredFanart[nextIndex];
            if (nextEntry?.images[0]) {
                const img = new window.Image();
                img.src = nextEntry.images[0].src;
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
            const prevEntry = filteredFanart[prevIndex];
            if (prevEntry?.images[0]) {
                const img = new window.Image();
                img.src = prevEntry.images[0].src;
                setCurrentLightboxEntryIndex(prevIndex);
            } else {
                setCurrentLightboxEntryIndex(prevIndex);
            }
        }
    }, [currentLightboxEntryIndex, filteredFanart]);

    // Masonry layout calculation
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

                const shortestColumn = columns.reduce(
                    (min, col, i) =>
                        col.height < columns[min].height ? i : min,
                    0,
                );
                const aspectRatio = firstImage.height / firstImage.width;
                const estimatedWidth = 300;
                const estimatedHeight = estimatedWidth * aspectRatio + 100;

                columns[shortestColumn].items.push({ entry, index });
                columns[shortestColumn].height += estimatedHeight;
            });

            return columns;
        },
        [columnCount],
    );

    // Effects
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

    useEffect(() => {
        const columns = calculateMasonryLayout(filteredFanart);
        setMasonryColumns(columns);
    }, [filteredFanart, calculateMasonryLayout]);

    useEffect(() => {
        localStorage.setItem(
            LS_FANART_MODAL_HEADER_COLLAPSED,
            isHeaderCollapsed.toString(),
        );
    }, [isHeaderCollapsed]);

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

    useEffect(() => {
        setSelectedCharacters(
            initialCharacter && initialCharacter !== "all"
                ? [initialCharacter]
                : ["all"],
        );
    }, [initialCharacter]);

    // Ensure selected characters are valid
    useEffect(() => {
        if (
            !selectedCharacters.includes("all") &&
            selectedCharacters.some(
                (char) => char !== "various" && !characters.includes(char),
            )
        ) {
            setSelectedCharacters(["all"]);
        }
    }, [selectedCharacters, characters]);

    useEffect(() => {
        setSelectedDay(day.toString() || "all");
    }, [day]);

    useEffect(() => {
        if (!open) {
            setCurrentLightboxEntryIndex(null);
        }
    }, [open]);

    // Preload adjacent entries
    useEffect(() => {
        if (currentLightboxEntryIndex !== null && isLightboxOpen) {
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

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className="max-w-7xl md:h-[90vh] h-[80vh] flex flex-col gap-2 md:gap-4"
                    showXButtonForce={true}
                    showXButton={true}
                >
                    <CollapsibleHeader
                        isCollapsed={isHeaderCollapsed}
                        onToggle={() =>
                            setIsHeaderCollapsed(!isHeaderCollapsed)
                        }
                    >
                        <FanartFilters
                            selectedCharacters={selectedCharacters}
                            selectedChapter={selectedChapter}
                            selectedDay={selectedDay}
                            characters={characters}
                            chapters={chapters}
                            days={days}
                            nameMap={nameMap}
                            onCharactersChange={setSelectedCharacters}
                            onChapterChange={setSelectedChapter}
                            onDayChange={setSelectedDay}
                            onReset={resetFilters}
                            totalItems={filteredFanart.length}
                        />
                    </CollapsibleHeader>

                    <div
                        className="flex-1 overflow-y-auto"
                        ref={contentContainerRef}
                    >
                        <FanartMasonryGrid
                            masonryColumns={masonryColumns}
                            filteredFanart={filteredFanart}
                            selectedCharacters={selectedCharacters}
                            selectedChapter={selectedChapter}
                            selectedDay={selectedDay}
                            onOpenLightbox={handleOpenLightbox}
                        />
                    </div>
                </DialogContent>
            </Dialog>

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
