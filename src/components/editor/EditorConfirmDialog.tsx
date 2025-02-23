import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
} from "@/components/ui/dialog";

interface EditorConfirmDialogProps {
    id?: string;
    isModalOpen: boolean;
    message: string;
    onActionConfirm: () => void;
    onModalClose: () => void;
}

export default function EditorConfirmDialog({
    isModalOpen,
    message,
    onActionConfirm,
    onModalClose,
}: EditorConfirmDialogProps) {
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
                        <DialogTitle>Confirmation</DialogTitle>
                    </VisuallyHidden>
                    <span className="text-md">{message}</span>
                    <div className="flex flex-row gap-2 mt-2">
                        <Button
                            className="bg-destructive text-destructive-foreground"
                            onClick={() => {
                                onActionConfirm();
                                onModalClose();
                            }}
                        >
                            Confirm
                        </Button>
                        <Button onClick={() => onModalClose()}>Cancel</Button>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
