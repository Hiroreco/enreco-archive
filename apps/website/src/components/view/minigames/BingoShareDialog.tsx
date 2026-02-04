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
import { useEffect, useState } from "react";

interface BingoShareDialogProps {
    board: string[];
    currentDay: string;
}

// gzip + base64 (URL-safe optional)
export const compressBoardData = async (board: string[]): Promise<string> => {
    const json = JSON.stringify(board);
    console.log(json);
    const encoder = new TextEncoder();
    const data = encoder.encode(json);
    console.log(data);

    const cs = new CompressionStream("gzip");
    const writer = cs.writable.getWriter();
    writer.write(data);
    writer.close();

    const compressed = await new Response(cs.readable).arrayBuffer();
    const bytes = new Uint8Array(compressed);

    // base64 encode
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, ""); // URL-safe + shorter
};

export const decompressBoardData = async (
    compressedBase64: string,
): Promise<string[] | null> => {
    try {
        // restore base64 padding + chars
        let base64 = compressedBase64.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) base64 += "=";

        const binary = atob(base64);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));

        const ds = new DecompressionStream("gzip");
        const writer = ds.writable.getWriter();
        writer.write(bytes);
        writer.close();

        const decompressed = await new Response(ds.readable).arrayBuffer();
        const json = new TextDecoder().decode(decompressed);
        const board = JSON.parse(json);

        if (Array.isArray(board) && board.length === 25) {
            return board.map(String);
        }
        return null;
    } catch (e) {
        console.error("Failed to decompress board:", e);
        return null;
    }
};

const BingoShareDialog = ({ board, currentDay }: BingoShareDialogProps) => {
    const t = useTranslations("modals.minigames.games.bingo");
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const [shareCode, setShareCode] = useState("");

    useEffect(() => {
        compressBoardData(board).then(setShareCode);
    }, [board]);

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
