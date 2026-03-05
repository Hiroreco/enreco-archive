import BingoGame from "@/components/view/minigames/bingo/BingoGame";
import BingoGameInfo from "@/components/view/minigames/bingo/BingoGameInfo";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import {
    Dialog as InfoDialog,
    DialogContent as InfoDialogContent,
    DialogHeader as InfoDialogHeader,
    DialogTitle as InfoDialogTitle,
    DialogDescription as InfoDialogDescription,
    DialogTrigger as InfoDialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";

interface BingoModalProps {
    open: boolean;
    onClose: () => void;
}

const BingoModal = ({ open, onClose }: BingoModalProps) => {
    const t = useTranslations("modals.minigames.games.bingo");
    const tMinigames = useTranslations("modals.minigames");

    const onOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                onClose();
            }
        },
        [onClose],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="md:max-w-[800px] flex flex-col max-w-none w-[95vw] h-[80vh] md:max-h-[45rem] transition-all pb-0"
                showXButton={true}
                showXButtonForce={true}
            >
                <DialogHeader>
                    <DialogTitle className="text-center">
                        {t("label")}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {t("desc")}
                    </DialogDescription>
                </DialogHeader>

                <VisuallyHidden>
                    <DialogDescription>
                        {tMinigames("description")}
                    </DialogDescription>
                </VisuallyHidden>

                <div className="flex-1 flex items-center justify-center w-full overflow-y-auto">
                    <BingoGame />
                </div>

                <InfoDialog>
                    <InfoDialogTrigger>
                        <Info className="absolute sm:bottom-4 sm:right-4 bottom-2 right-2 z-40" />
                    </InfoDialogTrigger>
                    <InfoDialogContent className="flex flex-col max-h-[85vh]">
                        <VisuallyHidden>
                            <InfoDialogDescription>
                                View information about the bingo game
                            </InfoDialogDescription>
                        </VisuallyHidden>
                        <InfoDialogHeader>
                            <InfoDialogTitle>{t("label")}</InfoDialogTitle>
                        </InfoDialogHeader>
                        <div className="overflow-auto grow pb-6 px-2">
                            <BingoGameInfo />
                        </div>
                    </InfoDialogContent>
                </InfoDialog>
            </DialogContent>
        </Dialog>
    );
};

export default BingoModal;
