import { getTextStyle } from "@/components/view/minigames/bingo/BingoGame";
import BingoShatterCell from "@/components/view/minigames/bingo/BingoShatterCell";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { BINGO_MARKER_IMAGE_MAP } from "@/components/view/minigames/bingo/BingoMarkerSelector";
import { useSettingStore } from "@/store/settingStore";
import { BingoWinStyle } from "@/components/view/minigames/bingo/BingoWinSelector";
import BingoWinLines from "@/components/view/minigames/bingo/BingoWinLines";

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

    const cellContent = (index: number) => {
        const text = board[index];
        const isMarked = marked[index];
        const isWinningCell = winningIndices?.has(index) ?? false;

        return (
            <div
                key={"cell-" + index}
                className={cn(
                    "flex flex-col items-center justify-center relative font-[Chesterfield]",
                    downloadMode ? "size-24" : "size-17.5 md:size-24",
                    index % 2 === 0
                        ? "bg-white text-[#444444]"
                        : "bg-[#669feb] text-white",
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
                            border: "3px solid #fde047",
                            zIndex: 10,
                            pointerEvents: "none",
                        }}
                    />
                )}
                <Image
                    alt=""
                    src={
                        index % 2 === 0
                            ? "images-opt/bingo_outline-opt.webp"
                            : "images-opt/bingo_outline2-opt.webp"
                    }
                    fill
                    className="p-0.75 absolute inset-0"
                />
                {isMarked && (
                    <Image
                        src={BINGO_MARKER_IMAGE_MAP[bingoMarkerStyle]}
                        fill
                        alt=""
                        className={cn(
                            "absolute p-0.75 inset-0 pointer-events-none opacity-30",
                            bingoMarkerStyle !== "emblem" && "opacity-40",
                        )}
                        style={{ zIndex: 0 }}
                    />
                )}
                <div
                    className={cn(
                        "size-full flex flex-col justify-center text-center px-2 leading-tight font-bold",
                        "whitespace-pre-wrap break-words relative",
                    )}
                    style={getTextStyle(text)}
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
    };

    return (
        <div className="relative flex flex-col items-center justify-center py-4 px-2">
            {/* bg */}
            <Image
                src="images-opt/bingo-bg-opt.webp"
                alt="Background"
                fill
                className="absolute -z-10 opacity-80 inset-0 object-cover rounded-none"
            />
            <Image
                src="images-opt/bingo-logo-opt.webp"
                alt="Background"
                height={40}
                width={100}
                className="md:h-45 h-35 w-auto object-cover mx-auto"
            />
            <div className="relative">
                {showDay && (
                    <span className="bg-[#669feb] px-2 absolute -top-5 h-fit left-0 font-[Chesterfield] text-white text-lg rounded-t-md border-white border-1 border-b-0">
                        {t("day", { val: currentDay })}
                    </span>
                )}
                <div className="relative">
                    <div className="grid grid-cols-5 gap-1 mt-2">
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
                                cellSize={96}
                                gap={4}
                                className="hidden md:block"
                            />
                            <BingoWinLines
                                marked={marked}
                                cellSize={70}
                                gap={4}
                                className="block md:hidden"
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BingoExport;
