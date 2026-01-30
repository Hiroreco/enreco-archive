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
import { Calendar, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
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
    index: number;
}

const ITEMS_PER_PAGE = 15;
const MAX_CONTENT_HEIGHT = 100; // pixels

const NewsPostItem = ({ post, index }: NewsPostItemProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [needsExpansion, setNeedsExpansion] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const postDate = new Date(post.date);
    const formattedDate = postDate.toLocaleDateString("en-US", {
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
        <div
            key={index}
            className="text-sm border border-foreground/20 rounded-lg p-4 mb-4 w-full"
        >
            {/* Header */}
            <div className="flex justify-between mb-3 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {post.avatarSrc && (
                        <Image
                            src={post.avatarSrc}
                            alt="Author Avatar"
                            width={40}
                            height={40}
                            className="size-[40px] rounded-full object-cover flex-shrink-0"
                        />
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-bold text-sm truncate">
                            {post.author}
                        </span>
                        <span className="text-muted-foreground text-xs truncate">
                            @hololive_En
                        </span>
                    </div>
                </div>
                <a href={post.src} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
            </div>

            {/* Content */}
            <div className="relative">
                <div
                    ref={contentRef}
                    className={cn(
                        "mb-3 break-words overflow-hidden transition-all duration-300",
                        !isExpanded && needsExpansion && "max-h-[100px]",
                    )}
                    style={{
                        maxHeight:
                            !isExpanded && needsExpansion
                                ? `${MAX_CONTENT_HEIGHT}px`
                                : "none",
                    }}
                >
                    <ViewMarkdown
                        className="break-words overflow-hidden"
                        onNodeLinkClicked={() => {}}
                        onEdgeLinkClicked={() => {}}
                    >
                        {post.content}
                    </ViewMarkdown>
                </div>

                {/* Show more/less gradient overlay and button */}
                {needsExpansion && !isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none mb-4" />
                )}

                {needsExpansion && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline mt-1 mb-2"
                    >
                        {isExpanded ? (
                            <>
                                <span>Show less</span>
                                <ChevronUp className="w-3 h-3" />
                            </>
                        ) : (
                            <>
                                <span>Show more</span>
                                <ChevronDown className="w-3 h-3" />
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Media */}
            {post.media.src && post.media.type === "image" && (
                <div className="rounded-lg overflow-hidden border border-foreground/10 mb-3">
                    <Lightbox
                        src={post.media.src}
                        alt="Post media"
                        width={600}
                        height={338}
                        className="w-full h-auto"
                    />
                </div>
            )}

            {post.media.src && post.media.type === "video" && (
                <div className="rounded-lg overflow-hidden border border-foreground/10 mb-3">
                    <video
                        controls
                        className="w-full h-auto"
                        src={post.media.src}
                    />
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
    const [selectedChapter, setSelectedChapter] = useState<string>("all");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [columnCount, setColumnCount] = useState(3);
    const [masonryColumns, setMasonryColumns] = useState<MasonryColumn[]>([]);

    const contentContainerRef = useRef<HTMLDivElement>(null);

    const newsData = newsDataEn as NewsData[];

    const chapters = useMemo(() => {
        const uniqueChapters = new Set<number>();
        newsData.forEach((post) => uniqueChapters.add(post.chapter));
        return Array.from(uniqueChapters).sort((a, b) => a - b);
    }, [newsData]);

    const categories = useMemo(() => {
        const uniqueCategories = new Set<string>();
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
            <VisuallyHidden>
                <DialogTitle>News Modal</DialogTitle>
            </VisuallyHidden>
            <DialogContent
                showXButton={true}
                className="rounded-lg w-full max-w-[95vw] lg:max-w-[1200px] h-[90vh] flex flex-col p-6"
                backdropFilter={backdropFilter}
            >
                <VisuallyHidden>
                    <DialogDescription>
                        View ENreco News updates
                    </DialogDescription>
                </VisuallyHidden>

                <div className="flex flex-col flex-1 overflow-hidden gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 mt-2 md:mx-2">
                        {/* Search Bar */}
                        <Input
                            type="text"
                            placeholder="Search news..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                        />

                        {/* Chapter Filter */}
                        <Select
                            value={selectedChapter}
                            onValueChange={setSelectedChapter}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Chapter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {tCommon("allChapters")}
                                </SelectItem>
                                {chapters.map((chapter) => (
                                    <SelectItem
                                        key={chapter}
                                        value={chapter.toString()}
                                    >
                                        {`Chapter ${chapter + 1}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Category Filter */}
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {t(`categories.${category}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Sort Toggle */}
                        <Button
                            variant="outline"
                            onClick={toggleSortOrder}
                            className="w-full sm:w-auto"
                        >
                            {sortOrder === "newest" ? "Newest" : "Oldest"}
                        </Button>
                    </div>

                    <div
                        ref={setContentContainerRef}
                        className="flex-1 overflow-y-scroll overflow-x-hidden pr-2"
                    >
                        {/* Masonry Grid */}
                        <div className="flex gap-4">
                            {masonryColumns.map((column, colIndex) => (
                                <div
                                    key={colIndex}
                                    className="flex flex-col flex-1"
                                    style={{
                                        width: `${100 / columnCount}%`,
                                    }}
                                >
                                    {column.items.map(({ post, index }) => (
                                        <NewsPostItem
                                            key={index}
                                            post={post}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="text-center py-4 text-muted-foreground">
                                Loading...
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <DialogClose asChild>
                        <Button variant="outline">
                            {tCommon("actions.close")}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NewsModal;
