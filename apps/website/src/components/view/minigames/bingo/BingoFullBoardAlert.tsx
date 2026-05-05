import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogHeader,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@enreco-archive/common-ui/components/dialog";
import { useTranslations } from "next-intl";

interface BingoFullBoardAlertProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const BingoFullBoardAlert = ({
    open,
    onOpenChange,
}: BingoFullBoardAlertProps) => {
    const t = useTranslations("modals.minigames.games.bingo");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("fullBoardTitle")}</DialogTitle>
                    <DialogDescription>
                        {t("fullBoardMessage")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <DialogClose onClick={() => onOpenChange(false)} asChild>
                        <Button>{t("understood")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BingoFullBoardAlert;
