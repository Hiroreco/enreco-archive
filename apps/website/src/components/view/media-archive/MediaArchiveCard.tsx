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
import { ClipEntry, RecollectionArchiveEntry } from "./types";
import { getBlurDataURL } from "@/lib/utils";
import { ArrowLeft, Film, Info, Video } from "lucide-react";
import VideoArchiveViewer from "@/components/view/media-archive/video-archive/VideoArchiveViewer";
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
import ClipsArchiveViewer from "@/components/view/media-archive/clips-archive/ClipsArchiveViewer";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@enreco-archive/common-ui/components/tabs";
import Lightbox from "@/components/view/lightbox/Lightbox";
import VideoArchiveSection from "./video-archive/VideoArchiveSection";
import { CATEGORY_ICON_MAP } from "@/components/view/media-archive/constants";

interface VideoArchiveCardProps {
    className?: string;
    bgImage: string;
}

const VideoArchiveCard = ({ className, bgImage }: VideoArchiveCardProps) => {
    const t = useTranslations("mediaArchive");
    const [selectedEntry, setSelectedEntry] =
        useState<RecollectionArchiveEntry | null>(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [selectedClipCategory, setSelectedClipCategory] =
        useState<string>("all");

    const { getRecollectionArchive, getClipsData } = useLocalizedData();
    const data = getRecollectionArchive();
    const [selectedClip, setSelectedClip] = useState<ClipEntry | null>(null);

    const clipsData = getClipsData();

    const handleClipClick = (clip: ClipEntry) => {
        setSelectedClip(clip);
    };

    const [activeTab, setActiveTab] = useState<"videos" | "clips">("videos");

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
        if (activeTab === "videos") {
            if (!selectedEntry) return bgImage;
            const currentMedia = selectedEntry.entries[currentMediaIndex];
            return currentMedia?.thumbnailUrl || bgImage;
        }
        // For clips, use the first category icon from CATEGORY_ICON_MAP
        return selectedClipCategory === "all"
            ? bgImage
            : CATEGORY_ICON_MAP[selectedClipCategory] || bgImage;
    }, [
        selectedEntry,
        currentMediaIndex,
        bgImage,
        activeTab,
        selectedClipCategory,
    ]);

    return (
        <Card className={cn("items-card flex flex-col relative", className)}>
            <CardHeader className="px-6 pb-3">
                <CardTitle className="font-bold flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        {selectedEntry && activeTab === "videos" && (
                            <button
                                onClick={handleBackClick}
                                className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
                                aria-label="Back to list"
                            >
                                <ArrowLeft className="size-5" />
                            </button>
                        )}
                        <span className="p-2 md:text-xl text-base">
                            {activeTab === "videos"
                                ? selectedEntry
                                    ? selectedEntry.title
                                    : t("videoArchive.title")
                                : t("clipArchive.title")}
                        </span>
                    </div>

                    <Dialog>
                        <DialogTrigger className="p-0 m-0">
                            <Info
                                size={20}
                                className="text-muted-foreground md:hidden block"
                            />
                        </DialogTrigger>
                        <DialogContent
                            showXButton={true}
                            showXButtonForce={true}
                        >
                            <DialogHeader>
                                <DialogTitle>
                                    {activeTab === "videos"
                                        ? selectedEntry
                                            ? selectedEntry.title
                                            : t("videoArchive.title")
                                        : t("clipArchive.title")}
                                </DialogTitle>
                            </DialogHeader>

                            <DialogDescription>
                                {activeTab === "videos"
                                    ? selectedEntry
                                        ? selectedEntry.description
                                        : t("videoArchive.description")
                                    : t("clipArchive.description")}
                            </DialogDescription>
                        </DialogContent>
                    </Dialog>

                    <p className="text-muted-foreground text-xs font-normal md:block hidden">
                        {activeTab === "videos"
                            ? selectedEntry
                                ? selectedEntry.description
                                : t("videoArchive.description")
                            : t("clipArchive.description")}
                    </p>
                </CardTitle>
                <Separator className="bg-foreground/60" />
            </CardHeader>

            <CardContent className="overflow-y-auto px-6 pb-6 h-[70dvh] sm:h-[80dvh]">
                <AnimatePresence mode="wait">
                    {activeTab === "videos" && selectedEntry ? (
                        <VideoArchiveViewer
                            entry={selectedEntry}
                            onMediaIndexChange={setCurrentMediaIndex}
                        />
                    ) : activeTab === "videos" ? (
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
                                    <VideoArchiveSection
                                        key={chapter}
                                        chapter={chapter}
                                        categories={categories}
                                        onEntryClick={handleEntryClick}
                                    />
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="clips-viewer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="h-full"
                        >
                            <ClipsArchiveViewer
                                clips={clipsData.clips}
                                streams={clipsData.streams}
                                selectedCategory={selectedClipCategory}
                                onCategoryChange={setSelectedClipCategory}
                                onClipClick={handleClipClick}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Fade shadow for overflow */}
                {!selectedEntry && activeTab === "videos" && (
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/5 to-transparent pointer-events-none z-10" />
                )}
            </CardContent>

            {/* Tabs Footer */}
            <div className="px-6 flex justify-end border-t border-t-foreground/60 py-3">
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as "videos" | "clips")}
                >
                    <TabsList className="grid grid-cols-2 opacity-90">
                        <TabsTrigger value="videos" className="gap-2">
                            <Video className="size-4" />
                            <span className="hidden sm:inline">
                                {t("tabs.videos")}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="clips" className="gap-2">
                            <Film className="size-4" />
                            <span className="hidden sm:inline">
                                {t("tabs.clips")}
                            </span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Lightbox for clips */}
            {selectedClip && (
                <Lightbox
                    alt={selectedClip.title}
                    src={selectedClip.originalUrl}
                    authorSrc={selectedClip.originalUrl}
                    type="video"
                    isExternallyControlled={true}
                    externalIsOpen={!!selectedClip}
                    onExternalClose={() => setSelectedClip(null)}
                    galleryItems={[
                        {
                            src: selectedClip.originalUrl,
                            alt: selectedClip.title,
                            type: "video",
                            thumbnailSrc: selectedClip.thumbnailSrc,
                        },
                    ]}
                />
            )}

            {/* Background */}
            <AnimatePresence>
                <motion.div
                    key={`card-bg-${selectedEntry?.id || selectedClipCategory}`}
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
                        className="object-cover dark:opacity-20 opacity-20"
                        priority={false}
                    />
                    <div className="absolute inset-0 dark:bg-black/30 " />
                </motion.div>
            </AnimatePresence>
        </Card>
    );
};

export default VideoArchiveCard;
