import { getTextStyle } from "@/components/view/minigames/bingo/BingoGame";
import BingoShatterCell from "@/components/view/minigames/bingo/BingoShatterCell";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { BINGO_MARKER_IMAGE_MAP } from "@/components/view/minigames/bingo/BingoMarkerSelector";
import { useSettingStore } from "@/store/settingStore";
import { BingoWinStyle } from "@/components/view/minigames/bingo/BingoWinSelector";
import BingoWinLines from "@/components/view/minigames/bingo/BingoWinLines";
import useIsMobileViewport from "@/hooks/useIsMobileViewport";
import { getBlurDataURL } from "@/lib/utils";

interface BingoExportProps {
    board: string[];
    marked: boolean[];
    downloadMode?: boolean;
    winningIndices?: Set<number>;
    currentDay?: string;
    showDay?: boolean;
}

const BingoExport = ({
    board,
    marked,
    downloadMode,
    winningIndices,
    currentDay = "1",
    showDay = true,
}: BingoExportProps) => {
    const t = useTranslations("common");
    const { bingoMarkerStyle, bingoWinStyle } = useSettingStore();
    const isMobile = useIsMobileViewport();

    const cellContent = (index: number) => {
        const text = board[index];
        const isMarked = marked[index];
        const isWinningCell = winningIndices?.has(index) ?? false;

        return (
            <div
                key={"cell-" + index}
                className={cn(
                    "flex flex-col items-center justify-center relative",
                    downloadMode ? "size-24" : "w-full aspect-square",
                    index % 2 === 0
                        ? "bg-white text-[#444444]"
                        : "bg-[#615952] text-white",
                )}
                style={{
                    containerType: "size",
                }}
            >
                {isWinningCell && bingoWinStyle === "outline" && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            border: "3px solid #e79818",
                            zIndex: 10,
                            pointerEvents: "none",
                        }}
                    />
                )}
                <Image
                    alt=""
                    src={"images-opt/bingo_outline-opt.webp"}
                    fill
                    className={cn(
                        "p-0.75 absolute inset-0 pointer-events-none",
                        {
                            "opacity-40": index % 2 !== 0,
                        },
                    )}
                    style={{ zIndex: 5 }}
                />
                {isMarked &&
                    bingoMarkerStyle !== "ring" &&
                    bingoMarkerStyle !== "none" && (
                        <Image
                            src={BINGO_MARKER_IMAGE_MAP[bingoMarkerStyle]}
                            fill
                            alt=""
                            className={cn(
                                "absolute p-2 inset-0 pointer-events-none opacity-30",
                                bingoMarkerStyle !== "emblem" && "opacity-40",
                            )}
                            style={{ zIndex: 0 }}
                        />
                    )}
                {isMarked && bingoMarkerStyle === "ring" && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div
                            className={cn(
                                "w-[90%] h-[90%] rounded-full border-[6px] md:border-8 border-red-500 opacity-80",
                            )}
                            style={{ zIndex: 0 }}
                        />
                    </div>
                )}
                <div
                    className={cn(
                        "size-full flex flex-col justify-center text-center px-2 leading-tight font-bold",
                        "whitespace-pre-wrap break-words relative",
                    )}
                    style={getTextStyle(text, isMobile, downloadMode)}
                >
                    {text}
                </div>
            </div>
        );
    };

    const WIN_RENDERERS: Record<
        BingoWinStyle,
        (args: {
            isWinningCell: boolean;
            cell: React.ReactNode;
            cellIndex: number;
        }) => React.ReactNode
    > = {
        crack: ({ isWinningCell, cell, cellIndex }) => (
            <BingoShatterCell
                key={cellIndex}
                cellIndex={cellIndex}
                shattered={isWinningCell}
            >
                {cell}
            </BingoShatterCell>
        ),
        outline: ({ cell }) => cell,
        line: ({ cell }) => cell,
        none: ({ cell }) => cell,
    };

    const cellSizeForLinesCalculation = isMobile
        ? downloadMode
            ? 83.5
            : 68.5
        : 96;

    return (
        <div className="relative flex flex-col items-center justify-center py-4 px-2">
            {/* bg */}
            <Image
                src="images-opt/bingo-bg-opt.webp"
                alt="Background"
                placeholder={
                    getBlurDataURL("images-opt/bingo-bg-opt.webp")
                        ? "blur"
                        : "empty"
                }
                blurDataURL={getBlurDataURL("images-opt/bingo-bg-opt.webp")}
                fill
                className="absolute -z-10 opacity-90 inset-0 object-cover rounded-none pointer-events-none"
            />
            <Image
                src="images-opt/bingo-logo-opt.webp"
                alt="Background"
                height={40}
                width={100}
                className={cn(
                    "md:h-45 h-35 w-auto object-cover mx-auto pointer-events-none",
                    {
                        "h-45": downloadMode,
                    },
                )}
            />
            <div className="relative">
                {showDay && (
                    <div className="bg-[#615952] px-2 absolute -top-5.5 left-0 font-[Chesterfield] text-white text-lg rounded-t-md border-white border-2 border-b-0 flex items-center justify-center h-fit">
                        <span>{t("day", { val: currentDay })}</span>
                    </div>
                )}
                <div className="relative">
                    <div
                        className="grid grid-cols-5 gap-1 mt-2"
                        style={
                            !downloadMode
                                ? {
                                      width: "clamp(260px, min(calc(100vw - 3rem), calc(100vh - 18rem)), 600px)",
                                  }
                                : undefined
                        }
                    >
                        {board.map((_, index) => {
                            const isWinningCell =
                                winningIndices?.has(index) ?? false;
                            const renderedCell = WIN_RENDERERS[bingoWinStyle]({
                                isWinningCell,
                                cell: cellContent(index),
                                cellIndex: index,
                            });
                            return renderedCell;
                        })}
                    </div>

                    {bingoWinStyle === "line" && (
                        <>
                            <BingoWinLines
                                marked={marked}
                                cellSize={cellSizeForLinesCalculation}
                                gap={4}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BingoExport;
