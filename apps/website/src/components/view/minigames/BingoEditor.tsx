import { getFontSizeClass } from "@/components/view/minigames/BingoGame";
import { cn } from "@enreco-archive/common-ui/lib/utils";

interface BingoEditorProps {
    board: string[];
    marked: boolean[];
    isEditMode: boolean;
    editingIndex: number | null;
    onSquareClick: (index: number) => void;
    onTextChange: (index: number, value: string) => void;
    onEditingChange: (index: number | null) => void;
}

const BingoEditor = ({
    board,
    marked,
    isEditMode,
    editingIndex,
    onSquareClick,
    onTextChange,
    onEditingChange,
}: BingoEditorProps) => {
    return (
        <div className="grid grid-cols-5 gap-1 bg-white/10 p-2 rounded border border-gray-300 dark:border-gray-700">
            {board.map((text, index) => {
                const isMarked = marked[index];
                const isEditing = editingIndex === index;

                return (
                    <div
                        key={index}
                        onClick={() => !isEditing && onSquareClick(index)}
                        className={cn(
                            "size-16 md:size-20 border-2 border-gray-800 dark:border-gray-600 cursor-pointer relative",
                            "flex flex-col items-center justify-center transition-all",
                            {
                                "bg-blue-500/60": isMarked,
                                "bg-white dark:bg-gray-800": !isMarked,
                                "hover:bg-gray-100 dark:hover:bg-gray-700":
                                    isEditMode && !isMarked,
                                "hover:bg-blue-400/40":
                                    !isEditMode && !isMarked,
                            },
                        )}
                    >
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
                                    "w-full h-full resize-none bg-transparent border-0 outline-none",
                                    "text-center leading-tight",
                                    "whitespace-pre-wrap break-words",
                                    getFontSizeClass(text),
                                )}
                                style={{ paddingTop: "0.25em" }}
                            />
                        ) : (
                            <div
                                className={cn(
                                    "size-full flex flex-col justify-center text-center px-1 leading-tight",
                                    "whitespace-pre-wrap break-words",
                                    getFontSizeClass(text),
                                )}
                            >
                                {text}
                            </div>
                        )}

                        {isMarked && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-0 bg-red-600 rotate-45 h-0.5 m-auto" />
                                <div className="absolute inset-0 bg-red-600 -rotate-45 h-0.5 m-auto" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BingoEditor;
