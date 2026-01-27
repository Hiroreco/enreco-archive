import BingoEditor from "@/components/view/minigames/BingoEditor";
import BingoExport from "@/components/view/minigames/BingoExport";
import { LS_KEYS } from "@/lib/constants";
import { isMobileViewport } from "@/lib/utils";
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

const createInitialBoard = () => {
    const board = Array(25).fill("");
    board[12] = "Free!"; // Center square
    return board;
};

// Initialize from localStorage or create new
const getInitialBoard = (): string[] => {
    if (typeof window === "undefined") return createInitialBoard();

    const savedBoard = localStorage.getItem(LS_KEYS.BINGO_BOARD);
    if (savedBoard) {
        try {
            return JSON.parse(savedBoard);
        } catch (e) {
            console.error("Failed to parse saved board:", e);
        }
    }
    return createInitialBoard();
};

const getInitialMarked = (): boolean[] => {
    if (typeof window === "undefined") return Array(25).fill(false);

    const savedMarked = localStorage.getItem(LS_KEYS.BINGO_MARKED);
    if (savedMarked) {
        try {
            return JSON.parse(savedMarked);
        } catch (e) {
            console.error("Failed to parse saved marked:", e);
        }
    }
    return Array(25).fill(false);
};

/**
 * Calculate dynamic font size based on text characteristics
 * Returns CSS custom properties for fluid typography
 */
export const getTextStyle = (
    text: string,
    squareSize: "editor" | "export" = "editor",
): React.CSSProperties => {
    const isMobile = isMobileViewport();

    if (!text.trim()) {
        return squareSize === "export"
            ? { fontSize: "clamp(0.875rem, 2.5cqw, 1rem)" }
            : isMobile
              ? { fontSize: "clamp(0.625rem, 3cqw, 0.875rem)" }
              : { fontSize: "clamp(0.75rem, 3cqw, 0.875rem)" };
    }

    const words = text.split(/[\s\n]+/).filter((word) => word.length > 0);
    const longestWord = Math.max(...words.map((word) => word.length), 0);
    const totalLength = text.length;
    const lineCount = text.split("\n").length;

    // Calculate complexity score
    const hasVeryLongWord = longestWord > 12;
    const hasLongWord = longestWord > 10;
    const hasManyLines = lineCount > 3;
    const isLongText = totalLength > 40;

    if (squareSize === "export") {
        // Export (96px squares) - more generous sizing
        if (hasVeryLongWord || (hasManyLines && isLongText)) {
            return { fontSize: "clamp(0.625rem, 1.8cqw, 0.75rem)" };
        }
        if (hasLongWord || hasManyLines) {
            return { fontSize: "clamp(0.75rem, 2cqw, 0.875rem)" };
        }
        if (isLongText || lineCount > 2) {
            return { fontSize: "clamp(0.875rem, 2.2cqw, 1rem)" };
        }
        if (totalLength <= 15 && lineCount === 1) {
            return { fontSize: "clamp(1rem, 3cqw, 1.25rem)" };
        }
        return { fontSize: "clamp(0.875rem, 2.5cqw, 1rem)" };
    } else {
        // Editor - different sizing for mobile vs desktop
        if (isMobile) {
            // Mobile: tighter sizing
            if (hasVeryLongWord || (hasManyLines && isLongText)) {
                return { fontSize: "clamp(0.5rem, 2cqw, 0.625rem)" };
            }
            if (hasLongWord || hasManyLines) {
                return { fontSize: "clamp(0.5rem, 2.5cqw, 0.75rem)" };
            }
            if (isLongText || lineCount > 2) {
                return { fontSize: "clamp(0.625rem, 2.75cqw, 0.75rem)" };
            }
            if (totalLength <= 12 && lineCount === 1) {
                return { fontSize: "clamp(0.75rem, 3.5cqw, 0.875rem)" };
            }
            return { fontSize: "clamp(0.625rem, 3cqw, 0.75rem)" };
        } else {
            // Desktop: original sizing
            if (hasVeryLongWord || (hasManyLines && isLongText)) {
                return { fontSize: "clamp(0.5rem, 2cqw, 0.625rem)" };
            }
            if (hasLongWord || hasManyLines) {
                return { fontSize: "clamp(0.625rem, 2.5cqw, 0.75rem)" };
            }
            if (isLongText || lineCount > 2) {
                return { fontSize: "clamp(0.75rem, 3cqw, 0.875rem)" };
            }
            if (totalLength <= 12 && lineCount === 1) {
                return { fontSize: "clamp(0.875rem, 3.5cqw, 1rem)" };
            }
            return { fontSize: "clamp(0.75rem, 3cqw, 0.875rem)" };
        }
    }
};

const BingoGame = () => {
    const t = useTranslations("modals.minigames.games.bingo");
    const [board, setBoard] = useState<string[]>(getInitialBoard);
    const [marked, setMarked] = useState<boolean[]>(getInitialMarked);
    const [isEditMode, setIsEditMode] = useState(true);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    // Save to localStorage when board changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(LS_KEYS.BINGO_BOARD, JSON.stringify(board));
        }
    }, [board]);

    // Save to localStorage when marked changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(LS_KEYS.BINGO_MARKED, JSON.stringify(marked));
        }
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
        <div className="flex md:flex-row flex-col gap-6 justify-center items-center py-4">
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
                <span className="text-sm font-medium text-center">
                    {t("mode")}
                </span>
                <div className="flex items-center justify-center gap-2 md:justify-between">
                    <Button
                        size="sm"
                        variant={isEditMode ? "default" : "outline"}
                        onClick={() => setIsEditMode(true)}
                        title={t("editMode")}
                    >
                        <Edit />
                    </Button>
                    <Button
                        size="sm"
                        variant={!isEditMode ? "default" : "outline"}
                        onClick={() => setIsEditMode(false)}
                        title={t("markMode")}
                    >
                        <CheckSquare />
                    </Button>
                </div>

                <div className="h-px bg-border my-1" />

                <div className="flex md:flex-col flex-row gap-2">
                    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Eye className="size-4 mr-2" />
                                {t("preview")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="flex md:max-w-[500px] flex-col items-center justify-center">
                            <VisuallyHidden>
                                <DialogHeader>
                                    <DialogTitle>
                                        {t("previewTitle")}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t("previewDescription")}
                                    </DialogDescription>
                                </DialogHeader>
                            </VisuallyHidden>
                            <BingoExport board={board} marked={marked} />
                            <p className="text-xs text-muted-foreground text-center">
                                {t("previewNote")}
                            </p>
                            <Button size="sm" onClick={downloadBingo}>
                                <Download className="size-4 mr-2" />
                                {t("download")}
                            </Button>
                        </DialogContent>
                    </Dialog>

                    <Button size="sm" onClick={downloadBingo}>
                        <Download className="size-4 mr-2" />
                        {t("download")}
                    </Button>

                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleReset}
                    >
                        {t("reset")}
                    </Button>
                </div>
            </div>

            {/* Hidden export - always full size for download */}
            <div className="absolute -left-[9999px] pointer-events-none">
                <div ref={exportRef}>
                    <BingoExport board={board} marked={marked} />
                </div>
            </div>
        </div>
    );
};

export default BingoGame;
