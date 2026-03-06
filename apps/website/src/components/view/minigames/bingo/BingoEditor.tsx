import { getTextStyle } from "@/components/view/minigames/bingo/BingoGame";
import useIsMobileViewport from "@/hooks/useIsMobileViewport";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import Image from "next/image";

interface BingoEditorProps {
    board: string[];
    marked: boolean[];
    isEditMode: boolean;
    editingIndex: number | null;
    highlightedIndices?: number[];
    onSquareClick: (index: number) => void;
    onTextChange: (index: number, value: string) => void;
    onEditingChange: (index: number | null) => void;
    isMobile?: boolean;
}

const BingoEditor = ({
    board,
    marked,
    isEditMode,
    editingIndex,
    highlightedIndices = [],
    onSquareClick,
    onTextChange,
    onEditingChange,
}: BingoEditorProps) => {
    const isMobile = useIsMobileViewport();
    const getEditingStyle = (text: string): React.CSSProperties => {
        const baseStyle = getTextStyle(text, isMobile);

        // Keep the active editing text visually centered, similar to the display state.
        const explicitLineCount = Math.max(text.split("\n").length, 1);
        const estimatedTextBlockHeightEm = explicitLineCount * 1.2;

        return {
            ...baseStyle,
            paddingTop: `max(0px, calc(50% - ${estimatedTextBlockHeightEm / 2}em))`,
        };
    };

    return (
        <div className="size-full p-2 bg-white/10 rounded border border-gray-300 dark:border-gray-700">
            <div className="grid grid-cols-5 grid-rows-5 gap-1 size-full">
                {board.map((text, index) => {
                    const isMarked = marked[index];
                    const isEditing = editingIndex === index;
                    const isCenter = index === 12;
                    const isHighlighted = highlightedIndices.includes(index);
                    return (
                        <div
                            key={index}
                            onClick={() => !isEditing && onSquareClick(index)}
                            className={cn(
                                "group border-2 border-gray-800 dark:border-gray-600 cursor-pointer relative",
                                "flex flex-col items-center justify-center transition-all bg-white dark:bg-gray-800",
                                {
                                    "bg-yellow-100/80 dark:bg-yellow-900/30":
                                        !isMarked && isHighlighted,
                                    "hover:bg-gray-100 dark:hover:bg-gray-700":
                                        isEditMode &&
                                        !isMarked &&
                                        !isHighlighted,
                                    "hover:bg-yellow-200/80 dark:hover:bg-yellow-900/40":
                                        isEditMode &&
                                        !isMarked &&
                                        isHighlighted,
                                },
                            )}
                            style={{ containerType: "size" }}
                        >
                            {isCenter && (
                                <Image
                                    alt=""
                                    src="/images-opt/emblem-opt.webp"
                                    fill
                                    className="opacity-15 z-10"
                                />
                            )}
                            {isEditing && isEditMode ? (
                                <textarea
                                    autoFocus
                                    value={text}
                                    onChange={(e) =>
                                        onTextChange(index, e.target.value)
                                    }
                                    onBlur={() => onEditingChange(null)}
                                    maxLength={60}
                                    className={cn(
                                        "w-full h-full resize-none bg-transparent border-0 outline-none z-10",
                                        "text-center leading-tight font-bold",
                                        "whitespace-pre-wrap break-words",
                                    )}
                                    style={getEditingStyle(text)}
                                />
                            ) : (
                                <div
                                    className={cn(
                                        "size-full flex flex-col justify-center text-center px-1 leading-tight font-bold z-10",
                                        "whitespace-pre-wrap break-words",
                                    )}
                                    style={getTextStyle(text, isMobile)}
                                >
                                    {text}
                                </div>
                            )}

                            {/* Marker ring */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div
                                    className={cn(
                                        "w-[90%] h-[90%] rounded-full border-8 md:border-12 border-red-500",
                                        {
                                            "opacity-80": isMarked,
                                            "opacity-0":
                                                isEditMode && !isMarked,
                                            "opacity-0 group-hover:opacity-60":
                                                !isMarked && !isEditMode,
                                        },
                                    )}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BingoEditor;
