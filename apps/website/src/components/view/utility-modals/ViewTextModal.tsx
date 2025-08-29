import { ViewMarkdown } from "@/components/view/markdown/ViewMarkdown";
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
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { BookOpenTextIcon, Play, Square } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface ViewTextModalProps {
    textId: string;
    label: string;
}

const ViewTextModal = ({ textId, label }: ViewTextModalProps) => {
    const tCommon = useTranslations("common");
    const tText = useTranslations("modals.text");
    const { getTextItem } = useLocalizedData();
    const textItem = getTextItem(textId);
    const {
        playSFX,
        playTextAudio,
        stopTextAudio,
        textAudioState,
        pauseBGM,
        playBGM,
    } = useAudioStore();
    const backdropFilter = useSettingStore((state) => state.backdropFilter);

    if (!textItem) {
        return null;
    }

    const isTextAudioPlaying =
        textAudioState.isPlaying && textAudioState.currentTextId === textId;
    const hasAudio = textItem.hasAudio === true;

    const handleAudioClick = () => {
        playSFX("click");

        if (isTextAudioPlaying) {
            stopTextAudio();
        } else {
            pauseBGM();
            playTextAudio(textId);
        }
    };

    const handleModalClose = (open: boolean) => {
        if (!open) {
            // Modal is closing, stop audio if it's playing
            if (isTextAudioPlaying) {
                stopTextAudio();
            }
            playBGM();
        } else {
            // Modal is opening
            playSFX("book");
        }
    };

    return (
        <Dialog onOpenChange={handleModalClose}>
            <DialogTrigger className="inline-flex items-center gap-1 hover:text-accent transition-colors underline-offset-4 underline">
                {label} <BookOpenTextIcon />
            </DialogTrigger>
            <DialogContent showXButton={false} backdropFilter={backdropFilter}>
                <DialogHeader>
                    <DialogTitle>{textItem.title}</DialogTitle>
                </DialogHeader>
                <VisuallyHidden>
                    <DialogDescription>
                        {textItem.category} - {textItem.title}
                    </DialogDescription>
                </VisuallyHidden>
                <div className="relative">
                    <ViewMarkdown
                        className="px-2 overflow-y-auto overflow-x-hidden h-[70vh] pb-10 z-10"
                        onNodeLinkClicked={() => {}}
                        onEdgeLinkClicked={() => {}}
                    >
                        {textItem.content}
                    </ViewMarkdown>

                    <Image
                        src="/images-opt/logo-blank-opt.webp"
                        alt="bg"
                        className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 w-3/4 opacity-15 grayscale"
                        width={128}
                        height={128}
                    />

                    {/* Audio Button - positioned in bottom right */}
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
                </div>
                <DialogFooter className="pt-4 border-t-2">
                    <DialogClose asChild>
                        <Button className="bg-accent text-lg text-accent-foreground w-full -mb-2">
                            {tCommon("close")}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewTextModal;
