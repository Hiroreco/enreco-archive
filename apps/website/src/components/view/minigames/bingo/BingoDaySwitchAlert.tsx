import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { useTranslations } from "next-intl";
import React from "react";

interface BingoDaySwitchAlertProps {
    isOpen: boolean;
    onYes: () => void;
    onNo: () => void;
}

const BingoDaySwitchAlert = ({
    isOpen,
    onYes,
    onNo,
}: BingoDaySwitchAlertProps) => {
    const t = useTranslations("modals.minigames.games.bingo");
    return (
        <Dialog open={isOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("copyValuesTitle")}</DialogTitle>
                    <DialogDescription>{t("copyValuesDesc")}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={onYes}>{t("copyValuesYes")}</Button>
                    <Button onClick={onNo}>{t("copyValuesNo")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BingoDaySwitchAlert;
