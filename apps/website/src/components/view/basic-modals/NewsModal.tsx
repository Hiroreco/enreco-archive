import newsDataEn from "#/news.json";
import Lightbox from "@/components/view/lightbox/Lightbox";
import { ViewMarkdown } from "@/components/view/markdown/Markdown";
import { useSettingStore } from "@/store/settingStore";
import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { Input } from "@enreco-archive/common-ui/components/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { NewsData } from "@enreco-archive/common/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
    ArrowDownNarrowWide,
    ArrowUpNarrowWide,
    Calendar,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Newspaper,
    Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface NewsModalProps {
    open: boolean;
    onClose: () => void;
}

interface MasonryColumn {
    items: Array<{ post: NewsData; index: number }>;
    height: number;
}

interface NewsPostItemProps {
    post: NewsData;
}

const ITEMS_PER_PAGE = 15;
const MAX_CONTENT_HEIGHT = 100; // pixels

const NewsPostItem = ({ post }: NewsPostItemProps) => {
    const t = useTranslations("modals.news");
    const locale = useSettingStore((state) => state.locale);

    const [isExpanded, setIsExpanded] = useState(false);
    const [needsExpansion, setNeedsExpansion] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    // https://x.com/hololive_En/status/1826783929677894111 -> hololive_En
    const userHandle = post.src.match(/x\.com\/([^/]+)/)?.[1] || "unknown";

    const postDate = new Date(post.date);
    const formattedDate = postDate.toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    useEffect(() => {
        if (contentRef.current) {
            const contentHeight = contentRef.current.scrollHeight;
            // Estimate line height
            const computedStyle = window.getComputedStyle(contentRef.current);
            const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
            const totalLines = Math.round(contentHeight / lineHeight);
            const maxLines = Math.floor(MAX_CONTENT_HEIGHT / lineHeight);
            const hiddenLines = totalLines - maxLines;

            setNeedsExpansion(
                contentHeight > MAX_CONTENT_HEIGHT && hiddenLines > 3,
            );
        }
    }, [post.content]);

    return (
        <div className="bg-card rounded-lg border p-4 break-inside-avoid">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 relative">
                {post.avatarSrc && (
                    <Image
                        src={post.avatarSrc}
                        alt={post.author}
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                )}
                <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm truncate">
                        {post.author}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        @{userHandle}
                    </span>
                </div>
                <a
                    href={post.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="right-0 absolute top-0 visited:text-muted-foreground! text-muted-foreground!"
                >
                    <ExternalLink className="size-4" />
                </a>
            </div>

            {/* Content */}
            <div className="relative mb-3">
                <div
                    ref={contentRef}
                    className={cn(
                        "text-sm whitespace-pre-wrap overflow-hidden transition-all duration-300",
                        !isExpanded && needsExpansion && "line-clamp-5",
                    )}
                    style={
                        !isExpanded && needsExpansion
                            ? { maxHeight: `${MAX_CONTENT_HEIGHT}px` }
                            : undefined
                    }
                >
                    <ViewMarkdown
                        onNodeLinkClicked={() => {}}
                        onEdgeLinkClicked={() => {}}
                        className="smaller-mb"
                    >
                        {post.content}
                    </ViewMarkdown>
                </div>

                {/* Show more/less gradient overlay and button */}
                {needsExpansion && !isExpanded && (
                    <div className="absolute bottom-4 left-0 right-0 h-4 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                )}

                {needsExpansion && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline mt-1 mb-2"
                    >
                        {isExpanded ? (
                            <>
                                {t("showLess")}
                                <ChevronUp className="w-3 h-3" />
                            </>
                        ) : (
                            <>
                                {t("showMore")}
                                <ChevronDown className="w-3 h-3" />
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Media */}
            {post.media.src && post.media.type === "image" && (
                <div className="mb-3 rounded-lg overflow-hidden w-full">
                    <Lightbox
                        src={post.media.src}
                        alt={"Post media image"}
                        className="w-full h-auto object-contain"
                    />
                </div>
            )}

            {post.media.src && post.media.type === "video" && (
                <div className="mb-3 rounded-lg overflow-hidden w-full">
                    <video
                        src={post.media.src}
                        controls
                        className="w-full h-auto"
                        preload="metadata"
                    />
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Calendar className="w-3 h-3" />
                <span>{formattedDate}</span>
            </div>
        </div>
    );
};

const NewsModal = ({ open, onClose }: NewsModalProps) => {
    const t = useTranslations("modals.news");
    const tCommon = useTranslations("common");
    const backdropFilter = useSettingStore((state) => state.backdropFilter);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedChapter, setSelectedChapter] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [columnCount, setColumnCount] = useState(3);
    const [masonryColumns, setMasonryColumns] = useState<MasonryColumn[]>([]);
    const contentContainerRef = useRef<HTMLDivElement | null>(null);

    const newsData = newsDataEn as NewsData[];

    const chapters = useMemo(() => {
        const uniqueChapters = new Set<number>();
        newsData.forEach((post) => uniqueChapters.add(post.chapter));
        return Array.from(uniqueChapters).sort((a, b) => a - b);
    }, [newsData]);

    const categories = useMemo(() => {
        const uniqueCategories = new Set<string>();
        uniqueCategories.add("all");
        newsData.forEach((post) => {
            if (post.category && post.category !== "all") {
                uniqueCategories.add(post.category);
            }
        });
        return Array.from(uniqueCategories).sort();
    }, [newsData]);

    const allFilteredNews = useMemo(() => {
        let filtered = newsData;

        if (selectedChapter !== "all") {
            const chapterNum = parseInt(selectedChapter, 10);
            filtered = filtered.filter((post) => post.chapter === chapterNum);
        }

        if (selectedCategory !== "all") {
            filtered = filtered.filter(
                (post) => post.category === selectedCategory,
            );
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (post) =>
                    post.content.toLowerCase().includes(query) ||
                    post.author.toLowerCase().includes(query),
            );
        }

        const sorted = [...filtered].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });

        return sorted;
    }, [newsData, selectedChapter, selectedCategory, searchQuery, sortOrder]);

    const paginatedNews = useMemo(() => {
        const maxItems = currentPage * ITEMS_PER_PAGE;
        return allFilteredNews.slice(0, maxItems);
    }, [allFilteredNews, currentPage]);

    const hasMore = useMemo(() => {
        return paginatedNews.length < allFilteredNews.length;
    }, [paginatedNews.length, allFilteredNews.length]);

    const loadMore = useCallback(() => {
        if (hasMore && !isLoading) {
            setIsLoading(true);
            setTimeout(() => {
                setCurrentPage((prev) => prev + 1);
                setIsLoading(false);
            }, 100);
        }
    }, [hasMore, isLoading]);

    const calculateMasonryLayout = useCallback(
        (posts: NewsData[]) => {
            const columns: MasonryColumn[] = Array.from(
                { length: columnCount },
                () => ({
                    items: [],
                    height: 0,
                }),
            );

            posts.forEach((post, index) => {
                const shortestColumn = columns.reduce(
                    (min, col, i) =>
                        col.height < columns[min].height ? i : min,
                    0,
                );

                // Estimate height based on content
                const contentHeight = Math.max(150, post.content.length * 0.5);
                const mediaHeight = post.media.src ? 200 : 0;
                const estimatedHeight = contentHeight + mediaHeight + 150;

                columns[shortestColumn].items.push({ post, index });
                columns[shortestColumn].height += estimatedHeight;
            });

            return columns;
        },
        [columnCount],
    );

    const handleScroll = useCallback(() => {
        if (!contentContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } =
            contentContainerRef.current;
        const threshold = 800;

        if (scrollTop + clientHeight >= scrollHeight - threshold) {
            loadMore();
        }
    }, [loadMore]);

    const setContentContainerRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (contentContainerRef.current) {
                contentContainerRef.current.removeEventListener(
                    "scroll",
                    handleScroll,
                );
            }

            contentContainerRef.current = node;

            if (node && open) {
                node.addEventListener("scroll", handleScroll, {
                    passive: true,
                });
            }
        },
        [handleScroll, open],
    );

    const onOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                onClose();
            }
        },
        [onClose],
    );

    const toggleSortOrder = useCallback(() => {
        setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
        setCurrentPage(1);
    }, []);

    useEffect(() => {
        const updateColumnCount = () => {
            const width = window.innerWidth;
            if (width < 768) setColumnCount(1);
            else if (width < 1024) setColumnCount(2);
            else setColumnCount(3);
        };

        updateColumnCount();
        window.addEventListener("resize", updateColumnCount);
        return () => window.removeEventListener("resize", updateColumnCount);
    }, []);

    useEffect(() => {
        const columns = calculateMasonryLayout(paginatedNews);
        setMasonryColumns(columns);
    }, [paginatedNews, calculateMasonryLayout]);

    useEffect(() => {
        if (!open && contentContainerRef.current) {
            contentContainerRef.current.removeEventListener(
                "scroll",
                handleScroll,
            );
        }
    }, [open, handleScroll]);

    useEffect(() => {
        setCurrentPage(1);
        if (contentContainerRef.current) {
            contentContainerRef.current.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }, [searchQuery, selectedChapter, selectedCategory, sortOrder]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "max-w-6xl flex flex-col p-0 gap-0",
                    backdropFilter &&
                        "supports-[backdrop-filter]:bg-background/80",
                )}
                aria-describedby="news-modal-description"
            >
                <VisuallyHidden>
                    <DialogTitle>News Modal</DialogTitle>
                </VisuallyHidden>
                <VisuallyHidden>
                    <DialogDescription id="news-modal-description">
                        View ENreco News updates
                    </DialogDescription>
                </VisuallyHidden>

                <div className="flex flex-col gap-2 h-[85dvh] md:h-[90dvh]">
                    {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-2 p-4 border-b">
                        <div className="flex-1 flex gap-2 items-center">
                            <Newspaper />
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />

                                <Input
                                    type="text"
                                    placeholder={t("searchPlaceholder")}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="flex-1 pl-9"
                                />
                            </div>
                        </div>

                        <div className="flex flex-row gap-2 items-center">
                            {/* Chapter Filter */}
                            <Select
                                value={selectedChapter}
                                onValueChange={setSelectedChapter}
                            >
                                <SelectTrigger className="sm:w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {tCommon("allChapters")}
                                    </SelectItem>
                                    {chapters.map((chapter) => (
                                        <SelectItem
                                            key={chapter}
                                            value={String(chapter)}
                                        >
                                            {tCommon("chapter", {
                                                val: chapter + 1,
                                            })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Category Filter */}
                            <Select
                                value={selectedCategory}
                                onValueChange={setSelectedCategory}
                            >
                                <SelectTrigger className="sm:w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                        >
                                            {t(`categories.${category}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Sort Toggle */}
                            <Button variant="outline" onClick={toggleSortOrder}>
                                {sortOrder === "newest" ? (
                                    <ArrowUpNarrowWide className="size-4" />
                                ) : (
                                    <ArrowDownNarrowWide className="size-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Masonry Grid */}
                    <div
                        ref={setContentContainerRef}
                        className="flex-1 overflow-y-auto px-4 pb-4"
                    >
                        <div className="flex gap-4 items-start">
                            {masonryColumns.map((column, colIndex) => (
                                <div
                                    key={colIndex}
                                    className="flex-1 min-w-0 space-y-4"
                                >
                                    {column.items.map(({ post }) => (
                                        <NewsPostItem
                                            key={post.src}
                                            post={post}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t md:hidden p-4">
                    <DialogClose asChild>
                        <Button>{tCommon("close")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NewsModal;
