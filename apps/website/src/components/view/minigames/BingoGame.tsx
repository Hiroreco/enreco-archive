import BingoEditor from "@/components/view/minigames/BingoEditor";
import BingoExport from "@/components/view/minigames/BingoExport";
import BingoImportDialog from "@/components/view/minigames/BingoImportDialog";
import BingoShareDialog from "@/components/view/minigames/BingoShareDialog";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
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

type DayBoards = Record<string, string[]>;
type DayMarked = Record<string, boolean[]>;

// Initialize boards for all days from localStorage
const getInitialBoards = (): DayBoards => {
    if (typeof window === "undefined") {
        return { "1": createInitialBoard() };
    }

    const savedBoards = localStorage.getItem(LS_KEYS.BINGO_BOARDS);
    if (savedBoards) {
        try {
            return JSON.parse(savedBoards);
        } catch (e) {
            console.error("Failed to parse saved boards:", e);
        }
    }
    return { "1": createInitialBoard() };
};

const getInitialAllMarked = (): DayMarked => {
    if (typeof window === "undefined") {
        return { "1": Array(25).fill(false) };
    }

    const savedMarked = localStorage.getItem(LS_KEYS.BINGO_ALL_MARKED);
    if (savedMarked) {
        try {
            return JSON.parse(savedMarked);
        } catch (e) {
            console.error("Failed to parse saved marked:", e);
        }
    }
    return { "1": Array(25).fill(false) };
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
    const tCommon = useTranslations("common");
    const [currentDay, setCurrentDay] = useState("1");
    const [allBoards, setAllBoards] = useState<DayBoards>(getInitialBoards);
    const [allMarked, setAllMarked] = useState<DayMarked>(getInitialAllMarked);
    const [isEditMode, setIsEditMode] = useState(true);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    // Get current day's board and marked state
    const board =
        allBoards[currentDay] ||
        allBoards[String(Number(currentDay) - 1)] ||
        createInitialBoard();
    const marked = allMarked[currentDay] || Array(25).fill(false);

    // Check URL parameters for shared board on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        const params = new URLSearchParams(window.location.search);
        const sharedBoard = params.get("bingo");
        const sharedDay = params.get("day");

        if (sharedBoard) {
            try {
                const json = decodeURIComponent(escape(atob(sharedBoard)));
                const board = JSON.parse(json);

                if (Array.isArray(board) && board.length === 25) {
                    const day = sharedDay || "1";
                    setCurrentDay(day);
                    setAllBoards((prev) => ({
                        ...prev,
                        [day]: board.map((item) => String(item)),
                    }));
                }

                // Clean up URL
                window.history.replaceState({}, "", window.location.pathname);
            } catch (error) {
                console.error("Failed to load shared board:", error);
            }
        }
    }, []);

    // Save all boards to localStorage when they change
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(
                LS_KEYS.BINGO_BOARDS,
                JSON.stringify(allBoards),
            );
        }
    }, [allBoards]);

    // Save all marked states to localStorage when they change
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(
                LS_KEYS.BINGO_ALL_MARKED,
                JSON.stringify(allMarked),
            );
        }
    }, [allMarked]);

    // When day changes, ensure the day exists (copy from previous day if not)
    useEffect(() => {
        if (!allBoards[currentDay]) {
            const prevDay = String(Number(currentDay) - 1);
            const prevBoard = allBoards[prevDay] || createInitialBoard();
            setAllBoards((prev) => ({
                ...prev,
                [currentDay]: [...prevBoard],
            }));
        }
        if (!allMarked[currentDay]) {
            setAllMarked((prev) => ({
                ...prev,
                [currentDay]: Array(25).fill(false),
            }));
        }
    }, [currentDay, allBoards, allMarked]);

    const handleSquareClick = (index: number) => {
        if (isEditMode) {
            setEditingIndex(index);
        } else {
            setAllMarked((prev) => {
                const dayMarked = [...(prev[currentDay] || [])];
                dayMarked[index] = !dayMarked[index];
                return {
                    ...prev,
                    [currentDay]: dayMarked,
                };
            });
        }
    };

    const handleTextChange = (index: number, value: string) => {
        setAllBoards((prev) => {
            const dayBoard = [...(prev[currentDay] || [])];
            dayBoard[index] = value;
            return {
                ...prev,
                [currentDay]: dayBoard,
            };
        });
    };

    const handleImport = (importedBoard: string[]) => {
        setAllBoards((prev) => ({
            ...prev,
            [currentDay]: importedBoard,
        }));
        setAllMarked((prev) => ({
            ...prev,
            [currentDay]: Array(25).fill(false),
        }));
    };

    const handleReset = () => {
        setAllBoards((prev) => ({
            ...prev,
            [currentDay]: createInitialBoard(),
        }));
        setAllMarked((prev) => ({
            ...prev,
            [currentDay]: Array(25).fill(false),
        }));
    };

    const handleRandomize = () => {
        const currentBoard = board;
        const centerValue = currentBoard[12];
        const shuffled = [...currentBoard];

        // Fisher-Yates shuffle algorithm
        for (let i = shuffled.length - 1; i > 0; i--) {
            if (i === 12) continue;
            let j = Math.floor(Math.random() * (i + 1));
            if (j === 12) j = (j + 1) % shuffled.length;
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        shuffled[12] = centerValue;
        setAllBoards((prev) => ({
            ...prev,
            [currentDay]: shuffled,
        }));
        setAllMarked((prev) => ({
            ...prev,
            [currentDay]: Array(25).fill(false),
        }));
    };

    const handlePreset = () => {
        const availableValues = [...PRESET_VALUES];
        const newBoard: string[] = [];

        for (let i = 0; i < 25; i++) {
            if (i === 12) {
                newBoard.push("Free\nSpace!");
            } else if (availableValues.length > 0) {
                const randomIndex = Math.floor(
                    Math.random() * availableValues.length,
                );
                newBoard.push(availableValues[randomIndex]);
                availableValues.splice(randomIndex, 1);
            } else {
                newBoard.push("");
            }
        }

        setAllBoards((prev) => ({
            ...prev,
            [currentDay]: newBoard,
        }));
        setAllMarked((prev) => ({
            ...prev,
            [currentDay]: Array(25).fill(false),
        }));
    };

    const downloadBingo = async () => {
        if (!exportRef.current) return;
        const html2canvas = (await import("html2canvas-pro")).default;
        const canvas = await html2canvas(exportRef.current, { scale: 2 });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `enreco-bingo-day${currentDay}.png`;
        link.click();
    };

    return (
        <div className="flex md:flex-row flex-col gap-6 justify-center items-center py-4">
            <div className="flex flex-col gap-3">
                <BingoEditor
                    board={board}
                    marked={marked}
                    isEditMode={isEditMode}
                    editingIndex={editingIndex}
                    onSquareClick={handleSquareClick}
                    onTextChange={handleTextChange}
                    onEditingChange={setEditingIndex}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Select value={currentDay} onValueChange={setCurrentDay}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 8 }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>
                                {tCommon("day", { val: i + 1 })}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
                    <BingoShareDialog board={board} currentDay={currentDay} />
                    <BingoImportDialog onImport={handleImport} />
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
