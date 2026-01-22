import BingoEditor from "@/components/view/minigames/BingoEditor";
import BingoExport from "@/components/view/minigames/BingoExport";
import { Button } from "@enreco-archive/common-ui/components/button";
import { CheckSquare, Download, Edit } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

const INITIAL_BOARD = Array(25).fill("");

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
    const [board, setBoard] = useState<string[]>(INITIAL_BOARD);
    const [marked, setMarked] = useState<boolean[]>(Array(25).fill(false));
    const [isEditMode, setIsEditMode] = useState(true);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const exportRef = useRef<HTMLDivElement>(null);

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
                <Button size="sm" onClick={downloadBingo}>
                    <Download className="w-4 h-4 mr-2" />
                    {t("download")}
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
