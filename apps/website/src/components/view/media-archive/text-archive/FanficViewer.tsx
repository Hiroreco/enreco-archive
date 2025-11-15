import NoJaHereYetModal from "@/components/view/basic-modals/NoJaHereYetModal";
import { FanficEntry } from "@/components/view/media-archive/text-archive/types";
import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import {
    ArrowLeft,
    ExternalLink,
    Info,
    Maximize2,
    User,
    X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode, useEffect, useState } from "react";

interface FanficViewerProps {
    fanfic: FanficEntry;
    onBack: () => void;
}

const R2_PUBLIC_URL = "https://fanfics.enreco-archive.net";

async function loadStory(storyKey: string): Promise<string> {
    const response = await fetch(`${R2_PUBLIC_URL}/${storyKey}`);
    if (!response.ok) {
        console.error("Error fetching story:", response.statusText);
        throw new Error(`Failed to load story: ${response.statusText}`);
    }
    return await response.text();
}

const FanficViewer = ({ fanfic, onBack }: FanficViewerProps) => {
    const t = useTranslations("mediaArchive.textArchive");

    const [storyContent, setStoryContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<ReactNode | null>(null);
    const [isReadMode, setIsReadMode] = useState(false);
    const [currentChapter, setCurrentChapter] = useState(1);

    useEffect(() => {
        const fetchStory = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const chapter = fanfic.chapters.find(
                    (ch) => ch.number === currentChapter,
                );
                if (!chapter) {
                    throw new Error("Chapter not found");
                }
                const content = await loadStory(chapter.storyKey);

                setStoryContent(content);
            } catch (err) {
                setError(
                    t.rich("fanficError", {
                        link: (children) => (
                            <a
                                href={fanfic.src}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-primary"
                            >
                                {children}
                            </a>
                        ),
                    }),
                );
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStory();
    }, [fanfic.chapters, currentChapter, fanfic.src, t]);

    const currentChapterData = fanfic.chapters.find(
        (ch) => ch.number === currentChapter,
    );

    const InfoModalContent = () => (
        <div className="max-h-[60vh] overflow-y-scroll">
            <div className="flex items-center gap-2 mb-3">
                <User className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{fanfic.author}</span>
            </div>
            {fanfic.summary && (
                <div className="mb-3">
                    <p className="text-xs font-semibold mb-1 opacity-70">
                        {t("info.summary")}
                    </p>
                    <div
                        className="text-sm"
                        dangerouslySetInnerHTML={{ __html: fanfic.summary }}
                    />
                </div>
            )}
            {fanfic.characters.length > 0 && (
                <div className="mb-3">
                    <p className="text-xs font-semibold mb-1 opacity-70">
                        {t("info.characters")}
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {fanfic.characters.map((char, idx) => (
                            <span
                                key={idx}
                                className="text-xs px-2 py-1 rounded-md bg-primary/20 text-primary"
                            >
                                {char}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {fanfic.tags.length > 0 && (
                <div>
                    <p className="text-xs font-semibold mb-1 opacity-70">
                        {t("info.tags")}
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {fanfic.tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="text-xs px-2 py-1 rounded-md bg-accent/20 text-accent"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const ChapterSelector = ({ className }: { className?: string }) => {
        return (
            <Select
                value={currentChapter.toString()}
                onValueChange={(value) => setCurrentChapter(parseInt(value))}
            >
                <SelectTrigger className={cn("w-[200px]", className)}>
                    <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                    {fanfic.chapters.map((chapter) => (
                        <SelectItem
                            key={chapter.number}
                            value={chapter.number.toString()}
                        >
                            {chapter.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    };

    // Story Content Component
    const StoryContent = () => (
        <div className={cn("rounded-lg p-6")}>
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : error ? (
                <div className="text-center text-destructive dark:text-red-300 py-12">
                    {error}
                </div>
            ) : (
                <div>
                    <p className="text-xl font-bold flex-1 min-w-0 truncate text-center underline underline-offset-2">
                        {currentChapterData?.title || fanfic.title}
                    </p>
                    <p className="text-center text-sm">{fanfic.author}</p>
                    {currentChapterData?.summary && (
                        <div
                            className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto"
                            dangerouslySetInnerHTML={{
                                __html: currentChapterData.summary,
                            }}
                        ></div>
                    )}
                    <div
                        id="story-content"
                        className="prose prose-sm dark:prose-invert mt-10 max-w-4xl mx-auto md:text-base text-[0.95rem]"
                        dangerouslySetInnerHTML={{
                            __html: storyContent,
                        }}
                    />

                    <Separator className="bg-foreground/60 my-6" />
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            disabled={currentChapter <= 1}
                            onClick={() =>
                                setCurrentChapter(currentChapter - 1)
                            }
                        >
                            {t("chapterNavigation.previousChapter")}
                        </Button>
                        <Button
                            variant="outline"
                            disabled={currentChapter >= fanfic.totalChapters}
                            onClick={() =>
                                setCurrentChapter(currentChapter + 1)
                            }
                        >
                            {t("chapterNavigation.nextChapter")}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col gap-4 h-full pt-2">
            <NoJaHereYetModal />
            <div className="flex items-center gap-3 px-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onBack}
                    className="shrink-0"
                >
                    <ArrowLeft className="size-5" />
                </Button>

                <ChapterSelector className="flex-1" />

                <div className="flex items-center gap-2 shrink-0">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Info className="size-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent showXButton={true}>
                            <DialogHeader>
                                <DialogTitle asChild>
                                    <span>{fanfic.title}</span>
                                </DialogTitle>
                            </DialogHeader>
                            <Separator className="my-2 bg-foreground/60" />
                            <DialogDescription asChild>
                                <InfoModalContent />
                            </DialogDescription>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isReadMode} onOpenChange={setIsReadMode}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                title={t("readMode")}
                            >
                                <Maximize2 className="size-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent
                            className="max-w-none w-screen h-screen md:h-[95vh] m-0 p-0 rounded-none"
                            showXButton={false}
                        >
                            <DialogTitle className="sr-only">
                                {fanfic.title}
                            </DialogTitle>
                            <div className="h-full flex flex-col">
                                <div className="sticky top-0 dark:bg-background/95 backdrop-blur-sm border-b border-border z-10">
                                    <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    setIsReadMode(false)
                                                }
                                                className="shrink-0"
                                            >
                                                <X className="size-5" />
                                            </Button>
                                            <div className="text-lg font-bold truncate">
                                                {fanfic.title}
                                            </div>
                                        </div>
                                        <ChapterSelector />
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                    >
                                                        <Info className="size-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent
                                                    showXButton={true}
                                                >
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            {fanfic.title}
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <DialogDescription asChild>
                                                        <div>
                                                            <InfoModalContent />
                                                        </div>
                                                    </DialogDescription>
                                                </DialogContent>
                                            </Dialog>
                                            <a
                                                href={fanfic.src}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                >
                                                    <ExternalLink className="size-4" />
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    <div className="max-w-4xl mx-auto py-6">
                                        <StoryContent />
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <a
                        href={fanfic.src}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="outline" size="icon">
                            <ExternalLink className="size-4" />
                        </Button>
                    </a>
                </div>
            </div>
            <div className="overflow-y-auto py-2">
                <StoryContent />
            </div>
        </div>
    );
};

export default FanficViewer;
