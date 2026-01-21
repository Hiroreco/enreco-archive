import { Button } from "@enreco-archive/common-ui/components/button";
import { Input } from "@enreco-archive/common-ui/components/input";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Download, Edit, CheckSquare } from "lucide-react";

const INITIAL_BOARD = Array(25).fill("");

const BingoGame = () => {
    const t = useTranslations("modals.minigames.games.bingo");
    const [board, setBoard] = useState<string[]>(INITIAL_BOARD);
    const [marked, setMarked] = useState<boolean[]>(Array(25).fill(false));
    const [isEditMode, setIsEditMode] = useState(true);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const bingoRef = useRef<HTMLDivElement>(null);

    const handleSquareClick = (index: number) => {
        if (isEditMode) {
            setEditingIndex(index);
        } else {
            setMarked((prev) => {
                const newMarked = [...prev];
                newMarked[index] = !newMarked[index];
                return newMarked;
            });
        }
    };

    const handleTextChange = (index: number, value: string) => {
        setBoard((prev) => {
            const newBoard = [...prev];
            newBoard[index] = value;
            return newBoard;
        });
    };

    const downloadBingo = async () => {
        if (!bingoRef.current) return;

        try {
            // Dynamically import html2canvas
            const html2canvas = (await import("html2canvas-pro")).default;

            const canvas = await html2canvas(bingoRef.current, {
                backgroundColor: null,
                scale: 2,
            });

            const link = document.createElement("a");
            link.download = "enreco-bingo.png";
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error("Failed to download bingo:", error);
        }
    };

    const resetBoard = () => {
        setBoard(INITIAL_BOARD);
        setMarked(Array(25).fill(false));
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full h-full overflow-auto py-4">
            {/* Controls */}
            <div className="flex gap-2 flex-wrap justify-center">
                <Button
                    variant={isEditMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsEditMode(true)}
                >
                    <Edit className="w-4 h-4 mr-2" />
                    {t("editMode")}
                </Button>
                <Button
                    variant={!isEditMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsEditMode(false)}
                >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    {t("markMode")}
                </Button>
                <Button size="sm" onClick={downloadBingo}>
                    <Download className="w-4 h-4 mr-2" />
                    {t("download")}
                </Button>
                <Button size="sm" variant="destructive" onClick={resetBoard}>
                    {t("reset")}
                </Button>
            </div>

            {/* Bingo Board */}
            <div
                ref={bingoRef}
                className="relative flex flex-col items-center gap-2 p-6 rounded-lg"
                style={{
                    backgroundImage: "url('/images-opt/enreco-map-opt.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Backdrop overlay */}
                <div className="absolute inset-0 bg-black/40 rounded-lg" />

                {/* Header Text */}
                <div className="relative z-10 flex flex-col items-center text-white mb-2">
                    <h2 className="text-lg md:text-xl font-bold text-shadow-strong">
                        ENigmatic Recollection
                    </h2>
                    <h1 className="text-3xl md:text-5xl font-bold text-shadow-strong">
                        BINGO
                    </h1>
                    <h3 className="text-base md:text-lg font-semibold text-shadow-strong">
                        Chapter 3: Broken Bonds
                    </h3>
                </div>

                {/* Grid */}
                <div className="relative z-10 grid grid-cols-5 gap-1 bg-white/90 p-2 rounded">
                    {board.map((text, index) => {
                        const isMarked = marked[index];
                        const isCenter = index === 12;
                        const isEditing = editingIndex === index;

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "size-10 border-2 border-gray-800 flex items-center justify-center cursor-pointer transition-all relative",
                                    {
                                        "bg-blue-500/60": isMarked && !isCenter,
                                        "bg-white": !isMarked && !isCenter,
                                        "bg-yellow-400": isCenter,
                                        "hover:bg-gray-100":
                                            isEditMode && !isMarked,
                                        "hover:bg-blue-400/40":
                                            !isEditMode && !isMarked,
                                    },
                                )}
                                onClick={() =>
                                    !isEditing && handleSquareClick(index)
                                }
                            >
                                {isCenter ? (
                                    <span className="text-xl md:text-2xl font-bold">
                                        ★
                                    </span>
                                ) : isEditing && isEditMode ? (
                                    <Input
                                        autoFocus
                                        value={text}
                                        onChange={(e) =>
                                            handleTextChange(
                                                index,
                                                e.target.value,
                                            )
                                        }
                                        onBlur={() => setEditingIndex(null)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                setEditingIndex(null);
                                            }
                                        }}
                                        className="w-full h-full text-center text-xs p-1 border-0"
                                        maxLength={30}
                                    />
                                ) : (
                                    <span className="text-xs md:text-sm text-center px-1 break-words line-clamp-3">
                                        {text}
                                    </span>
                                )}
                                {isMarked && !isCenter && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-full h-0.5 bg-red-600 rotate-45 absolute" />
                                        <div className="w-full h-0.5 bg-red-600 -rotate-45 absolute" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BingoGame;
