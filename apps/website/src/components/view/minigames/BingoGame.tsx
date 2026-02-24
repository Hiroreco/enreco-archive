import BingoEditor from "@/components/view/minigames/BingoEditor";
import BingoExport from "@/components/view/minigames/BingoExport";
import BingoFullBoardAlert from "@/components/view/minigames/BingoFullBoardAlert";
import BingoImportDialog from "@/components/view/minigames/BingoImportDialog";
import BingoShareDialog, {
    decompressBoardData,
} from "@/components/view/minigames/BingoShareDialog";
import { PRESET_VALUES } from "@/components/view/minigames/bingo-config";
import { LS_KEYS } from "@/lib/constants";
import { isMobileViewport } from "@/lib/utils";
import { useSettingStore } from "@/store/settingStore";
import { useViewStore } from "@/store/viewStore";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
    Check,
    CheckSquare,
    Download,
    Edit,
    Eye,
    RotateCcw,
    Shuffle,
    Sparkles,
    X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const createInitialBoard = () => {
    const board = Array(25).fill("");
    board[12] = "REVELATION!"; // Center square
    return board;
};

type DayBoards = Record<string, string[]>;
type DayMarked = Record<string, boolean[]>;
type PreviewMode = "none" | "preset" | "randomize";

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

const getInitialShowDay = (): boolean => {
    if (typeof window === "undefined") return true;

    const savedShowDay = localStorage.getItem(LS_KEYS.BINGO_SHOW_DAY);
    if (savedShowDay !== null) {
        return savedShowDay === "true";
    }
    return true;
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
    const { locale } = useSettingStore();
    const { day } = useViewStore();
    const tCommon = useTranslations("common");
    const [currentDay, setCurrentDay] = useState((day + 1).toString());
    const [allBoards, setAllBoards] = useState<DayBoards>(getInitialBoards);
    const [allMarked, setAllMarked] = useState<DayMarked>(getInitialAllMarked);
    const [isEditMode, setIsEditMode] = useState(true);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewMode, setPreviewMode] = useState<PreviewMode>("none");
    const [previewBoard, setPreviewBoard] = useState<string[]>([]);
    const [showFullBoardAlert, setShowFullBoardAlert] = useState(false);
    const [originalBoard, setOriginalBoard] = useState<string[]>([]);
    const exportRef = useRef<HTMLDivElement>(null);
    const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);
    const [showDay, setShowDay] = useState(getInitialShowDay);

    // Get current day's board and marked state
    const board =
        allBoards[currentDay] ||
        allBoards[String(Number(currentDay) - 1)] ||
        createInitialBoard();
    const marked = allMarked[currentDay] || Array(25).fill(false);

    // Display board is either preview or actual board
    const displayBoard = previewMode !== "none" ? previewBoard : board;

    // Count empty squares (excluding center)
    const emptyCount = board.filter(
        (text, idx) => idx !== 12 && !text.trim(),
    ).length;
    const isBoardFull = emptyCount === 0;
    const isBoardEmpty = board.every((text, idx) => idx === 12 || !text.trim());

    // Check URL parameters for shared board on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        (async () => {
            const params = new URLSearchParams(window.location.search);
            const sharedBoard = params.get("bingo");
            const sharedDay = params.get("day");

            if (sharedBoard) {
                const board = await decompressBoardData(sharedBoard);
                if (board) {
                    const day = sharedDay || "1";
                    setCurrentDay(day);
                    setAllBoards((prev) => ({
                        ...prev,
                        [day]: board,
                    }));
                }

                window.history.replaceState({}, "", window.location.pathname);
            }
        })();
    }, []);

    // Save showDay to localStorage when it changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(LS_KEYS.BINGO_SHOW_DAY, String(showDay));
        }
    }, [showDay]);

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
        if (previewMode !== "none") return; // Disable editing in preview mode

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
        if (previewMode !== "none") return;

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

    // Generate preset values to fill empty squares
    const generatePresetBoard = (
        currentBoard: string[],
    ): { board: string[]; filledIndices: number[] } => {
        const newBoard = [...currentBoard];
        const emptyIndices: number[] = [];

        // Find all empty squares (excluding center)
        currentBoard.forEach((text, idx) => {
            if (idx !== 12 && !text.trim()) {
                emptyIndices.push(idx);
            }
        });

        const neededCount = emptyIndices.length;
        if (neededCount === 0) return { board: newBoard, filledIndices: [] };

        // Calculate distribution: roughly even across categories
        const cat0Count = Math.ceil(neededCount / 3);
        const cat1Count = Math.floor((neededCount - cat0Count) / 2);
        const cat2Count = neededCount - cat0Count - cat1Count;

        // Collect all available values
        const usedValues = new Set(currentBoard.filter((v) => v.trim()));
        const availableValues: string[] = [];

        // Add from each category
        const addFromCategory = (category: 0 | 1 | 2, count: number) => {
            const categoryValues = PRESET_VALUES[category]
                .map((item) => item[locale])
                .filter((val) => !usedValues.has(val));

            // Shuffle and take what we need
            const shuffled = categoryValues.sort(() => Math.random() - 0.5);
            availableValues.push(...shuffled.slice(0, count));
        };

        addFromCategory(0, cat0Count);
        addFromCategory(1, cat1Count);
        addFromCategory(2, cat2Count);

        // Shuffle the collected values
        availableValues.sort(() => Math.random() - 0.5);

        // Fill the empty squares
        emptyIndices.forEach((idx, i) => {
            if (i < availableValues.length) {
                newBoard[idx] = availableValues[i];
            }
        });

        return { board: newBoard, filledIndices: emptyIndices };
    };
    const handlePresetClick = () => {
        if (isBoardFull) {
            setShowFullBoardAlert(true);
            return;
        }

        setOriginalBoard([...board]);
        const { board: generated, filledIndices } = generatePresetBoard(board);
        setPreviewBoard(generated);
        setHighlightedIndices(filledIndices);
        setPreviewMode("preset");
    };

    const handlePresetReroll = () => {
        const { board: generated, filledIndices } =
            generatePresetBoard(originalBoard);
        setPreviewBoard(generated);
        setHighlightedIndices(filledIndices);
    };
    const handlePresetAccept = () => {
        setAllBoards((prev) => ({
            ...prev,
            [currentDay]: previewBoard,
        }));
        setAllMarked((prev) => ({
            ...prev,
            [currentDay]: Array(25).fill(false),
        }));
        setPreviewMode("none");
        setPreviewBoard([]);
        setOriginalBoard([]);
        setHighlightedIndices([]);
    };

    const handlePresetCancel = () => {
        setPreviewMode("none");
        setPreviewBoard([]);
        setOriginalBoard([]);
        setHighlightedIndices([]);
    };

    const handleRandomizeClick = () => {
        setOriginalBoard([...board]);
        const shuffled = shuffleBoard(board);
        setPreviewBoard(shuffled);
        setHighlightedIndices([]);
        setPreviewMode("randomize");
    };

    const handleRandomizeReroll = () => {
        const shuffled = shuffleBoard(originalBoard);
        setPreviewBoard(shuffled);
    };

    const handleRandomizeAccept = () => {
        setAllBoards((prev) => ({
            ...prev,
            [currentDay]: previewBoard,
        }));
        setAllMarked((prev) => ({
            ...prev,
            [currentDay]: Array(25).fill(false),
        }));
        setPreviewMode("none");
        setPreviewBoard([]);
        setOriginalBoard([]);
        setHighlightedIndices([]);
    };
    const handleRandomizeCancel = () => {
        setPreviewMode("none");
        setPreviewBoard([]);
        setOriginalBoard([]);
        setHighlightedIndices([]);
    };

    const shuffleBoard = (currentBoard: string[]): string[] => {
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
        return shuffled;
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

    const isInPreviewMode = previewMode !== "none";

    return (
        <div className="flex md:flex-row flex-col gap-6 justify-center items-center py-4">
            <BingoFullBoardAlert
                open={showFullBoardAlert}
                onOpenChange={setShowFullBoardAlert}
            />

            <div className="flex flex-col gap-3">
                <BingoEditor
                    board={displayBoard}
                    marked={marked}
                    isEditMode={isEditMode}
                    editingIndex={editingIndex}
                    highlightedIndices={
                        previewMode === "preset" ? highlightedIndices : []
                    }
                    onSquareClick={handleSquareClick}
                    onTextChange={handleTextChange}
                    onEditingChange={setEditingIndex}
                />
            </div>

            {/* Desktop controls layout */}
            <div className="md:flex hidden flex-col gap-2">
                <span className="text-center font-semibold underline underline-offset-2">
                    {t("utilLabel")}
                </span>
                <div className="flex gap-2">
                    <Select
                        value={currentDay}
                        onValueChange={setCurrentDay}
                        disabled={isInPreviewMode}
                    >
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
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            variant={isEditMode ? "default" : "outline"}
                            onClick={() => setIsEditMode(true)}
                            title={t("editMode")}
                            disabled={isInPreviewMode}
                        >
                            <Edit />
                        </Button>
                        <Button
                            size="sm"
                            variant={!isEditMode ? "default" : "outline"}
                            onClick={() => setIsEditMode(false)}
                            title={t("markMode")}
                            disabled={isInPreviewMode}
                        >
                            <CheckSquare />
                        </Button>
                    </div>
                </div>

                <div className="h-px bg-border my-1" />

                {previewMode === "none" ? (
                    <div className="flex md:flex-col flex-row gap-2 flex-wrap">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRandomizeClick}
                            title={t("randomize")}
                            disabled={isBoardEmpty}
                        >
                            <Shuffle className="size-4 mr-2" />
                            {t("randomize")}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handlePresetClick}
                            title={t("preset")}
                        >
                            <Sparkles className="size-4 mr-2" />
                            {t("preset")}
                        </Button>
                    </div>
                ) : previewMode === "preset" ? (
                    <div className="flex md:flex-col flex-row gap-2 flex-wrap">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handlePresetReroll}
                        >
                            <RotateCcw className="size-4 mr-2" />
                            {t("reroll")}
                        </Button>
                        <Button
                            size="sm"
                            variant="default"
                            onClick={handlePresetAccept}
                        >
                            <Check className="size-4 mr-2" />
                            {t("accept")}
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handlePresetCancel}
                        >
                            <X className="size-4 mr-2" />
                            {t("cancel")}
                        </Button>
                    </div>
                ) : (
                    <div className="flex md:flex-col flex-row gap-2 flex-wrap">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRandomizeReroll}
                        >
                            <RotateCcw className="size-4 mr-2" />
                            {t("reroll")}
                        </Button>
                        <Button
                            size="sm"
                            variant="default"
                            onClick={handleRandomizeAccept}
                        >
                            <Check className="size-4 mr-2" />
                            {t("accept")}
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleRandomizeCancel}
                        >
                            <X className="size-4 mr-2" />
                            {t("cancel")}
                        </Button>
                    </div>
                )}

                <div className="h-px bg-border my-1" />

                <div className="flex md:flex-col flex-row gap-2 flex-wrap">
                    <BingoShareDialog
                        board={board}
                        currentDay={currentDay}
                        disabled={isInPreviewMode}
                    />
                    <BingoImportDialog
                        onImport={handleImport}
                        disabled={isInPreviewMode}
                    />
                </div>

                <div className="h-px bg-border my-1" />

                <div className="flex md:flex-col flex-row gap-2 flex-wrap">
                    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={isInPreviewMode}
                            >
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
                            <BingoExport
                                board={board}
                                marked={marked}
                                currentDay={currentDay}
                                showDay={showDay}
                            />

                            <p className="text-xs text-muted-foreground text-center">
                                {t("previewNote")}
                            </p>
                            <Button size="sm" onClick={downloadBingo}>
                                <Download className="size-4 mr-2" />
                                {t("download")}
                            </Button>
                        </DialogContent>
                    </Dialog>

                    <Button
                        size="sm"
                        onClick={downloadBingo}
                        disabled={isInPreviewMode}
                    >
                        <Download className="size-4 mr-2" />
                        {t("download")}
                    </Button>

                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleReset}
                        disabled={isInPreviewMode}
                    >
                        {t("reset")}
                    </Button>
                </div>
            </div>

            {/* Mobile controls layout */}
            <div className="flex flex-col gap-2 md:hidden">
                <span className="text-center font-semibold underline underline-offset-2">
                    {t("utilLabel")}
                </span>
                <div className="flex gap-2 items-center">
                    <Select
                        value={currentDay}
                        onValueChange={setCurrentDay}
                        disabled={isInPreviewMode}
                    >
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
                    <BingoShareDialog
                        board={board}
                        currentDay={currentDay}
                        disabled={isInPreviewMode}
                    />
                    <BingoImportDialog
                        onImport={handleImport}
                        disabled={isInPreviewMode}
                    />
                </div>

                <div className="flex items-center justify-center gap-2">
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            variant={isEditMode ? "default" : "outline"}
                            onClick={() => setIsEditMode(true)}
                            title={t("editMode")}
                            disabled={isInPreviewMode}
                        >
                            <Edit className="size-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant={!isEditMode ? "default" : "outline"}
                            onClick={() => setIsEditMode(false)}
                            title={t("markMode")}
                            disabled={isInPreviewMode}
                        >
                            <CheckSquare className="size-4" />
                        </Button>
                    </div>

                    {previewMode === "none" ? (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleRandomizeClick}
                                title={t("randomize")}
                                disabled={isBoardEmpty}
                            >
                                <Shuffle className="size-4 mr-2" />
                                {t("randomize")}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handlePresetClick}
                                title={t("preset")}
                            >
                                <Sparkles className="size-4 mr-2" />
                                {t("preset")}
                            </Button>
                        </>
                    ) : previewMode === "preset" ? (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handlePresetReroll}
                            >
                                <RotateCcw className="size-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="default"
                                onClick={handlePresetAccept}
                            >
                                <Check className="size-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handlePresetCancel}
                            >
                                <X className="size-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleRandomizeReroll}
                            >
                                <RotateCcw className="size-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="default"
                                onClick={handleRandomizeAccept}
                            >
                                <Check className="size-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleRandomizeCancel}
                            >
                                <X className="size-4" />
                            </Button>
                        </>
                    )}
                </div>

                <div className="h-px bg-border my-1" />

                <div className="flex md:flex-col flex-row gap-2 flex-wrap mx-auto">
                    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={isInPreviewMode}
                            >
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
                            <BingoExport
                                board={board}
                                marked={marked}
                                currentDay={currentDay}
                                showDay={showDay}
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
                                            setShowDay as (
                                                checked: boolean,
                                            ) => void
                                        }
                                        disabled={isInPreviewMode}
                                        className="size-4 cursor-pointer"
                                    />
                                    <span>{t("showDay")}</span>
                                </label>

                                <Button size="sm" onClick={downloadBingo}>
                                    <Download className="size-4 mr-2" />
                                    {t("download")}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button
                        size="sm"
                        onClick={downloadBingo}
                        disabled={isInPreviewMode}
                    >
                        <Download className="size-4 mr-2" />
                        {t("download")}
                    </Button>

                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleReset}
                        disabled={isInPreviewMode}
                    >
                        {t("reset")}
                    </Button>
                </div>
            </div>

            {/* Hidden export - always full size for download */}
            <div className="absolute -left-[9999px] pointer-events-none">
                <div ref={exportRef}>
                    <BingoExport
                        board={board}
                        marked={marked}
                        downloadMode
                        currentDay={currentDay}
                        showDay={showDay}
                    />
                </div>
            </div>
        </div>
    );
};

export default BingoGame;
