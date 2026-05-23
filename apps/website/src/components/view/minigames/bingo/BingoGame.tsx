import BingoDaySelector from "@/components/view/minigames/bingo/BingoDaySelector";
import BingoEditor from "@/components/view/minigames/bingo/BingoEditor";
import BingoExport from "@/components/view/minigames/bingo/BingoExport";
import BingoFullBoardAlert from "@/components/view/minigames/bingo/BingoFullBoardAlert";
import BingoImportDialog from "@/components/view/minigames/bingo/BingoImportDialog";
import BingoModeControls from "@/components/view/minigames/bingo/BingoModeControls";
import BingoPreviewDialog from "@/components/view/minigames/bingo/BingoPreviewDialog";
import BingoPreviewModeControls from "@/components/view/minigames/bingo/BingoPreviewModeControls";
import BingoResetDialog from "@/components/view/minigames/bingo/BingoResetDialog";
import BingoShareDialog from "@/components/view/minigames/bingo/BingoShareDialog";
import { useBingoGame } from "@/components/view/minigames/bingo/useBingoGame";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

/**
 * Calculate dynamic font size based on text characteristics
 * Returns CSS custom properties for fluid typography
 */
export const getTextStyle = (
    text: string,
    isMobile: boolean = false,
    downloadMode: boolean = false,
): React.CSSProperties => {
    const words = text.split(/[\s\n]+/).filter((word) => word.length > 0);
    const longestWord = Math.max(...words.map((word) => word.length), 0);
    const totalLength = text.length;
    const lineCount = text.split("\n").length;
    const longWordCount = words.filter((word) => word.length >= 9).length;

    // Calculate complexity score
    const hasExtremeWord = longestWord > 16;
    const hasVeryLongWord = longestWord >= 13;
    const hasLongWord = longestWord > 10;
    const hasManyLines = lineCount > 3;
    const isLongText = totalLength > 40;

    let sizing;
    if (downloadMode) {
        // Download uses rigid sizing matching previous minimum bounds to guarantee export stability
        sizing = isMobile
            ? {
                  veryLong: "0.625rem",
                  long: "0.625rem",
                  medium: "0.625rem",
                  short: "0.75rem",
                  veryShort: "0.875rem",
                  default: "0.625rem",
              }
            : {
                  veryLong: "0.6875rem",
                  long: "0.6875rem",
                  medium: "0.75rem",
                  short: "0.875rem",
                  veryShort: "1rem",
                  default: "0.75rem",
              };
    } else {
        // Editor/Preview shrinks accurately using cqw (container width queries) of the cell itself
        sizing = isMobile
            ? {
                  veryLong: "clamp(0.35rem, 10cqw, 0.75rem)",
                  long: "clamp(0.35rem, 11cqw, 0.8125rem)",
                  medium: "clamp(0.4rem, 13cqw, 0.8125rem)",
                  short: "clamp(0.5rem, 15cqw, 0.875rem)",
                  veryShort: "clamp(0.6rem, 18cqw, 1rem)",
                  default: "clamp(0.4rem, 13cqw, 0.75rem)",
              }
            : {
                  veryLong: "clamp(0.35rem, 11cqw, 0.8125rem)",
                  long: "clamp(0.35rem, 11cqw, 0.8125rem)",
                  medium: "clamp(0.45rem, 13cqw, 0.85rem)",
                  short: "clamp(0.5rem, 15cqw, 1rem)",
                  veryShort: "clamp(0.6rem, 18cqw, 1.125rem)",
                  default: "clamp(0.45rem, 13cqw, 0.875rem)",
              };
    }

    // Very long words or lots of content
    if (hasExtremeWord || (lineCount > 4 && totalLength > 50)) {
        return { fontSize: sizing.veryLong };
    }

    // Long words or many lines
    if (
        hasVeryLongWord ||
        hasManyLines ||
        (hasLongWord && totalLength > 22) ||
        longWordCount >= 2
    ) {
        return { fontSize: sizing.long };
    }

    // Medium length with multiple lines
    if (isLongText || lineCount > 2 || totalLength > 28) {
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
    const exportRef = useRef<HTMLDivElement>(null);

    const {
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

        setCurrentDay,
        setIsEditMode,
        setEditingIndex,
        setShowDay,
        setShowFullBoardAlert,
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
    } = useBingoGame();

    return (
        <div className="flex md:flex-row flex-col gap-6 justify-center items-center">
            <BingoFullBoardAlert
                open={showFullBoardAlert}
                onOpenChange={setShowFullBoardAlert}
            />

            <div
                className="w-full aspect-square shrink-0"
                style={{
                    maxWidth:
                        "clamp(400px, min(calc(100vw - 2rem), calc(100vh - 16rem)), 600px)",
                }}
            >
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

                <div className="flex flex-col gap-2">
                    <BingoDaySelector
                        currentDay={currentDay}
                        onDayChange={setCurrentDay}
                        disabled={isInPreviewMode}
                    />
                    <BingoModeControls
                        isEditMode={isEditMode}
                        onModeChange={setIsEditMode}
                        disabled={isInPreviewMode}
                    />
                </div>

                <div className="h-px bg-border my-1" />

                <div className="flex md:flex-col flex-row gap-2 flex-wrap">
                    <BingoPreviewModeControls
                        previewMode={previewMode}
                        onRandomize={handleRandomizeClick}
                        onPreset={handlePresetClick}
                        onReroll={
                            previewMode === "preset"
                                ? handlePresetReroll
                                : handleRandomizeReroll
                        }
                        onAccept={
                            previewMode === "preset"
                                ? handlePresetAccept
                                : handleRandomizeAccept
                        }
                        onCancel={
                            previewMode === "preset"
                                ? handlePresetCancel
                                : handleRandomizeCancel
                        }
                        isBoardEmpty={isBoardEmpty}
                    />
                </div>

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
                    <BingoPreviewDialog
                        board={board}
                        marked={marked}
                        currentDay={currentDay}
                        showDay={showDay}
                        winningIndices={winningIndices}
                        onShowDayChange={setShowDay}
                        onDownload={() => downloadBingo(exportRef)}
                        disabled={isInPreviewMode}
                    />

                    <Button
                        size="sm"
                        onClick={() => downloadBingo(exportRef)}
                        disabled={isInPreviewMode}
                    >
                        <Download className="size-4 mr-2" />
                        {t("download")}
                    </Button>

                    <BingoResetDialog
                        onReset={handleReset}
                        disabled={isInPreviewMode}
                    />
                </div>
            </div>

            {/* Mobile controls layout */}
            <div className="flex flex-col gap-2 md:hidden pb-4">
                <span className="text-center font-semibold underline underline-offset-2">
                    {t("utilLabel")}
                </span>

                <div className="flex gap-2 items-center">
                    <BingoDaySelector
                        currentDay={currentDay}
                        onDayChange={setCurrentDay}
                        disabled={isInPreviewMode}
                    />
                </div>

                <div className="flex items-center justify-center gap-2">
                    <BingoModeControls
                        isEditMode={isEditMode}
                        onModeChange={setIsEditMode}
                        disabled={isInPreviewMode}
                    />

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
                    <BingoPreviewModeControls
                        previewMode={previewMode}
                        onRandomize={handleRandomizeClick}
                        onPreset={handlePresetClick}
                        onReroll={
                            previewMode === "preset"
                                ? handlePresetReroll
                                : handleRandomizeReroll
                        }
                        onAccept={
                            previewMode === "preset"
                                ? handlePresetAccept
                                : handleRandomizeAccept
                        }
                        onCancel={
                            previewMode === "preset"
                                ? handlePresetCancel
                                : handleRandomizeCancel
                        }
                        isBoardEmpty={isBoardEmpty}
                        compact
                    />
                </div>

                <div className="h-px bg-border my-1" />

                <div className="flex md:flex-col flex-row gap-2 flex-wrap mx-auto">
                    <BingoPreviewDialog
                        board={board}
                        marked={marked}
                        currentDay={currentDay}
                        showDay={showDay}
                        winningIndices={winningIndices}
                        onShowDayChange={setShowDay}
                        onDownload={() => downloadBingo(exportRef)}
                        disabled={isInPreviewMode}
                    />

                    <Button
                        size="sm"
                        onClick={() => downloadBingo(exportRef)}
                        disabled={isInPreviewMode}
                    >
                        <Download className="size-4 mr-2" />
                        {t("download")}
                    </Button>

                    <BingoResetDialog
                        onReset={handleReset}
                        disabled={isInPreviewMode}
                    />
                </div>
            </div>

            {/* Hidden export - always full size for download */}
            <div className="absolute -left-[9999px] pointer-events-none">
                <div ref={exportRef}>
                    <BingoExport
                        board={board}
                        marked={marked}
                        downloadMode
                        winningIndices={winningIndices}
                        currentDay={currentDay}
                        showDay={showDay}
                    />
                </div>
            </div>
        </div>
    );
};

export default BingoGame;
