import {
    AlertDialogAction,
    AlertDialogCancel,
} from "@enreco-archive/common-ui/components/alertdialog";
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
import { useTranslations } from "next-intl";

interface BingoResetDialogProps {
    onReset: () => void;
    disabled?: boolean;
}

const BingoResetDialog = ({ onReset, disabled }: BingoResetDialogProps) => {
    const t = useTranslations("modals.minigames.games.bingo");

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={disabled}>
                    {t("reset")}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("resetTitle")}</DialogTitle>
                    <DialogDescription>{t("resetMessage")}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">{t("cancel")}</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button variant={"destructive"} onClick={onReset}>
                            {t("resetConfirm")}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BingoResetDialog;
