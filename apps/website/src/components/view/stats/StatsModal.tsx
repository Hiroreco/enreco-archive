import {
    Dialog,
    DialogContent,
} from "@enreco-archive/common-ui/components/dialog";
import { TrackerShell } from "@/components/view/stats/TrackerShell";

interface StatsModalProps {
    open: boolean;
    onClose: () => void;
}

export function StatsModal({ open, onClose }: StatsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                showXButton
                showXButtonForce
                className="max-w-4xl max-h-[90vh] overflow-y-auto"
            >
                <TrackerShell />
            </DialogContent>
        </Dialog>
    );
}
