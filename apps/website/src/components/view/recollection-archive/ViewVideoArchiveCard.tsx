import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@enreco-archive/common-ui/components/card";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import ViewVideoArchiveSelector from "@/components/view/recollection-archive/ViewVideoArchiveSelector";
import { RecollectionArchiveEntry } from "./types";
import { getBlurDataURL } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import ViewVideoArchiveViewer from "@/components/view/recollection-archive/ViewVideoArchiveViewer";
import { useLocalizedData } from "@/hooks/useLocalizedData";

interface ViewVideoArchiveCardProps {
    className?: string;
    bgImage: string;
}

const ViewVideoArchiveCard = ({
    className,
    bgImage,
}: ViewVideoArchiveCardProps) => {
    const [selectedEntry, setSelectedEntry] =
        useState<RecollectionArchiveEntry | null>(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const { getRecollectionArchive } = useLocalizedData();
    const data = getRecollectionArchive();

    const groupedEntries = useMemo(() => {
        const grouped: Record<
            number,
            Record<string, RecollectionArchiveEntry[]>
        > = {};

        data.forEach((entry) => {
            if (!grouped[entry.chapter]) {
                grouped[entry.chapter] = {};
            }
            if (!grouped[entry.chapter][entry.category]) {
                grouped[entry.chapter][entry.category] = [];
            }
            grouped[entry.chapter][entry.category].push(entry);
        });

        return grouped;
    }, [data]);

    const sortedChapters = useMemo(
        () => Object.keys(groupedEntries).sort((a, b) => Number(b) - Number(a)),
        [groupedEntries],
    );

    const handleEntryClick = (entry: RecollectionArchiveEntry) => {
        setSelectedEntry(entry);
    };

    const handleBackClick = () => {
        setSelectedEntry(null);
    };

    const viewerBg = useMemo(() => {
        if (!selectedEntry) return bgImage;
        const currentMedia = selectedEntry.entries[currentMediaIndex];
        return currentMedia?.thumbnailUrl || bgImage;
    }, [selectedEntry, currentMediaIndex, bgImage]);

    return (
        <Card className={cn("items-card flex flex-col relative", className)}>
            <CardHeader className="pb-4 px-6 text-center">
                {selectedEntry && (
                    <button
                        onClick={handleBackClick}
                        className="absolute left-4 top-4 p-2 hover:bg-foreground/10 rounded-lg transition-colors"
                        aria-label="Back to list"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}

                <CardTitle className="text-xl font-bold">
                    {selectedEntry
                        ? selectedEntry.title
                        : "Hall of Recollections"}
                </CardTitle>
                <p className="text-muted-foreground text-xs mt-1">
                    {selectedEntry
                        ? selectedEntry.description
                        : "A collection of memories and moments"}
                </p>
                <Separator className="mt-3 bg-foreground/60" />
            </CardHeader>

            <CardContent className="overflow-y-auto px-6 pb-6 h-[65dvh] sm:h-[70dvh]">
                <AnimatePresence mode="wait">
                    {selectedEntry ? (
                        <ViewVideoArchiveViewer
                            entry={selectedEntry}
                            onMediaIndexChange={setCurrentMediaIndex}
                        />
                    ) : (
                        <motion.div
                            key="archive-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex flex-col items-center gap-8"
                        >
                            {sortedChapters.map((chapterKey) => {
                                const chapter = Number(chapterKey);
                                const categories = groupedEntries[chapter];

                                return (
                                    <ChapterSection
                                        key={chapter}
                                        chapter={chapter}
                                        categories={categories}
                                        onEntryClick={handleEntryClick}
                                    />
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Fade shadow for overflow */}
                {!selectedEntry && (
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/5 to-transparent pointer-events-none z-10" />
                )}
            </CardContent>

            {/* Background */}
            <AnimatePresence>
                <motion.div
                    key={`card-bg-${selectedEntry?.id || "list"}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 -z-10"
                >
                    <Image
                        src={getBlurDataURL(viewerBg)}
                        alt=""
                        fill
                        className="object-cover blur-xl dark:opacity-20 opacity-40"
                        priority={false}
                    />
                    <div className="absolute inset-0 dark:bg-black/30 bg-white/30" />
                </motion.div>
            </AnimatePresence>
        </Card>
    );
};

interface ChapterSectionProps {
    chapter: number;
    categories: Record<string, RecollectionArchiveEntry[]>;
    onEntryClick: (entry: RecollectionArchiveEntry) => void;
}

const ChapterSection = ({
    chapter,
    categories,
    onEntryClick,
}: ChapterSectionProps) => {
    return (
        <div className="w-full flex flex-col items-center gap-4">
            {/* Chapter Header */}
            <div className="text-center">
                <span className="text-xl font-bold">Chapter {chapter}</span>
                <Separator className="bg-foreground/60" />
            </div>

            {/* Categories */}
            {Object.entries(categories).map(([categoryName, entries]) => (
                <CategorySection
                    key={categoryName}
                    categoryName={categoryName}
                    entries={entries}
                    onEntryClick={onEntryClick}
                />
            ))}
        </div>
    );
};

interface CategorySectionProps {
    categoryName: string;
    entries: RecollectionArchiveEntry[];
    onEntryClick: (entry: RecollectionArchiveEntry) => void;
}

const CategorySection = ({
    categoryName,
    entries,
    onEntryClick,
}: CategorySectionProps) => {
    return (
        <div className="w-full flex flex-col items-center gap-3">
            {/* Category Header */}
            <span className="text-lg font-semibold text-muted-foreground">
                {categoryName}
            </span>

            {/* Entries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-[900px]">
                {entries.map((entry) => (
                    <ViewVideoArchiveSelector
                        key={entry.id}
                        entry={entry}
                        onEntryClick={onEntryClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default ViewVideoArchiveCard;
