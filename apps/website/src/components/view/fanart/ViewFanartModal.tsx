import fanartData from "#/fanart.json";
import CollapsibleHeader from "@/components/view/fanart/CollapsibleHeader";
import FanartFilters from "@/components/view/fanart/FanartFilters";
import FanartMasonryGrid from "@/components/view/fanart/FanartMasonryGrid";
import ViewLightbox from "@/components/view/lightbox/ViewLightbox";
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

export interface FanartEntry {
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
    videos: {
        src: string;
    }[];
    type: "art" | "meme";
}

interface ViewFanartModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    chapter: number;
    day: number;
    initialCharacters?: string[];
}

interface MasonryColumn {
    items: Array<{ entry: FanartEntry; index: number }>;
    height: number;
}

const ITEMS_PER_PAGE = 50;

const ViewFanartModal = ({
    open,
    onOpenChange,
    chapter,
    day,
    initialCharacters,
}: ViewFanartModalProps) => {
    // State
    const [selectedCharacters, setSelectedCharacters] = useState<string[]>(
        initialCharacters || ["all"],
    );
    const [selectedChapter, setSelectedChapter] = useState<string>(
        chapter.toString() || "all",
    );

    // Keep selectedChapter in sync with prop
    useEffect(() => {
        setSelectedChapter(chapter.toString() || "all");
    }, [chapter]);
    const [selectedDay, setSelectedDay] = useState<string>(
        day.toString() || "all",
    );
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentLightboxEntryIndex, setCurrentLightboxEntryIndex] = useState<
        number | null
    >(null);
    const [masonryColumns, setMasonryColumns] = useState<MasonryColumn[]>([]);
    const [shuffled, setShuffled] = useState(false);
    const [shuffledFanart, setShuffledFanart] = useState<FanartEntry[] | null>(
        null,
    );
    const [columnCount, setColumnCount] = useState(3);
    const [inclusiveMode, setInclusiveMode] = useState(false);
    const [videosOnly, setVideosOnly] = useState(false);
    const [memesOnly, setMemesOnly] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Replace header collapse state with pin state
    const [isHeaderPinned, setIsHeaderPinned] = useState(false);
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

    const contentContainerRef = useRef<HTMLDivElement>(null);
    const lastScrollTop = useRef(0);
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

    // Full filtered fanart (without pagination)
    const allFilteredFanart = useMemo(() => {
        const base = fanart.filter((entry) => {
            let characterMatch = false;

            if (selectedCharacters.includes("all")) {
                characterMatch = true;
            } else if (selectedCharacters.includes("various")) {
                characterMatch = entry.characters.length > 1;
            } else {
                characterMatch = inclusiveMode
                    ? selectedCharacters.every((char) =>
                          entry.characters.includes(char),
                      )
                    : selectedCharacters.some((char) =>
                          entry.characters.includes(char),
                      );
            }

            const chapterMatch =
                selectedChapter === "all" ||
                entry.chapter === parseInt(selectedChapter);
            const dayMatch =
                selectedDay === "all" || entry.day === parseInt(selectedDay);

            // Add videos only filter
            const videoMatch = videosOnly ? entry.videos.length > 0 : true;

            // Only allow memes if memesOnly is true
            if (!memesOnly && entry.type === "meme") {
                return false;
            }

            // If memesOnly is true, only allow memes
            if (memesOnly && entry.type !== "meme") {
                return false;
            }

            return characterMatch && chapterMatch && dayMatch && videoMatch;
        });

        if (shuffled && shuffledFanart) {
            // Only show shuffled items that match the current filter
            const filteredIds = new Set(base.map((e) => e.url));
            return shuffledFanart.filter((e) => filteredIds.has(e.url));
        }
        return base;
    }, [
        selectedCharacters,
        selectedChapter,
        selectedDay,
        fanart,
        inclusiveMode,
        videosOnly,
        memesOnly,
        shuffled,
        shuffledFanart,
    ]);

    // Paginated fanart (what's currently displayed), needs pagination because loading 400 items at once is too much
    const filteredFanart = useMemo(() => {
        const maxItems = currentPage * ITEMS_PER_PAGE;
        return allFilteredFanart.slice(0, maxItems);
    }, [allFilteredFanart, currentPage]);

    // Check if there are more items to load
    const hasMore = useMemo(() => {
        return filteredFanart.length < allFilteredFanart.length;
    }, [filteredFanart.length, allFilteredFanart.length]);

    // Load more items
    const loadMore = useCallback(() => {
        if (hasMore && !isLoading) {
            setIsLoading(true);
            // Simulate loading delay for smooth UX
            setTimeout(() => {
                setCurrentPage((prev) => prev + 1);
                setIsLoading(false);
            }, 100);
        }
    }, [hasMore, isLoading]);

    // Shuffle handler
    const handleShuffle = useCallback(() => {
        // Fisher-Yates shuffle on the full filtered set
        const arr = [...allFilteredFanart];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        setShuffledFanart(arr);
        setShuffled(true);
        // Reset pagination when shuffling
        setCurrentPage(1);
    }, [allFilteredFanart]);

    // Unshuffle handler
    const handleUnshuffle = useCallback(() => {
        setShuffled(false);
        setShuffledFanart(null);
        // Reset pagination when unshuffling
        setCurrentPage(1);
    }, []);

    const currentEntry = useMemo(
        () =>
            currentLightboxEntryIndex !== null
                ? allFilteredFanart[currentLightboxEntryIndex]
                : null,
        [currentLightboxEntryIndex, allFilteredFanart],
    );

    // Handlers
    const resetFilters = useCallback(() => {
        setSelectedCharacters(["all"]);
        setSelectedChapter("all");
        setSelectedDay("all");
        setInclusiveMode(false);
        setVideosOnly(false);
        setMemesOnly(false);
        setShuffled(false);
        setShuffledFanart(null);
        setCurrentPage(1);
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
                currentLightboxEntryIndex < allFilteredFanart.length - 1
                    ? currentLightboxEntryIndex + 1
                    : 0;
            const nextEntry = allFilteredFanart[nextIndex];
            if (nextEntry?.images[0]) {
                const img = new window.Image();
                img.src = nextEntry.images[0].src;
                setCurrentLightboxEntryIndex(nextIndex);
            } else {
                setCurrentLightboxEntryIndex(nextIndex);
            }
        }
    }, [currentLightboxEntryIndex, allFilteredFanart]);

    const handlePrevEntry = useCallback(() => {
        if (currentLightboxEntryIndex !== null) {
            const prevIndex =
                currentLightboxEntryIndex > 0
                    ? currentLightboxEntryIndex - 1
                    : allFilteredFanart.length - 1;
            const prevEntry = allFilteredFanart[prevIndex];
            if (prevEntry?.images[0]) {
                const img = new window.Image();
                img.src = prevEntry.images[0].src;
                setCurrentLightboxEntryIndex(prevIndex);
            } else {
                setCurrentLightboxEntryIndex(prevIndex);
            }
        }
    }, [currentLightboxEntryIndex, allFilteredFanart]);

    // Handle scroll for auto-collapse AND infinite scroll
    const handleScroll = useCallback(() => {
        if (!contentContainerRef.current) return;

        const container = contentContainerRef.current;
        const currentScrollTop = container.scrollTop;
        const scrollingDown = currentScrollTop > lastScrollTop.current;

        // Auto-collapse logic (only if not pinned)
        if (!isHeaderPinned) {
            const isScrollable =
                container.scrollHeight > container.clientHeight;
            if (
                Math.abs(currentScrollTop - lastScrollTop.current) > 10 &&
                isScrollable
            ) {
                if (scrollingDown && !isHeaderCollapsed) {
                    setIsHeaderCollapsed(true);
                }
            }
        }

        // Infinite scroll logic
        const { scrollTop, scrollHeight, clientHeight } = container;
        const threshold = 1000; // Load more when 1000px from bottom

        if (scrollTop + clientHeight >= scrollHeight - threshold) {
            loadMore();
        }

        lastScrollTop.current = currentScrollTop;
    }, [isHeaderPinned, isHeaderCollapsed, loadMore]);

    // Need this because on first open contentContainerRef.current is null, for whatever reason
    const setContentContainerRef = useCallback(
        (node: HTMLDivElement | null) => {
            // Remove listener from previous node
            if (contentContainerRef.current) {
                contentContainerRef.current.removeEventListener(
                    "scroll",
                    handleScroll,
                );
            }

            // Set the new ref
            contentContainerRef.current = node;

            // Add listener to new node if it exists and modal is open
            if (node && open) {
                node.addEventListener("scroll", handleScroll, {
                    passive: true,
                });
                lastScrollTop.current = 0;
            }
        },
        [handleScroll, open],
    );

    const handleToggleCollapse = useCallback(() => {
        setIsHeaderCollapsed(!isHeaderCollapsed);
    }, [isHeaderCollapsed]);

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
                const hasVideo = entry.videos.length > 0;

                // Skip entries with no media
                if (!firstImage && !hasVideo) return;

                const shortestColumn = columns.reduce(
                    (min, col, i) =>
                        col.height < columns[min].height ? i : min,
                    0,
                );

                let estimatedHeight;
                if (firstImage) {
                    // Use actual image dimensions
                    const aspectRatio = firstImage.height / firstImage.width;
                    const estimatedWidth = 300;
                    estimatedHeight = estimatedWidth * aspectRatio + 100;
                } else {
                    // Video-only entry: use standard video aspect ratio (16:9)
                    const estimatedWidth = 300;
                    estimatedHeight = (estimatedWidth * 9) / 16 + 100;
                }

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

    // Clean up scroll listener when modal closes
    useEffect(() => {
        if (!open && contentContainerRef.current) {
            contentContainerRef.current.removeEventListener(
                "scroll",
                handleScroll,
            );
        }
    }, [open, handleScroll]);

    // Reset pagination and scroll position when filters change
    useEffect(() => {
        setCurrentPage(1);
        if (contentContainerRef.current) {
            contentContainerRef.current.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }, [
        selectedCharacters,
        selectedChapter,
        selectedDay,
        inclusiveMode,
        videosOnly,
        memesOnly,
    ]);

    useEffect(() => {
        if (initialCharacters && initialCharacters.length > 0) {
            setSelectedCharacters(initialCharacters);
            if (initialCharacters.length > 1) {
                setInclusiveMode(true);
            } else {
                setInclusiveMode(false);
            }
        } else {
            setSelectedCharacters(["all"]);
            setInclusiveMode(false);
        }
    }, [initialCharacters]);

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
        if (
            selectedCharacters.includes("all") ||
            selectedCharacters.includes("various")
        ) {
            setInclusiveMode(false);
        }
    }, [selectedCharacters]);

    useEffect(() => {
        setSelectedDay(day.toString() || "all");
    }, [day]);

    useEffect(() => {
        if (!open) {
            setCurrentLightboxEntryIndex(null);
        }
    }, [open]);

    // When pinned state changes, ensure header is visible if pinned
    useEffect(() => {
        if (isHeaderPinned) {
            setIsHeaderCollapsed(false);
        }
    }, [isHeaderPinned]);

    // Preload adjacent entries (using full dataset)
    useEffect(() => {
        if (currentLightboxEntryIndex !== null && isLightboxOpen) {
            const nextIndex =
                currentLightboxEntryIndex < allFilteredFanart.length - 1
                    ? currentLightboxEntryIndex + 1
                    : 0;
            const prevIndex =
                currentLightboxEntryIndex > 0
                    ? currentLightboxEntryIndex - 1
                    : allFilteredFanart.length - 1;

            [nextIndex, prevIndex].forEach((index) => {
                const entry = allFilteredFanart[index];
                if (entry?.images[0]) {
                    const img = new window.Image();
                    img.src = entry.images[0].src;
                }
            });
        }
    }, [currentLightboxEntryIndex, allFilteredFanart, isLightboxOpen]);

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
                        isPinned={isHeaderPinned}
                        onTogglePin={() => setIsHeaderPinned(!isHeaderPinned)}
                        onToggleCollapse={handleToggleCollapse}
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
                            totalItems={allFilteredFanart.length}
                            inclusiveMode={inclusiveMode}
                            onInclusiveModeChange={setInclusiveMode}
                            videosOnly={videosOnly}
                            onVideosOnlyChange={setVideosOnly}
                            memesOnly={memesOnly}
                            onMemesOnlyChange={setMemesOnly}
                            onShuffle={
                                shuffled ? handleUnshuffle : handleShuffle
                            }
                            shuffled={shuffled}
                        />
                    </CollapsibleHeader>

                    <div
                        className="flex-1 overflow-y-auto"
                        ref={setContentContainerRef}
                    >
                        <FanartMasonryGrid
                            masonryColumns={masonryColumns}
                            filteredFanart={filteredFanart}
                            selectedCharacters={selectedCharacters}
                            selectedChapter={selectedChapter}
                            selectedDay={selectedDay}
                            onOpenLightbox={handleOpenLightbox}
                        />

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}

                        {/* Load more button as fallback */}
                        {hasMore && !isLoading && (
                            <div className="flex justify-center py-8">
                                <button
                                    onClick={loadMore}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    Load More (
                                    {allFilteredFanart.length -
                                        filteredFanart.length}{" "}
                                    remaining)
                                </button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {currentEntry && (
                <ViewLightbox
                    src={
                        currentEntry.images[0]?.src ||
                        currentEntry.videos[0]?.src ||
                        ""
                    }
                    alt={currentEntry.label}
                    width={currentEntry.images[0]?.width}
                    height={currentEntry.images[0]?.height}
                    type={currentEntry.images[0] ? "image" : "video"}
                    galleryItems={[
                        ...currentEntry.images.map((img) => ({
                            src: img.src,
                            alt:
                                currentEntry.label +
                                " by " +
                                currentEntry.author,
                            type: "image" as const,
                            width: img.width,
                            height: img.height,
                        })),
                        ...currentEntry.videos.map((video) => ({
                            src: video.src,
                            alt:
                                currentEntry.label +
                                " by " +
                                currentEntry.author,
                            type: "video" as const,
                        })),
                    ]}
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
