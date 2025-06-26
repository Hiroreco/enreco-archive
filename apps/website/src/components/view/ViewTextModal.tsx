import textData from "#/text-data.json";
import { ViewMarkdown } from "@/components/view/ViewMarkdown";
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
import { TextData } from "@enreco-archive/common/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { BookOpenTextIcon } from "lucide-react";
import Image from "next/image";

interface ViewTextModalProps {
    textId: string;
    label: string;
}

const ViewTextModal = ({ textId, label }: ViewTextModalProps) => {
    const textItem = (textData as TextData)[textId];
    const { playSFX } = useAudioStore();
    const backdropFilter = useSettingStore((state) => state.backdropFilter);

    if (!textItem) {
        return null;
    }

    return (
        <Dialog
            onOpenChange={(open) => {
                if (open) {
                    playSFX("book");
                }
            }}
        >
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
                        src="/images-opt/logo-blank.webp"
                        alt="bg"
                        className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 w-3/4 opacity-15 grayscale"
                        width={128}
                        height={128}
                    />
                </div>
                <DialogFooter className="pt-4 border-t-2 ">
                    <DialogClose asChild>
                        <Button className="bg-accent text-lg text-accent-foreground w-full -mb-2">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewTextModal;
