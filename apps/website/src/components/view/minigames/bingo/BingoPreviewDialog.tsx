import BingoExport from "@/components/view/minigames/bingo/BingoExport";
import useIsMobileViewport from "@/hooks/useIsMobileViewport";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Checkbox } from "@enreco-archive/common-ui/components/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Download, Eye } from "lucide-react";
import { useTranslations } from "next-intl";

interface BingoPreviewDialogProps {
    board: string[];
    marked: boolean[];
    currentDay: string;
    showDay: boolean;
    winningIndices?: Set<number>;
    onShowDayChange: (checked: boolean) => void;
    onDownload: () => void;
    disabled?: boolean;
}

const BingoPreviewDialog = ({
    board,
    marked,
    currentDay,
    showDay,
    winningIndices,
    onShowDayChange,
    onDownload,
    disabled,
}: BingoPreviewDialogProps) => {
    const t = useTranslations("modals.minigames.games.bingo");
    const isMobile = useIsMobileViewport();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={disabled}>
                    <Eye className="size-4 mr-2" />
                    {t("preview")}
                </Button>
            </DialogTrigger>
            {!isMobile && (
                <DialogContent
                    className="flex-row md:max-w-none md:w-max bg-transparent border-0 items-center justify-center px-1 max-h-[90dvh] gap-2 hidden md:flex"
                    style={{ backgroundImage: "none" }}
                >
                    <VisuallyHidden>
                        <DialogHeader>
                            <DialogTitle>{t("previewTitle")}</DialogTitle>
                            <DialogDescription>
                                {t("previewDescription")}
                            </DialogDescription>
                        </DialogHeader>
                    </VisuallyHidden>
                    <div className="bg-blur p-2 rounded-md">
                        <BingoExport
                            board={board}
                            marked={marked}
                            currentDay={currentDay}
                            showDay={showDay}
                            winningIndices={winningIndices}
                        />
                    </div>

                    <div className="flex flex-col gap-4 max-w-70 bg-blur p-4 rounded-md">
                        <p className="text-xs text-muted-foreground text-center">
                            {t("previewNote")}
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <label
                                htmlFor="showday"
                                className="flex items-center gap-1 border rounded px-2 py-1.5"
                            >
                                <Checkbox
                                    id="showday"
                                    checked={showDay}
                                    onCheckedChange={
                                        onShowDayChange as (
                                            checked: boolean,
                                        ) => void
                                    }
                                    className="size-4 cursor-pointer"
                                />
                                <span className="text-sm">{t("showDay")}</span>
                            </label>
                            <Button size="sm" onClick={onDownload}>
                                <Download className="size-4 mr-2" />
                                {t("download")}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            )}
            {isMobile && (
                <DialogContent className="flex flex-col items-center justify-center px-1 md:hidden">
                    <VisuallyHidden>
                        <DialogHeader>
                            <DialogTitle>{t("previewTitle")}</DialogTitle>
                            <DialogDescription>
                                {t("previewDescription")}
                            </DialogDescription>
                        </DialogHeader>
                    </VisuallyHidden>
                    <BingoExport
                        board={board}
                        marked={marked}
                        currentDay={currentDay}
                        showDay={showDay}
                        winningIndices={winningIndices}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                        {t("previewNote")}
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <label
                            htmlFor="showday"
                            className="flex items-center gap-1 border rounded px-2 py-1.5"
                        >
                            <Checkbox
                                id="showday"
                                checked={showDay}
                                onCheckedChange={
                                    onShowDayChange as (
                                        checked: boolean,
                                    ) => void
                                }
                                className="size-4 cursor-pointer"
                            />
                            <span className="text-sm">{t("showDay")}</span>
                        </label>
                        <Button size="sm" onClick={onDownload}>
                            <Download className="size-4 mr-2" />
                            {t("download")}
                        </Button>
                    </div>
                </DialogContent>
            )}
        </Dialog>
    );
};

export default BingoPreviewDialog;
