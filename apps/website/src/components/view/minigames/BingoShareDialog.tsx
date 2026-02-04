import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import { Check, Copy, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface BingoShareDialogProps {
    board: string[];
    currentDay: string;
}

// Compress board data to base64 string
const compressBoardData = (board: string[]): string => {
    try {
        const json = JSON.stringify(board);
        // Use built-in btoa for base64 encoding
        const base64 = btoa(unescape(encodeURIComponent(json)));
        return base64;
    } catch (error) {
        console.error("Failed to compress board:", error);
        return "";
    }
};

const BingoShareDialog = ({ board, currentDay }: BingoShareDialogProps) => {
    const t = useTranslations("modals.minigames.games.bingo");
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareCode = compressBoardData(board);
    const shareUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}${window.location.pathname}?bingo=${shareCode}&day=${currentDay}`
            : "";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy URL:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Share2 className="size-4 mr-2" />
                    {t("share")}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("shareTitle")}</DialogTitle>
                    <DialogDescription>
                        {t("shareDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            {t("shareCode")}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={shareCode}
                                className="flex-1 px-3 py-2 text-sm border rounded-md bg-background/50 font-mono"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <Check className="size-4" />
                                ) : (
                                    <Copy className="size-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            {t("shareUrl")}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="flex-1 px-3 py-2 border rounded-md bg-background/50 text-xs"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCopyUrl}
                            >
                                {copied ? (
                                    <Check className="size-4" />
                                ) : (
                                    <Copy className="size-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        {t("shareNote")}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BingoShareDialog;
