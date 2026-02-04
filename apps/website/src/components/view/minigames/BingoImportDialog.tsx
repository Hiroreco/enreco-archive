import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface BingoImportDialogProps {
    onImport: (board: string[]) => void;
}

// Decompress base64 string to board data
const decompressBoardData = (compressed: string): string[] | null => {
    try {
        const json = decodeURIComponent(escape(atob(compressed)));
        const board = JSON.parse(json);

        // Validate board structure
        if (Array.isArray(board) && board.length === 25) {
            return board.map((item) => String(item));
        }
        return null;
    } catch (error) {
        console.error("Failed to decompress board:", error);
        return null;
    }
};

const BingoImportDialog = ({ onImport }: BingoImportDialogProps) => {
    const t = useTranslations("modals.minigames.games.bingo");
    const [open, setOpen] = useState(false);
    const [importCode, setImportCode] = useState("");
    const [error, setError] = useState("");

    const handleImport = () => {
        setError("");

        if (!importCode.trim()) {
            setError(t("importErrorEmpty"));
            return;
        }

        const board = decompressBoardData(importCode.trim());

        if (!board) {
            setError(t("importErrorInvalid"));
            return;
        }

        onImport(board);
        setOpen(false);
        setImportCode("");
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setImportCode("");
            setError("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Download className="size-4 mr-2" />
                    {t("import")}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("importTitle")}</DialogTitle>
                    <DialogDescription>
                        {t("importDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            {t("importCode")}
                        </label>
                        <textarea
                            value={importCode}
                            onChange={(e) => setImportCode(e.target.value)}
                            placeholder={t("importPlaceholder")}
                            className="w-full px-3 py-2 text-sm border rounded-md bg-background/50 font-mono min-h-[100px] resize-y"
                        />
                        {error && (
                            <p className="text-sm text-destructive mt-2">
                                {error}
                            </p>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        {t("importNote")}
                    </p>

                    <Button onClick={handleImport}>{t("importButton")}</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BingoImportDialog;
