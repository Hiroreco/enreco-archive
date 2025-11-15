import TimestampHref from "@/components/view/markdown/TimestampHref";
import { CATEGORY_ICON_MAP } from "@/components/view/media-archive/constants";
import { ClipEntry } from "@/components/view/media-archive/types";
import { getBlurDataURL } from "@/lib/utils";
import { useSettingStore } from "@/store/settingStore";
import { Input } from "@enreco-archive/common-ui/components/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@enreco-archive/common-ui/components/tabs";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Film, Search, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";

const CATEGORY_ORDER = [
    "highlight",
    "animatics",
    "calli",
    "kiara",
    "ina",
    "gura",
    "ame",
    "irys",
    "kronii",
    "fauna",
    "moom",
    "bae",
    "shiori",
    "nerissa",
    "fuwawa",
    "mococo",
    "bijou",
    "liz",
    "raora",
    "gigi",
    "cecilia",
];

const ITEMS_PER_PAGE = 50;

interface ClipsArchiveViewer {
    clips: ClipEntry[];
    streams: ClipEntry[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}

const ClipsArchiveViewer = ({
    clips,
    streams,
    selectedCategory,
    onCategoryChange,
}: ClipsArchiveViewer) => {
    const t = useTranslations("mediaArchive");
    const tCommon = useTranslations("common");

    const [activeContentType, setActiveContentType] = useState<
        "clips" | "streams"
    >("clips");
    const [selectedChapter, setSelectedChapter] = useState<number>(-1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const hasStreams = streams.length > 0;
    const currentData = activeContentType === "clips" ? clips : streams;
    const contentContainer = useRef<HTMLDivElement>(null);
    const lastScrollTop = useRef(0);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [searchQuery]);

    const categories = useMemo(() => {
        const cats = new Set<string>();
        currentData.forEach((clip) => {
            clip.categories.forEach((cat) => cats.add(cat));
        });

        let sortedCats = Array.from(cats).sort((a, b) => {
            const indexA = CATEGORY_ORDER.indexOf(a);
            const indexB = CATEGORY_ORDER.indexOf(b);

            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }

            if (indexA === -1) return 1;
            if (indexB === -1) return -1;

            return 0;
        });

        if (selectedChapter > 1) {
            sortedCats = sortedCats.filter(
                (cat) =>
                    cat !== "ame" &&
                    cat !== "fauna" &&
                    cat !== "gura" &&
                    cat !== "moom",
            );
        }

        return ["all", ...sortedCats];
    }, [currentData, selectedChapter]);

    const chapters = useMemo(() => {
        const chaps = new Set(currentData.map((clip) => clip.chapter));
        return Array.from(chaps).sort((a, b) => a - b);
    }, [currentData]);

    // Full filtered data (without pagination)
    const allFilteredData = useMemo(() => {
        return currentData.filter((item) => {
            // Only show animatics when its specifically selected
            const matchesCategory =
                (selectedCategory === "all" &&
                    !item.categories.includes("animatics")) ||
                item.categories.includes(selectedCategory);

            const matchesChapter =
                selectedChapter === -1 || item.chapter === selectedChapter;
            const matchesSearch =
                debouncedSearchQuery === "" ||
                item.title
                    .toLowerCase()
                    .includes(debouncedSearchQuery.toLowerCase()) ||
                item.author
                    .toLowerCase()
                    .includes(debouncedSearchQuery.toLowerCase());

            return matchesCategory && matchesChapter && matchesSearch;
        });
    }, [currentData, selectedCategory, selectedChapter, debouncedSearchQuery]);

    // Paginated data (what's currently displayed)
    const filteredData = useMemo(() => {
        const maxItems = currentPage * ITEMS_PER_PAGE;
        return allFilteredData.slice(0, maxItems);
    }, [allFilteredData, currentPage]);

    const hasMore = useMemo(() => {
        return filteredData.length < allFilteredData.length;
    }, [filteredData.length, allFilteredData.length]);

    const loadMore = useCallback(() => {
        if (hasMore && !isLoading) {
            setIsLoading(true);
            setTimeout(() => {
                setCurrentPage((prev) => prev + 1);
                setIsLoading(false);
            }, 100);
        }
    }, [hasMore, isLoading]);

    // Group by chapter
    const groupedData = useMemo(() => {
        const grouped: Record<number, ClipEntry[]> = {};
        filteredData.forEach((item) => {
            if (!grouped[item.chapter]) {
                grouped[item.chapter] = [];
            }
            grouped[item.chapter].push(item);
        });
        return grouped;
    }, [filteredData]);

    const sortedChapters = useMemo(
        () => Object.keys(groupedData).sort((a, b) => -(Number(a) - Number(b))),
        [groupedData],
    );

    const contentKey = `${activeContentType}-${selectedCategory}`;

    // Handle scroll for infinite loading
    const handleScroll = useCallback(() => {
        if (!contentContainer.current) return;

        const container = contentContainer.current;
        const { scrollTop, scrollHeight, clientHeight } = container;
        const threshold = 1000; // Load more when 1000px from bottom

        if (scrollTop + clientHeight >= scrollHeight - threshold) {
            loadMore();
        }

        lastScrollTop.current = scrollTop;
    }, [loadMore]);

    // Set up scroll listener
    const setContentContainerRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (contentContainer.current) {
                contentContainer.current.removeEventListener(
                    "scroll",
                    handleScroll,
                );
            }

            contentContainer.current = node;

            if (node) {
                node.addEventListener("scroll", handleScroll, {
                    passive: true,
                });
                lastScrollTop.current = 0;
            }
        },
        [handleScroll],
    );

    // Reset scroll and search when category or content type changes
    useEffect(() => {
        setSearchQuery("");
        setCurrentPage(1);

        requestAnimationFrame(() => {
            if (contentContainer.current) {
                contentContainer.current.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            }
        });
    }, [
        selectedCategory,
        activeContentType,
        selectedChapter,
        debouncedSearchQuery,
    ]);

    return (
        <div className="flex h-full gap-4">
            {/* Sidebar - Categories */}
            <div className="hidden md:flex flex-col gap-2 w-48 shrink-0 overflow-y-auto pr-1">
                <p className="text-sm font-semibold mb-2">
                    {t("clipArchive.categories")}
                </p>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={cn(
                            "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            "hover:bg-foreground/10 flex items-center gap-2",
                            selectedCategory === category &&
                                "bg-foreground/20 font-semibold",
                        )}
                    >
                        <Image
                            src={`images-opt/${CATEGORY_ICON_MAP[category]}`}
                            alt={category}
                            width={25}
                            height={25}
                            className="rounded-md object-cover"
                        />
                        {category === "all"
                            ? t("clipArchive.category.all")
                            : t(`clipArchive.category.${category}`)}
                    </button>
                ))}
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="flex gap-2 mt-2">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder={t("clipArchive.searchPlaceholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 opacity-70"
                        />
                    </div>

                    {hasStreams && (
                        <Tabs
                            value={activeContentType}
                            onValueChange={(v) =>
                                setActiveContentType(v as "clips" | "streams")
                            }
                        >
                            <TabsList className="grid grid-cols-2 opacity-90">
                                <TabsTrigger value="clips" className="gap-2">
                                    <Film className="size-4" />
                                    <span className="hidden md:inline">
                                        {t("clipArchive.tabs.clips")}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="streams" className="gap-2">
                                    <Video className="size-4" />
                                    <span className="hidden md:inline">
                                        {t("clipArchive.tabs.streams")}
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}

                    <Select
                        value={selectedChapter.toString()}
                        onValueChange={(val) => setSelectedChapter(Number(val))}
                    >
                        <SelectTrigger
                            className="w-[180px] hidden md:flex bg-background/50"
                            style={{
                                backgroundImage: "none",
                            }}
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                            style={{
                                backgroundImage: "none",
                            }}
                            className="bg-background/70 backdrop-blur-md"
                        >
                            <SelectItem value="-1">
                                {tCommon("allChapters")}
                            </SelectItem>
                            {chapters.map((chapter) => (
                                <SelectItem
                                    key={chapter}
                                    value={chapter.toString()}
                                >
                                    {tCommon("chapter", { val: chapter })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="md:hidden flex gap-2">
                    <Select
                        value={selectedCategory}
                        onValueChange={onCategoryChange}
                    >
                        <SelectTrigger className="flex-2">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    <div className="flex items-center line-clamp-1 gap-1">
                                        <Image
                                            src={`images-opt/${CATEGORY_ICON_MAP[category]}`}
                                            alt={category}
                                            width={20}
                                            height={20}
                                            className="rounded-md object-cover"
                                        />
                                        <span className="line-clamp-1">
                                            {category === "all"
                                                ? t("clipArchive.category.all")
                                                : t(
                                                      `clipArchive.category.${category}`,
                                                  )}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={selectedChapter.toString()}
                        onValueChange={(val) => setSelectedChapter(Number(val))}
                    >
                        <SelectTrigger className="flex-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="-1">
                                {tCommon("allChapters")}
                            </SelectItem>
                            {chapters.map((chapter) => (
                                <SelectItem
                                    key={chapter}
                                    value={chapter.toString()}
                                >
                                    {tCommon("chapter", { val: chapter })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div
                    className="flex-1 overflow-y-auto px-2 pb-2 relative"
                    ref={setContentContainerRef}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={contentKey}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            {filteredData.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    {t("clipArchive.noResults")}
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-6">
                                        {sortedChapters.map((chapterKey) => {
                                            const chapter = Number(chapterKey);
                                            const chapterItems =
                                                groupedData[chapter];

                                            return (
                                                <div key={chapter}>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <Separator className="bg-foreground/60 flex-1" />
                                                        <span className="text-sm font-semibold whitespace-nowrap">
                                                            {tCommon(
                                                                "chapter",
                                                                {
                                                                    val: chapter,
                                                                },
                                                            )}
                                                        </span>
                                                        <Separator className="bg-foreground/60 flex-1" />
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {chapterItems.map(
                                                            (item, index) => (
                                                                <ClipCard
                                                                    key={
                                                                        item.id +
                                                                        "-" +
                                                                        index
                                                                    }
                                                                    clip={item}
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {isLoading && (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
                                                {allFilteredData.length -
                                                    filteredData.length}{" "}
                                                remaining)
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

interface ClipCardProps {
    clip: ClipEntry;
}

const ClipCard = ({ clip }: ClipCardProps) => {
    const locale = useSettingStore((state) => state.locale);
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return hours > 0
            ? `${hours.toString().padStart(2, "0")}:${mins
                  .toString()
                  .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
            : `${mins.toString().padStart(2, "0")}:${secs
                  .toString()
                  .padStart(2, "0")}`;
    };

    return (
        <TimestampHref href={clip.originalUrl} type="general">
            <div
                className={cn(
                    "group cursor-pointer overflow-hidden rounded-lg",
                    "dark:bg-background/50 backdrop-blur-md shadow-lg",
                    "hover:shadow-xl hover:ring-2 hover:ring-accent transition-all",
                    "flex flex-col",
                )}
            >
                <div className="relative w-full aspect-video overflow-hidden">
                    <Image
                        src={clip.thumbnailSrc}
                        alt={clip.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform rounded-none"
                        blurDataURL={getBlurDataURL(clip.thumbnailSrc)}
                        placeholder={
                            getBlurDataURL(clip.thumbnailSrc) ? "blur" : "empty"
                        }
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-md z-1">
                        {formatTime(clip.duration)}
                    </span>
                </div>

                <div className="p-2.5 flex flex-col gap-1">
                    <span className="font-semibold text-xs line-clamp-2 leading-tight">
                        {clip.title}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-muted-foreground truncate">
                            {clip.author}
                        </p>
                        <p className="text-[10px] text-muted-foreground shrink-0">
                            {formatDate(clip.uploadDate)}
                        </p>
                    </div>
                </div>
            </div>
        </TimestampHref>
    );
};

export default ClipsArchiveViewer;
