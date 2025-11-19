import { ViewMarkdown } from "@/components/view/markdown/Markdown";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { useAudioStore } from "@/store/audioStore";
import { useSettingStore } from "@/store/settingStore";
import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
    BookOpenTextIcon,
    ChevronLeft,
    ChevronRight,
    Info,
    Play,
    Square,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

interface TextModalProps {
    textId: string;
    label: string | ReactNode;
    showDescriptionPanel?: boolean;
}

const TextModal = ({
    textId,
    label,
    showDescriptionPanel = false,
}: TextModalProps) => {
    const tCommon = useTranslations("common");
    const tText = useTranslations("modals.text");
    const { getTextItem, getTextData } = useLocalizedData();
    const textData = getTextData();

    const {
        playSFX,
        playTextAudio,
        stopTextAudio,
        textAudioState,
        pauseBGM,
        playBGM,
    } = useAudioStore();
    const backdropFilter = useSettingStore((state) => state.backdropFilter);

    // Find the text group that contains this textId
    const textGroup = useMemo(() => {
        const group = textData[textId];
        if (!group) {
            const item = getTextItem(textId);
            if (item) {
                return {
                    title: item.title,
                    entries: [item],
                    description: "",
                };
            }
            return null;
        }
        return group;
    }, [textData, textId, getTextItem]);

    const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
    const [showInfo, setShowInfo] = useState(false);

    const currentEntry = useMemo(() => {
        if (!textGroup) return null;
        return textGroup.entries[currentEntryIndex];
    }, [textGroup, currentEntryIndex]);

    const canGoNext = useMemo(() => {
        if (!textGroup) return false;
        return currentEntryIndex < textGroup.entries.length - 1;
    }, [textGroup, currentEntryIndex]);

    const canGoPrev = useMemo(() => {
        return currentEntryIndex > 0;
    }, [currentEntryIndex]);

    const goToNext = useCallback(() => {
        if (canGoNext) {
            setCurrentEntryIndex((prev) => prev + 1);
        }
    }, [canGoNext]);

    const goToPrev = useCallback(() => {
        if (canGoPrev) {
            setCurrentEntryIndex((prev) => prev - 1);
        }
    }, [canGoPrev]);

    useEffect(() => {
        if (!textGroup) return;
        setCurrentEntryIndex(0);
    }, [textId, textGroup]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isAnyDialogOpen =
                document.querySelector('[role="dialog"]') !== null;

            if (!isAnyDialogOpen) return;

            if (e.key === "ArrowLeft" && canGoPrev) {
                e.preventDefault();
                goToPrev();
            } else if (e.key === "ArrowRight" && canGoNext) {
                e.preventDefault();
                goToNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [canGoPrev, canGoNext, goToNext, goToPrev]);

    if (!textGroup) {
        return null;
    }

    if (!currentEntry) {
        return null;
    }

    const isTextAudioPlaying =
        textAudioState.isPlaying &&
        textAudioState.currentTextId === currentEntry.id;
    const hasAudio = currentEntry.hasAudio === true;
    const hasDescription = showDescriptionPanel && textGroup.description;

    const handleAudioClick = () => {
        playSFX("click");

        if (isTextAudioPlaying) {
            stopTextAudio();
            return;
        }

        // If some other text is playing, stop it first so we can start this one
        if (
            textAudioState.isPlaying &&
            textAudioState.currentTextId &&
            textAudioState.currentTextId !== currentEntry.id
        ) {
            stopTextAudio();
        }

        pauseBGM();
        playTextAudio(currentEntry.id);
    };

    const handleModalClose = (open: boolean) => {
        if (!open) {
            // Modal is closing, stop any text audio that's currently playing
            if (textAudioState.isPlaying) {
                stopTextAudio();
            }
            playBGM();
            setShowInfo(false);
        } else {
            // Modal is opening
            playSFX("book");
            // Reset to first page when opening
            setCurrentEntryIndex(0);
        }
    };

    const toggleInfo = () => {
        playSFX("click");
        setShowInfo(!showInfo);
    };

    // Determine if label is a string to show icon
    const isStringLabel = typeof label === "string";

    return (
        <Dialog onOpenChange={handleModalClose}>
            <DialogTrigger className="inline-flex items-center gap-1 hover:text-accent transition-colors underline-offset-4 underline">
                {label} {isStringLabel && <BookOpenTextIcon />}
            </DialogTrigger>
            <DialogContent showXButton={false} backdropFilter={backdropFilter}>
                <DialogHeader>
                    <DialogTitle asChild>
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">
                                {currentEntry.title}
                            </span>
                            {hasDescription && (
                                <button
                                    onClick={toggleInfo}
                                    className="p-2 border rounded-full hover:bg-accent/50 transition-colors"
                                    title={showInfo ? "Hide info" : "Show info"}
                                >
                                    <Info className="size-4" />
                                </button>
                            )}
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <VisuallyHidden>
                    <DialogDescription>{currentEntry.title}</DialogDescription>
                </VisuallyHidden>
                <Separator className="my-2 bg-foreground/60" />

                <div className="relative">
                    <ViewMarkdown
                        key={currentEntry.id}
                        className="px-2 overflow-y-auto overflow-x-hidden h-[70vh] pb-10 z-10"
                        onNodeLinkClicked={() => {}}
                        onEdgeLinkClicked={() => {}}
                    >
                        {currentEntry.content}
                    </ViewMarkdown>

                    <Image
                        src="/images-opt/logo-blank-opt.webp"
                        alt="bg"
                        className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 w-3/4 opacity-15 grayscale"
                        width={128}
                        height={128}
                    />

                    {textGroup.entries.length > 1 && <></>}

                    {hasAudio && (
                        <button
                            onClick={handleAudioClick}
                            className={cn(
                                "absolute bottom-4 right-4 z-20 p-3 rounded-full bg-neutral-400/50 transition-all hover:bg-accent/50 group shadow-md hover:shadow-accent/50",

                                {
                                    "animate-pulse bg-accent/50 shadow-accent/50":
                                        isTextAudioPlaying,
                                },
                            )}
                            title={
                                isTextAudioPlaying
                                    ? tText("stopAudio")
                                    : tText("playAudio")
                            }
                        >
                            {isTextAudioPlaying ? (
                                <Square className="w-5 h-5 fill-white stroke-white" />
                            ) : (
                                <Play className="w-5 h-5  fill-foreground group-hover:stroke-white group-hover:fill-white transition-color" />
                            )}
                        </button>
                    )}

                    {/* Info Panel - Desktop */}
                    {hasDescription && (
                        <div
                            className={cn(
                                "hidden md:block absolute top-0 right-0 w-80 rounded-lg bg-background/90 dark:bg-background/40 backdrop-blur-2xl shadow-lg transition-all overflow-y-auto",
                                showInfo
                                    ? "translate-x-full opacity-100"
                                    : "opacity-0 translate-x-11/12 pointer-events-none",
                            )}
                        >
                            <div className="p-4">
                                <div className="mb-3 font-bold underline underline-offset-2 text-accent">
                                    {tText("description") || "Description"}
                                </div>
                                <ViewMarkdown
                                    className="text-sm"
                                    onNodeLinkClicked={() => {}}
                                    onEdgeLinkClicked={() => {}}
                                >
                                    {textGroup.description}
                                </ViewMarkdown>
                            </div>
                        </div>
                    )}

                    {/* Info Panel - Mobile (overlay modal) */}
                    {hasDescription && (
                        <div
                            className={cn(
                                "md:hidden absolute inset-0 transition-opacity",
                                {
                                    "opacity-0": !showInfo,
                                    "opacity-100 z-30": showInfo,
                                },
                            )}
                            onClick={toggleInfo}
                        >
                            <div className="rounded-lg overflow-y-auto p-4 bg-background/95 backdrop-blur-sm h-[30vh]">
                                <div className="flex justify-between items-center  mb-4">
                                    <span className="underline underline-offset-2 font-bold text-accent">
                                        {tText("description") || "Description"}
                                    </span>
                                </div>
                                <ViewMarkdown
                                    className="text-sm"
                                    onNodeLinkClicked={() => {}}
                                    onEdgeLinkClicked={() => {}}
                                >
                                    {textGroup.description}
                                </ViewMarkdown>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter className="pt-4 border-t-2 grid grid-cols-4 gap-2">
                    <span className="flex items-center justify-center text-muted-foreground rounded-lg border px-2 py-1 size-full">
                        {currentEntryIndex + 1} / {textGroup.entries.length}
                    </span>
                    <div className="flex justify-center size-full col-span-2 gap-1">
                        {/* Left and Right Navigation */}
                        <button
                            onClick={goToPrev}
                            disabled={!canGoPrev}
                            className={cn(
                                "rounded-full bg-neutral-400/50 transition-all hover:opacity-90 active:brightness-90",
                                "disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2",
                                {
                                    hidden: textGroup.entries.length <= 1,
                                },
                            )}
                            title="Previous entry"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            onClick={goToNext}
                            disabled={!canGoNext}
                            className={cn(
                                "rounded-full bg-neutral-400/50 transition-all hover:opacity-90 active:brightness-90 flex justify-end items-center",
                                "disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2",
                                {
                                    hidden: textGroup.entries.length <= 1,
                                },
                            )}
                            title="Next entry"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    </div>

                    <DialogClose asChild>
                        <Button>{tCommon("close")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TextModal;
