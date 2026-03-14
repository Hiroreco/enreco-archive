import BingoExport from "@/components/view/minigames/bingo/BingoExport";
import useIsMobileViewport from "@/hooks/useIsMobileViewport";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Checkbox } from "@enreco-archive/common-ui/components/checkbox";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Download, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import BingoMarkerSelector from "@/components/view/minigames/bingo/BingoMarkerSelector";
import BingoWinSelector from "@/components/view/minigames/bingo/BingoWinSelector";
import { useSettingStore } from "@/store/settingStore";

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
    const {
        bingoMarkerStyle,
        setBingoMarkerStyle,
        bingoWinStyle,
        setBingoWinStyle,
    } = useSettingStore();

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
                    className="bg-transparent border-0 p-0 max-w-none w-screen h-screen flex items-center justify-center gap-2"
                    style={{ backgroundImage: "none" }}
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <VisuallyHidden>
                        <DialogHeader>
                            <DialogTitle>{t("previewTitle")}</DialogTitle>
                            <DialogDescription>
                                {t("previewDescription")}
                            </DialogDescription>
                        </DialogHeader>
                    </VisuallyHidden>

                    {/* Invisible full-screen closer behind the panels */}
                    <DialogClose asChild>
                        <div className="fixed inset-0 -z-10 cursor-default" />
                    </DialogClose>

                    <div
                        className="bg-blur p-2 rounded-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <BingoExport
                            board={board}
                            marked={marked}
                            currentDay={currentDay}
                            showDay={showDay}
                            winningIndices={winningIndices}
                        />
                    </div>

                    <div
                        className="flex flex-col gap-4 max-w-70 bg-blur p-4 rounded-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <BingoMarkerSelector
                            value={bingoMarkerStyle}
                            onValueChange={setBingoMarkerStyle}
                        />
                        <BingoWinSelector
                            value={bingoWinStyle}
                            onValueChange={setBingoWinStyle}
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
                    <div className="flex gap-2">
                        <BingoMarkerSelector
                            value={bingoMarkerStyle}
                            onValueChange={setBingoMarkerStyle}
                        />
                        <BingoWinSelector
                            value={bingoWinStyle}
                            onValueChange={setBingoWinStyle}
                        />
                    </div>

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
