import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import { InfoIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const StatsInfoModal = () => {
    const tCommon = useTranslations("common");
    const t = useTranslations("modals.stats");
    return (
        <Dialog>
            <DialogTrigger asChild>
                <InfoIcon className="size-5 cursor-pointer" />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("title")}</DialogTitle>
                </DialogHeader>
                <div>{t("info.text1")}</div>
                <div className="mt-4">{t("info.text2")}</div>
                <DialogFooter className="border-t pt-2 mt-2">
                    <DialogClose asChild>
                        <Button>{tCommon("close")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default StatsInfoModal;
