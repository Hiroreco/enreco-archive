import newsDataEn from "#/news.json";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { Input } from "@enreco-archive/common-ui/components/input";
import { NewsData } from "@enreco-archive/common/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Calendar, ExternalLink, Search, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { ViewMarkdown } from "@/components/view/markdown/Markdown";

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

const ITEMS_PER_PAGE = 20;

const NewsPostItem = ({ post, index }: NewsPostItemProps) => {
    const postDate = new Date(post.date);
    const formattedDate = postDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

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
            <ViewMarkdown
                className="mb-3 break-words overflow-hidden"
                onNodeLinkClicked={() => {}}
                onEdgeLinkClicked={() => {}}
            >
                {post.content}
            </ViewMarkdown>

            {/* Media */}
            {post.media.src && post.media.type === "image" && (
                <div className="rounded-lg overflow-hidden border border-foreground/10 mb-3">
                    <Image
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
    const tCommon = useTranslations("common");
    const backdropFilter = useSettingStore((state) => state.backdropFilter);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [columnCount, setColumnCount] = useState(3);
    const [masonryColumns, setMasonryColumns] = useState<MasonryColumn[]>([]);

    const contentContainerRef = useRef<HTMLDivElement>(null);

    const newsData = newsDataEn as NewsData[];

    const authors = useMemo(() => {
        const uniqueAuthors = new Set<string>();
        newsData.forEach((post) => uniqueAuthors.add(post.author));
        return Array.from(uniqueAuthors).sort();
    }, [newsData]);

    const allFilteredNews = useMemo(() => {
        let filtered = newsData;

        if (selectedAuthor !== "all") {
            filtered = filtered.filter(
                (post) => post.author === selectedAuthor,
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
    }, [newsData, selectedAuthor, searchQuery, sortOrder]);

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

    const resetFilters = useCallback(() => {
        setSearchQuery("");
        setSelectedAuthor("all");
        setSortOrder("newest");
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
    }, [searchQuery, selectedAuthor, sortOrder]);

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
                    <div className="border-b border-foreground/20 pb-4">
                        <h2 className="text-2xl font-bold text-center">
                            ENreco News
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1 text-center">
                            Latest updates and announcements
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search news..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select
                            value={selectedAuthor}
                            onValueChange={setSelectedAuthor}
                        >
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by author" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Authors</SelectItem>
                                {authors.map((author) => (
                                    <SelectItem key={author} value={author}>
                                        {author}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleSortOrder}
                            title={
                                sortOrder === "newest"
                                    ? "Newest first"
                                    : "Oldest first"
                            }
                        >
                            <ArrowUpDown className="w-4 h-4" />
                        </Button>

                        <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="w-full sm:w-auto"
                        >
                            Reset
                        </Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Showing {paginatedNews.length} of{" "}
                        {allFilteredNews.length} posts
                    </div>

                    <div
                        ref={setContentContainerRef}
                        className="flex-1 overflow-y-scroll overflow-x-hidden pr-2"
                    >
                        {paginatedNews.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No news posts found
                            </div>
                        ) : (
                            <div className="flex gap-4 items-start w-full">
                                {masonryColumns.map((column, colIndex) => (
                                    <div
                                        key={colIndex}
                                        className="flex-1 flex flex-col min-w-0"
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
                        )}

                        {isLoading && (
                            <div className="text-center py-4 text-muted-foreground">
                                Loading more...
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <DialogClose asChild>
                        <Button className="md:hidden min-w-20">
                            {tCommon("close")}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NewsModal;
