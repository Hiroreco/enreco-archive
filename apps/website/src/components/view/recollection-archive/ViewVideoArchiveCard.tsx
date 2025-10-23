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
import { ArrowLeft, Info } from "lucide-react";
import ViewVideoArchiveViewer from "@/components/view/recollection-archive/ViewVideoArchiveViewer";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";

interface ViewVideoArchiveCardProps {
    className?: string;
    bgImage: string;
}

const ViewVideoArchiveCard = ({
    className,
    bgImage,
}: ViewVideoArchiveCardProps) => {
    const t = useTranslations("mediaArchive");
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
        <Card className={cn("items-card flex flex-col relaßtive", className)}>
            <CardHeader className="px-6 pb-3">
                <CardTitle className="font-bold flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        {selectedEntry && (
                            <button
                                onClick={handleBackClick}
                                className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
                                aria-label="Back to list"
                            >
                                <ArrowLeft className="size-5" />
                            </button>
                        )}
                        <span className="p-2 md:text-xl text-lg">
                            {selectedEntry ? selectedEntry.title : t("title")}
                        </span>
                    </div>

                    <Dialog>
                        <DialogTrigger className="p-0 m-0">
                            <Info size={20} className="text-muted-foreground" />
                        </DialogTrigger>
                        <DialogContent
                            showXButton={true}
                            showXButtonForce={true}
                        >
                            <DialogHeader>
                                <DialogTitle>
                                    {selectedEntry? selectedEntry.title : t("title")}
                                </DialogTitle>
                            </DialogHeader>

                            <DialogDescription>
                                {selectedEntry ? selectedEntry.description : t("description")}
                            </DialogDescription>
                        </DialogContent>
                    </Dialog>

                    <p className="text-muted-foreground text-xs font-normal md:block hidden">
                        {selectedEntry
                            ? selectedEntry.description
                            : t("description")}
                    </p>
                </CardTitle>
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
                            className="flex flex-col items-center gap-6"
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
    const t = useTranslations("mediaArchive");
    const tCommon = useTranslations("common");

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-4">
                <Separator className="bg-foreground/60 flex-1" />
                <span className="text-lg font-bold whitespace-nowrap">
                    {tCommon("chapter", { val: chapter })}
                </span>
                <Separator className="bg-foreground/60 flex-1" />
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3">
                {Object.entries(categories).map(([categoryName, entries]) =>
                    entries.map((entry, index) => (
                        <div
                            key={entry.id}
                            className="flex flex-col gap-1.5 mb-2"
                        >
                            {/* Category label only on first entry */}
                            {index === 0 && (
                                <span className="text-xs font-medium text-muted-foreground">
                                    {t(`category.${categoryName}`)}
                                </span>
                            )}
                            <ViewVideoArchiveSelector
                                entry={entry}
                                onEntryClick={onEntryClick}
                            />
                        </div>
                    )),
                )}
            </div>
        </div>
    );
};

export default ViewVideoArchiveCard;
