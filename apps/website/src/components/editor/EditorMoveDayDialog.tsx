import { useState } from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import EditorDaySelect from "@/components/editor/EditorDaySelect";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
} from "@/components/ui/dialog";

interface EditorMoveDayDialogProps {
    isModalOpen: boolean;
    numDays: number;
    onMoveCommit: (dayToMove: number, newPos: number) => void;
    onModalClose: () => void;
}

export function EditorMoveDayDialog({
    isModalOpen,
    numDays,
    onMoveCommit,
    onModalClose,
}: EditorMoveDayDialogProps) {
    const [dayToMove, setDayToMove] = useState(0);
    const [newPos, setNewPos] = useState(0);

    return (
        <Dialog
            open={isModalOpen}
            onOpenChange={(open: boolean) => {
                if (!open) {
                    onModalClose();
                }
            }}
        >
            <DialogPortal>
                <DialogOverlay />
                <DialogContent>
                    <VisuallyHidden>
                        <DialogTitle>Move Day Dialog</DialogTitle>
                    </VisuallyHidden>
                    <span>Move day</span>
                    <EditorDaySelect
                        day={dayToMove}
                        numberOfDays={numDays}
                        onValueChange={(value: number) => setDayToMove(value)}
                    />
                    <span>to day</span>
                    <EditorDaySelect
                        day={newPos}
                        numberOfDays={numDays}
                        onValueChange={(value: number) => setNewPos(value)}
                    />
                    <div className="flex flex-row gap-2 mt-2">
                        <Button
                            onClick={() => {
                                onMoveCommit(dayToMove, newPos);
                                onModalClose();
                            }}
                        >
                            Move Days
                        </Button>
                        <Button onClick={() => onModalClose()}>Cancel</Button>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
