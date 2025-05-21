import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ViewMarkdown } from "@/components/view/ViewMarkdown";
import { ChapterRecapData } from "@/lib/type";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";

interface ViewMiniGameModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentChapter: number;
}

const ViewChapterRecapModal = ({
    open,
    onOpenChange,
    currentChapter,
}: ViewMiniGameModalProps) => {
    const data: ChapterRecapData = {
        chapters: [
            {
                title: "Chapter 1",
                content: "Chapter 1 recap content goes here.",
            },
            {
                title: "Chapter 2",
                content: "Chapter 2 recap content goes here.",
            },
            // Add more chapters as needed
        ],
    };
    const validCurrentChapter = currentChapter < data.chapters.length;
    const initialChapter = validCurrentChapter
        ? currentChapter
        : data.chapters.length - 1;
    const [chapter, setChapter] = useState(initialChapter);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:max-w-[800px] md:max-h-[80vh] max-w-none w-[95vw] h-[80vh] transition-all">
                <DialogHeader>
                    <DialogTitle>Chapters Recap</DialogTitle>
                </DialogHeader>

                <VisuallyHidden>
                    <DialogDescription>
                        General recap of the chapters
                    </DialogDescription>
                </VisuallyHidden>

                <div className="h-full w-full flex flex-col">
                    <Select
                        value={chapter.toString()}
                        onValueChange={(value) => setChapter(parseInt(value))}
                    >
                        <SelectTrigger className="mx-auto">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {data.chapters.map((chapter, chapterNum) => {
                                return (
                                    <SelectItem
                                        key={chapterNum}
                                        value={chapterNum.toString()}
                                    >
                                        {chapter.title}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>

                    {/* Game container */}
                    <ViewMarkdown
                        onNodeLinkClicked={() => {}}
                        onEdgeLinkClicked={() => {}}
                    >
                        {data.chapters[chapter].content}
                    </ViewMarkdown>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewChapterRecapModal;
