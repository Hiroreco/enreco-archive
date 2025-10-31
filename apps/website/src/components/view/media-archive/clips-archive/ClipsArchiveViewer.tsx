import { CATEGORY_ICON_MAP } from "@/components/view/media-archive/constants";
import { ClipEntry } from "@/components/view/media-archive/types";
import { getBlurDataURL } from "@/lib/utils";
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
import { Film, Search, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";

interface ClipsArchiveViewer {
    clips: ClipEntry[];
    streams: ClipEntry[];
    onClipClick: (clip: ClipEntry) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}

const ClipsArchiveViewer = ({
    clips,
    streams,
    onClipClick,
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

    const hasStreams = streams.length > 0;
    const currentData = activeContentType === "clips" ? clips : streams;

    const categories = useMemo(() => {
        const cats = new Set(currentData.map((clip) => clip.category));
        return ["all", ...Array.from(cats)];
    }, [currentData]);

    const chapters = useMemo(() => {
        const chaps = new Set(currentData.map((clip) => clip.chapter));
        return Array.from(chaps).sort((a, b) => a - b);
    }, [currentData]);

    // Filter clips/streams
    const filteredData = useMemo(() => {
        return currentData.filter((item) => {
            const matchesCategory =
                selectedCategory === "all" ||
                item.category === selectedCategory;
            const matchesChapter =
                selectedChapter === -1 || item.chapter === selectedChapter;
            const matchesSearch =
                searchQuery === "" ||
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.author.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesCategory && matchesChapter && matchesSearch;
        });
    }, [currentData, selectedCategory, selectedChapter, searchQuery]);

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
                {hasStreams && (
                    <Tabs
                        value={activeContentType}
                        onValueChange={(v) =>
                            setActiveContentType(v as "clips" | "streams")
                        }
                    >
                        <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="clips" className="gap-2">
                                <Film className="size-4" />
                                <span className="hidden sm:inline">
                                    {t("clipArchive.tabs.clips")}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="streams" className="gap-2">
                                <Video className="size-4" />
                                <span className="hidden sm:inline">
                                    {t("clipArchive.tabs.streams")}
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                )}

                <div className="flex gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder={t("clipArchive.searchPlaceholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <Select
                        value={selectedChapter.toString()}
                        onValueChange={(val) => setSelectedChapter(Number(val))}
                    >
                        <SelectTrigger className="w-[180px]">
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
                <Select
                    value={selectedCategory}
                    onValueChange={onCategoryChange}
                >
                    <SelectTrigger className="md:hidden w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category === "all"
                                    ? t("clipArchive.category.all")
                                    : t(`clipArchive.category.${category}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Data grid */}
                <div className="flex-1 overflow-y-auto">
                    {filteredData.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            {t("clipArchive.noResults")}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {sortedChapters.map((chapterKey) => {
                                const chapter = Number(chapterKey);
                                const chapterItems = groupedData[chapter];

                                return (
                                    <div key={chapter}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <Separator className="bg-foreground/60 flex-1" />
                                            <span className="text-sm font-semibold whitespace-nowrap">
                                                {tCommon("chapter", {
                                                    val: chapter,
                                                })}
                                            </span>
                                            <Separator className="bg-foreground/60 flex-1" />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {chapterItems.map((item, index) => (
                                                <ClipCard
                                                    key={item.id + "-" + index}
                                                    clip={item}
                                                    onClick={() =>
                                                        onClipClick(item)
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface ClipCardProps {
    clip: ClipEntry;
    onClick: () => void;
}

const ClipCard = ({ clip, onClick }: ClipCardProps) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <a
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            className={cn(
                "group cursor-pointer overflow-hidden rounded-lg",
                "bg-white/90 dark:bg-white/10 backdrop-blur-md shadow-lg",
                "hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
                "flex flex-col",
            )}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick();
                }
            }}
            href={clip.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
        >
            <div className="relative w-full aspect-video overflow-hidden">
                <Image
                    src={clip.thumbnailSrc}
                    alt={clip.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
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
        </a>
    );
};

export default ClipsArchiveViewer;
