import BingoEditor from "@/components/view/minigames/BingoEditor";
import BingoExport from "@/components/view/minigames/BingoExport";
import { LS_KEYS } from "@/lib/constants";
import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { CheckSquare, Download, Edit, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

/* =======================
   Constants & Utils
======================= */

const createInitialBoard = () => {
    const board = Array(25).fill("");
    board[12] = "Free!"; // Center square
    return board;
};

export const getFontSizeClass = (text: string) => {
    const length = text.length;
    const lines = text.split("\n").length;

    if (length <= 12 && lines === 1) return "text-lg";
    if (length <= 20) return "text-base";
    if (length <= 30) return "text-sm";
    if (length <= 45) return "text-xs";
    return "text-[10px]";
};

const BingoGame = () => {
    const t = useTranslations("modals.minigames.games.bingo");
    const [board, setBoard] = useState<string[]>(createInitialBoard());
    const [marked, setMarked] = useState<boolean[]>(Array(25).fill(false));
    const [isEditMode, setIsEditMode] = useState(true);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedBoard = localStorage.getItem(LS_KEYS.BINGO_BOARD);
        const savedMarked = localStorage.getItem(LS_KEYS.BINGO_MARKED);

        if (savedBoard) {
            try {
                setBoard(JSON.parse(savedBoard));
            } catch (e) {
                console.error("Failed to parse saved board:", e);
            }
        }

        if (savedMarked) {
            try {
                setMarked(JSON.parse(savedMarked));
            } catch (e) {
                console.error("Failed to parse saved marked:", e);
            }
        }
    }, []);

    // Save to localStorage when board or marked changes
    useEffect(() => {
        localStorage.setItem(LS_KEYS.BINGO_BOARD, JSON.stringify(board));
    }, [board]);

    useEffect(() => {
        localStorage.setItem(LS_KEYS.BINGO_MARKED, JSON.stringify(marked));
    }, [marked]);

    const handleSquareClick = (index: number) => {
        if (isEditMode) {
            setEditingIndex(index);
        } else {
            setMarked((prev) => {
                const next = [...prev];
                next[index] = !next[index];
                return next;
            });
        }
    };

    const handleReset = () => {
        setBoard(createInitialBoard());
        setMarked(Array(25).fill(false));
    };

    const downloadBingo = async () => {
        if (!exportRef.current) return;
        const html2canvas = (await import("html2canvas-pro")).default;
        const canvas = await html2canvas(exportRef.current, { scale: 2 });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "enreco-bingo.png";
        link.click();
    };

    return (
        <div className="flex gap-6 justify-center items-start py-4">
            <BingoEditor
                board={board}
                marked={marked}
                isEditMode={isEditMode}
                editingIndex={editingIndex}
                onSquareClick={handleSquareClick}
                onTextChange={(i, v) =>
                    setBoard((b) => {
                        const n = [...b];
                        n[i] = v;
                        return n;
                    })
                }
                onEditingChange={setEditingIndex}
            />

            <div className="flex flex-col gap-2">
                <Button
                    size="sm"
                    variant={isEditMode ? "default" : "outline"}
                    onClick={() => setIsEditMode(true)}
                >
                    <Edit className="w-4 h-4 mr-2" />
                    {t("editMode")}
                </Button>
                <Button
                    size="sm"
                    variant={!isEditMode ? "default" : "outline"}
                    onClick={() => setIsEditMode(false)}
                >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    {t("markMode")}
                </Button>

                <div className="h-px bg-border my-1" />

                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            {t("preview")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[650px] p-6">
                        <VisuallyHidden>
                            <DialogHeader>
                                <DialogTitle>{t("previewTitle")}</DialogTitle>
                                <DialogDescription>
                                    {t("previewDescription")}
                                </DialogDescription>
                            </DialogHeader>
                        </VisuallyHidden>
                        <div className="flex justify-center">
                            <div style={{ transform: "scale(0.9)" }}>
                                <BingoExport board={board} marked={marked} />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Button size="sm" onClick={downloadBingo}>
                    <Download className="w-4 h-4 mr-2" />
                    {t("download")}
                </Button>

                <Button size="sm" variant="destructive" onClick={handleReset}>
                    {t("reset")}
                </Button>
            </div>

            {/* Hidden export */}
            <div className="absolute -left-[9999px] pointer-events-none">
                <div ref={exportRef}>
                    <BingoExport board={board} marked={marked} />
                </div>
            </div>
        </div>
    );
};

export default BingoGame;
