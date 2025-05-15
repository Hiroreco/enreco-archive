import { useState } from "react";

import {
    ArrowLeftRight,
    ChevronLeft,
    ChevronRight,
    Copy,
    Minus,
    Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import EditorConfirmDialog from "@/components/editor/EditorConfirmDialog";
import EditorDaySelect from "@/components/editor/EditorDaySelect";
import { EditorMoveDayDialog } from "@/components/editor/EditorMoveDayDialog";
import { IconButton } from "@/components/ui/IconButton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EditorChapter } from "@/lib/type";

interface EditorTransportControlsProps {
    className?: string;
    chapter: number | null;
    chapters: EditorChapter[];
    day: number | null;
    onChapterChange: (newChapter: number) => void;
    onDayChange: (newDay: number) => void;
    onChapterAdd: () => void;
    onChapterDelete: () => void;
    onDayAdd: () => void;
    onDayDelete: () => void;
    onDayClone: (dayToClone: number) => void;
    onDayMove: (dayToMove: number, newPos: number) => void;
}

export default function EditorTransportControls({
    className,
    chapter,
    chapters,
    day,
    onChapterChange,
    onDayChange,
    onChapterAdd,
    onChapterDelete,
    onDayAdd,
    onDayDelete,
    onDayClone,
    onDayMove,
}: EditorTransportControlsProps) {
    const [moveModalOpen, setMoveModalOpen] = useState(false);
    const [deleteChapterModalOpen, setDeleteChapterModalOpen] = useState(false);
    const [deleteDayModalOpen, setDeleteDayModalOpen] = useState(false);

    const numberOfChapters = chapters.length;
    const numberOfDays = chapter === null ? 0 : chapters[chapter].charts.length;

    const chapterTitle =
        chapter === null
            ? ""
            : chapters[chapter].title || `Chapter ${chapter + 1}`;

    return (
        <>
            <EditorMoveDayDialog
                isModalOpen={moveModalOpen}
                numDays={numberOfDays}
                onMoveCommit={onDayMove}
                onModalClose={() => setMoveModalOpen(false)}
            />
            <EditorConfirmDialog
                id="chapter-delete-confirm-dialog"
                isModalOpen={deleteChapterModalOpen}
                message={`Are you sure you want to delete ${chapterTitle}?`}
                onActionConfirm={() => onChapterDelete()}
                onModalClose={() => setDeleteChapterModalOpen(false)}
            />
            <EditorConfirmDialog
                id="day-delete-confirm-dialog"
                isModalOpen={deleteDayModalOpen}
                message={`Are you sure you want to delete Day ${(day || 0) + 1}?`}
                onActionConfirm={() => onDayDelete()}
                onModalClose={() => setDeleteDayModalOpen(false)}
            />
            <div className={cn(className, "flex flex-row")}>
                <div className="w-2/4 grid grid-rows-3 grid-cols-2 gap-x-2 gap-y-1 place-content-stretch mr-2">
                    <span className="text-md col-span-2 font-bold">
                        Chapters
                    </span>

                    <div className="col-span-2 flex flex-row content-center gap-x-2">
                        <IconButton
                            className="flex-none p-0"
                            tooltipText={"Previous Chapter"}
                            enabled={chapter !== 0 && chapter !== null}
                            onClick={() => onChapterChange((chapter || 0) - 1)}
                        >
                            <ChevronLeft />
                        </IconButton>

                        {/* Chapter Selector */}
                        <Select
                            value={chapter?.toString()}
                            onValueChange={(value: string) =>
                                onChapterChange(parseInt(value))
                            }
                        >
                            <SelectTrigger
                                disabled={numberOfChapters === 0}
                                className="h-8 flex-1"
                                useUpChevron={false}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent side={"bottom"}>
                                {chapters.map((elem, index) => (
                                    <SelectItem
                                        key={index}
                                        value={index.toString()}
                                    >
                                        {elem.title || `Chapter ${index + 1}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <IconButton
                            className="flex-none p-0"
                            tooltipText={"Next Chapter"}
                            enabled={
                                chapter !== numberOfChapters - 1 &&
                                chapter !== null
                            }
                            onClick={() => onChapterChange((chapter || 0) + 1)}
                        >
                            <ChevronRight />
                        </IconButton>
                    </div>

                    <IconButton
                        className="w-full p-0 aspect-auto"
                        tooltipText={"Add Chapter"}
                        enabled={true}
                        onClick={() => onChapterAdd()}
                    >
                        <Plus />
                    </IconButton>

                    <IconButton
                        className="w-full p-0 aspect-auto"
                        tooltipText={"Delete Chapter"}
                        enabled={numberOfChapters !== 0}
                        onClick={() => setDeleteChapterModalOpen(true)}
                    >
                        <Minus />
                    </IconButton>
                </div>
                <div className="w-2/4 grid grid-rows-3 grid-cols-4 gap-x-2 gap-y-1 place-content-stretch">
                    <span className="text-md col-span-4 font-bold">Days</span>

                    <div className="col-span-4 flex flex-row content-center gap-x-2">
                        <IconButton
                            className="flex-none p-0"
                            tooltipText={"Previous Day"}
                            enabled={day !== 0 && day !== null}
                            onClick={() => onDayChange((day || 0) - 1)}
                        >
                            <ChevronLeft />
                        </IconButton>

                        {/* Day Selector */}
                        <EditorDaySelect
                            day={day || 0}
                            numberOfDays={numberOfDays}
                            onValueChange={(value: number) => {
                                onDayChange(value);
                            }}
                            className="flex-1 h-8"
                        />

                        <IconButton
                            className="flex-none p-0"
                            tooltipText={"Next Day"}
                            enabled={day !== numberOfDays - 1 && day !== null}
                            onClick={() => onDayChange((day || 0) + 1)}
                        >
                            <ChevronRight />
                        </IconButton>
                    </div>

                    <IconButton
                        className="w-full p-0 aspect-auto"
                        tooltipText={"Add Day"}
                        enabled={numberOfChapters !== 0}
                        onClick={() => onDayAdd()}
                    >
                        <Plus />
                    </IconButton>

                    <IconButton
                        className="w-full p-0 aspect-auto"
                        tooltipText={"Delete Day"}
                        enabled={numberOfDays !== 0}
                        onClick={() => setDeleteDayModalOpen(true)}
                    >
                        <Minus />
                    </IconButton>

                    <IconButton
                        className="w-full p-0 aspect-auto"
                        tooltipText={"Clone Day"}
                        enabled={numberOfDays !== 0}
                        onClick={() => {
                            if (day !== null) {
                                onDayClone(day);
                            }
                        }}
                    >
                        <Copy />
                    </IconButton>

                    <IconButton
                        className="w-full p-0 aspect-auto"
                        tooltipText={"Move Day"}
                        enabled={numberOfDays !== 0}
                        onClick={() => setMoveModalOpen(true)}
                    >
                        <ArrowLeftRight />
                    </IconButton>
                </div>
            </div>
        </>
    );
}
