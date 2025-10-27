import { ClipEntry } from "@/components/view/recollection-archive/types";
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
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";

interface ViewClipsViewerProps {
    clips: ClipEntry[];
    onClipClick: (clip: ClipEntry) => void;
}

const ViewClipsViewer = ({ clips, onClipClick }: ViewClipsViewerProps) => {
    const t = useTranslations("mediaArchive");
    const tCommon = useTranslations("common");

    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedChapter, setSelectedChapter] = useState<number>(-1);
    const [searchQuery, setSearchQuery] = useState("");

    // Extract unique categories and chapters
    const categories = useMemo(() => {
        const cats = new Set(clips.map((clip) => clip.category));
        return ["all", ...Array.from(cats)];
    }, [clips]);

    const chapters = useMemo(() => {
        const chaps = new Set(clips.map((clip) => clip.chapter));
        return Array.from(chaps).sort((a, b) => a - b);
    }, [clips]);

    // Filter clips
    const filteredClips = useMemo(() => {
        return clips.filter((clip) => {
            const matchesCategory =
                selectedCategory === "all" ||
                clip.category === selectedCategory;
            const matchesChapter =
                selectedChapter === -1 || clip.chapter === selectedChapter;
            const matchesSearch =
                searchQuery === "" ||
                clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                clip.author.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesCategory && matchesChapter && matchesSearch;
        });
    }, [clips, selectedCategory, selectedChapter, searchQuery]);

    // Group by chapter
    const groupedClips = useMemo(() => {
        const grouped: Record<number, ClipEntry[]> = {};
        filteredClips.forEach((clip) => {
            if (!grouped[clip.chapter]) {
                grouped[clip.chapter] = [];
            }
            grouped[clip.chapter].push(clip);
        });
        return grouped;
    }, [filteredClips]);

    const sortedChapters = useMemo(
        () => Object.keys(groupedClips).sort((a, b) => Number(a) - Number(b)),
        [groupedClips],
    );

    return (
        <div className="flex h-full gap-4">
            {/* Sidebar - Categories */}
            <div className="hidden md:flex flex-col gap-2 w-48 shrink-0 overflow-y-auto">
                <p className="text-sm font-semibold mb-2">
                    {t("clipArchive.categories")}
                </p>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                            "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            "hover:bg-foreground/10",
                            selectedCategory === category &&
                                "bg-foreground/20 font-semibold",
                        )}
                    >
                        {category === "all"
                            ? t("clipArchive.category.all")
                            : t(`clipArchive.category.${category}`)}
                    </button>
                ))}
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                {/* Top controls */}
                <div className="flex gap-2 flex-wrap">
                    {/* Mobile category select */}
                    <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                    >
                        <SelectTrigger className="md:hidden w-[180px]">
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

                    {/* Search */}
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

                    {/* Chapter select */}
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

                {/* Clips grid */}
                <div className="flex-1 overflow-y-auto">
                    {filteredClips.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            {t("clipArchive.noResults")}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {sortedChapters.map((chapterKey) => {
                                const chapter = Number(chapterKey);
                                const chapterClips = groupedClips[chapter];

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
                                            {chapterClips.map((clip, index) => (
                                                <ClipCard
                                                    key={clip.id + "-" + index}
                                                    clip={clip}
                                                    onClick={() =>
                                                        onClipClick(clip)
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
    return (
        <div
            onClick={onClick}
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
        >
            <div className="relative w-full aspect-video overflow-hidden">
                <Image
                    src={clip.thumbnailSrc}
                    alt={clip.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    blurDataURL={getBlurDataURL(clip.thumbnailSrc)}
                    placeholder={
                        getBlurDataURL(clip.thumbnailSrc) ? "blur" : "empty"
                    }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            <div className="p-2.5 flex flex-col gap-1">
                <span className="font-semibold text-xs line-clamp-2 leading-tight">
                    {clip.title}
                </span>
                <p className="text-[10px] text-muted-foreground">
                    {clip.author}
                </p>
            </div>
        </div>
    );
};

export default ViewClipsViewer;
