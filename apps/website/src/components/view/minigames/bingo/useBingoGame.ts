import { PRESET_VALUES } from "@/components/view/minigames/bingo/bingo-config";
import { LS_KEYS } from "@/lib/constants";
import { useSettingStore } from "@/store/settingStore";
import { useViewStore } from "@/store/viewStore";
import { useEffect, useState } from "react";

const createInitialBoard = (locale: string = "en"): string[] => {
    const board = Array(25).fill("");

    if (locale === "ja") {
        board[12] = "フリー！";
        board[0] = "ここに\n予想を\n入力";
        board[2] = "または\nプリセットを\n使用";
        board[4] = "「プレビュー」で\nカードを\n確認";
        board[14] = "編集モードと\nマークモードを\n切替";
        board[24] = "詳細は\n情報アイコンを\nクリック";
    } else {
        board[12] = "Free\nSpace!";
        board[0] = "Type your\nprediction\nhere";
        board[2] = "Or use\nthe preset\nvalues";
        board[4] = `Then click\n"Preview" to\nview your card`;
        board[14] = `Switch between\nEdit Mode and\nMark Mode`;
        board[24] = `Click the\nInfo icon for more details`;
    }

    return board;
};
const createBlankBoard = (): string[] => {
    return Array(25).fill("");
};

type DayBoards = Record<string, string[]>;
type DayMarked = Record<string, boolean[]>;
type PreviewMode = "none" | "preset" | "randomize";

const getInitialBoards = (locale: string): DayBoards => {
    if (typeof window === "undefined") {
        return { "1": createInitialBoard(locale) };
    }

    const savedBoards = localStorage.getItem(LS_KEYS.BINGO_BOARDS);
    if (savedBoards) {
        try {
            return JSON.parse(savedBoards);
        } catch (e) {
            console.error("Failed to parse saved boards:", e);
        }
    }
    return { "1": createInitialBoard(locale) };
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

export const useBingoGame = () => {
    const { locale } = useSettingStore();
    const { day } = useViewStore();
    const [currentDay, setCurrentDay] = useState((day + 1).toString());
    const [allBoards, setAllBoards] = useState<DayBoards>(
        getInitialBoards(locale),
    );
    const [allMarked, setAllMarked] = useState<DayMarked>(getInitialAllMarked);
    const [isEditMode, setIsEditMode] = useState(true);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [previewMode, setPreviewMode] = useState<PreviewMode>("none");
    const [previewBoard, setPreviewBoard] = useState<string[]>([]);
    const [showFullBoardAlert, setShowFullBoardAlert] = useState(false);
    const [originalBoard, setOriginalBoard] = useState<string[]>([]);
    const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);
    const [showDay, setShowDay] = useState(getInitialShowDay);

    const board = allBoards[currentDay] || createBlankBoard();
    const marked = allMarked[currentDay] || Array(25).fill(false);
    const displayBoard = previewMode !== "none" ? previewBoard : board;

    const emptyCount = board.filter(
        (text, idx) => idx !== 12 && !text.trim(),
    ).length;
    const isBoardFull = emptyCount === 0;
    const isBoardEmpty = board.every((text, idx) => idx === 12 || !text.trim());
    const isInPreviewMode = previewMode !== "none";

    // Save showDay to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(LS_KEYS.BINGO_SHOW_DAY, String(showDay));
        }
    }, [showDay]);

    // Save boards to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(
                LS_KEYS.BINGO_BOARDS,
                JSON.stringify(allBoards),
            );
        }
    }, [allBoards]);

    // Save marked to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(
                LS_KEYS.BINGO_ALL_MARKED,
                JSON.stringify(allMarked),
            );
        }
    }, [allMarked]);

    // Ensure day exists
    useEffect(() => {
        if (!allBoards[currentDay]) {
            const blankBoard = createBlankBoard();
            setAllBoards((prev) => ({
                ...prev,
                [currentDay]: [...blankBoard],
            }));
        }
        if (!allMarked[currentDay]) {
            setAllMarked((prev) => ({
                ...prev,
                [currentDay]: Array(25).fill(false),
            }));
        }
    }, [currentDay, allBoards, allMarked]);

    const LINES = [
        [0, 1, 2, 3, 4],
        [5, 6, 7, 8, 9],
        [10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24], // rows
        [0, 5, 10, 15, 20],
        [1, 6, 11, 16, 21],
        [2, 7, 12, 17, 22],
        [3, 8, 13, 18, 23],
        [4, 9, 14, 19, 24], // cols
        [0, 6, 12, 18, 24],
        [4, 8, 12, 16, 20], // diagonals
    ];

    const winningIndices = new Set(
        LINES.filter((line) => line.every((i) => marked[i])).flat(),
    );

    const handleSquareClick = (index: number) => {
        if (previewMode !== "none") return;

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
            [currentDay]: createBlankBoard(),
        }));
        setAllMarked((prev) => ({
            ...prev,
            [currentDay]: Array(25).fill(false),
        }));
    };

    const generatePresetBoard = (
        currentBoard: string[],
    ): { board: string[]; filledIndices: number[] } => {
        const newBoard = [...currentBoard];
        const emptyIndices: number[] = [];

        currentBoard.forEach((text, idx) => {
            if (idx !== 12 && !text.trim()) {
                emptyIndices.push(idx);
            }
        });

        const neededCount = emptyIndices.length;
        if (neededCount === 0) return { board: newBoard, filledIndices: [] };

        const cat0Count = Math.ceil(neededCount / 3);
        const cat1Count = Math.floor((neededCount - cat0Count) / 2);
        const cat2Count = neededCount - cat0Count - cat1Count;

        const usedValues = new Set(currentBoard.filter((v) => v.trim()));
        const availableValues: string[] = [];

        const addFromCategory = (category: 0 | 1 | 2, count: number) => {
            const categoryValues = PRESET_VALUES[category]
                .map((item) => item[locale])
                .filter((val) => !usedValues.has(val));
            const shuffled = categoryValues.sort(() => Math.random() - 0.5);
            availableValues.push(...shuffled.slice(0, count));
        };

        addFromCategory(0, cat0Count);
        addFromCategory(1, cat1Count);
        addFromCategory(2, cat2Count);

        availableValues.sort(() => Math.random() - 0.5);

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

    const shuffleBoard = (currentBoard: string[]): string[] => {
        const centerValue = currentBoard[12];
        const shuffled = [...currentBoard];

        for (let i = shuffled.length - 1; i > 0; i--) {
            if (i === 12) continue;
            let j = Math.floor(Math.random() * (i + 1));
            if (j === 12) j = (j + 1) % shuffled.length;
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        shuffled[12] = centerValue;
        return shuffled;
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

    const downloadBingo = async (
        exportRef: React.RefObject<HTMLDivElement | null>,
    ) => {
        if (!exportRef.current) return;
        const html2canvas = (await import("html2canvas-pro")).default;
        const canvas = await html2canvas(exportRef.current, { scale: 2 });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `enreco-bingo-day${currentDay}.png`;
        link.click();
    };

    return {
        // State
        currentDay,
        board,
        marked,
        displayBoard,
        isEditMode,
        editingIndex,
        previewMode,
        highlightedIndices,
        showDay,
        showFullBoardAlert,
        isBoardEmpty,
        isInPreviewMode,
        winningIndices,

        // Setters
        setCurrentDay,
        setIsEditMode,
        setEditingIndex,
        setShowDay,
        setShowFullBoardAlert,

        // Handlers
        handleSquareClick,
        handleTextChange,
        handleImport,
        handleReset,
        handlePresetClick,
        handlePresetReroll,
        handlePresetAccept,
        handlePresetCancel,
        handleRandomizeClick,
        handleRandomizeReroll,
        handleRandomizeAccept,
        handleRandomizeCancel,
        downloadBingo,
    };
};
