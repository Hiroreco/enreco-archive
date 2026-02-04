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
import {
    CheckSquare,
    Download,
    Edit,
    Eye,
    Shuffle,
    Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const createInitialBoard = () => {
    const board = Array(25).fill("");
    board[12] = "Free\nSpace!"; // Center square
    return board;
};

const PRESET_VALUES = [
    "Bae says 'Bruh'",
    "Liz scammed",
    "IRyS netorare",
    "Kronii is late",
    "Cecilia crashes out",
    "Calli cooks",
    "Ame returns",
    "potato salad",
    "Kiara screams",
    "Ina puns",
    "Shiori laughs maniacally",
    "Nerissa sings",
    "FWMC baus",
    "Bijou says 'Biboo'",
    "Raora goes 'Big cat'",
    "Cecilia leeches",
    "Gigi chaos",
    "ERB royalty",
    "Someone dc's",
    "Technical difficulties",
    "Collab chaos",
    "Cute moment",
    "Emotional moment",
    "Random tangent",
];

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
export const getTextStyle = (text: string): React.CSSProperties => {
    const isMobile = isMobileViewport();

    const words = text.split(/[\s\n]+/).filter((word) => word.length > 0);
    const longestWord = Math.max(...words.map((word) => word.length), 0);
    const totalLength = text.length;
    const lineCount = text.split("\n").length;

    // Calculate complexity score
    const hasVeryLongWord = longestWord > 12;
    const hasLongWord = longestWord > 10;
    const hasManyLines = lineCount > 3;
    const isLongText = totalLength > 40;

    const sizing = isMobile
        ? {
              // Mobile (64px squares) - tighter sizing
              veryLong: "clamp(0.5rem, 2cqw, 0.625rem)",
              long: "clamp(0.5rem, 2.5cqw, 0.75rem)",
              medium: "clamp(0.625rem, 2.75cqw, 0.75rem)",
              short: "clamp(0.75rem, 3.5cqw, 0.875rem)",
              veryShort: "clamp(0.875rem, 4cqw, 1rem)",
              default: "clamp(0.625rem, 3cqw, 0.75rem)",
          }
        : {
              // Desktop (80px squares) - balanced sizing
              veryLong: "clamp(0.5rem, 2cqw, 0.625rem)",
              long: "clamp(0.625rem, 2.5cqw, 0.75rem)",
              medium: "clamp(0.75rem, 3cqw, 0.875rem)",
              short: "clamp(0.875rem, 3.5cqw, 1rem)",
              veryShort: "clamp(1rem, 4cqw, 1.125rem)",
              default: "clamp(0.75rem, 3cqw, 0.875rem)",
          };

    // Very long words or lots of content
    if (hasVeryLongWord || (hasManyLines && isLongText)) {
        return { fontSize: sizing.veryLong };
    }

    // Long words or many lines
    if (hasLongWord || hasManyLines) {
        return { fontSize: sizing.long };
    }

    // Medium length with multiple lines
    if (isLongText || lineCount > 2) {
        return { fontSize: sizing.medium };
    }

    // Short single-line text
    if (totalLength <= 8 && lineCount === 1) {
        return { fontSize: sizing.veryShort };
    }

    // Moderate short text
    if (totalLength <= 15) {
        return { fontSize: sizing.short };
    }

    return { fontSize: sizing.default };
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

    const handleRandomize = () => {
        // Shuffle the current board (keeping center square in place if desired)
        const centerValue = board[12];
        const shuffled = [...board];

        // Fisher-Yates shuffle algorithm
        for (let i = shuffled.length - 1; i > 0; i--) {
            // Skip center square
            if (i === 12) continue;

            let j = Math.floor(Math.random() * (i + 1));
            // Skip center square
            if (j === 12) j = (j + 1) % shuffled.length;

            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Restore center value if needed
        shuffled[12] = centerValue;
        setBoard(shuffled);
        setMarked(Array(25).fill(false));
    };

    const handlePreset = () => {
        // Create a copy of preset values
        const availableValues = [...PRESET_VALUES];
        const newBoard: string[] = [];

        // Fill 25 squares
        for (let i = 0; i < 25; i++) {
            if (i === 12) {
                // Keep center as "Free Space"
                newBoard.push("Free\nSpace!");
            } else if (availableValues.length > 0) {
                // Pick a random value from available presets
                const randomIndex = Math.floor(
                    Math.random() * availableValues.length,
                );
                newBoard.push(availableValues[randomIndex]);
                // Remove used value to avoid duplicates (optional - remove this line if duplicates are OK)
                availableValues.splice(randomIndex, 1);
            } else {
                // If we run out of preset values, use empty string
                newBoard.push("");
            }
        }

        setBoard(newBoard);
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
                <div className="flex items-center justify-center gap-2">
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

                <div className="flex md:flex-col flex-row gap-2 flex-wrap">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRandomize}
                        title={t("randomize")}
                    >
                        <Shuffle className="size-4 mr-2" />
                        {t("randomize")}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePreset}
                        title={t("preset")}
                    >
                        <Sparkles className="size-4 mr-2" />
                        {t("preset")}
                    </Button>
                </div>

                <div className="h-px bg-border my-1" />

                <div className="flex md:flex-col flex-row gap-2 flex-wrap">
                    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Eye className="size-4 mr-2" />
                                {t("preview")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="flex flex-col items-center justify-center px-1">
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
                    <BingoExport board={board} marked={marked} downloadMode />
                </div>
            </div>
        </div>
    );
};

export default BingoGame;
