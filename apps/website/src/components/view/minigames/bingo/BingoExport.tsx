import { getTextStyle } from "@/components/view/minigames/bingo/BingoGame";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import Image from "next/image";

interface BingoExportProps {
    board: string[];
    marked: boolean[];
    downloadMode?: boolean;
    currentDay?: string;
    showDay?: boolean;
}

const BingoExport = ({
    board,
    marked,
    downloadMode,
    currentDay = "1",
    showDay = true,
}: BingoExportProps) => {
    return (
        <div className="relative flex flex-col items-center justify-center gap-4 py-8 px-2">
            {/* bg */}
            <Image
                src="images-opt/bingo-bg-opt.webp"
                alt="Background"
                fill
                className="absolute -z-10 opacity-80 inset-0 object-cover rounded-none"
            />
            <div className="relative z-10 text-white text-center">
                <h2 className="text-2xl font-bold text-shadow-strong">
                    ENigmatic Recollection
                </h2>
                <h1 className="text-6xl font-bold my-2 text-shadow-strong tracking-wide">
                    BINGO
                </h1>
                <h3 className="text-xl font-semibold text-shadow-strong">
                    Chapter 3: Broken Bonds{showDay && ` (Day ${currentDay})`}
                </h3>
            </div>

            <div className="relative z-10 grid grid-cols-5 gap-1">
                {board.map((text, index) => {
                    const isMarked = marked[index];
                    const isCenter = index === 12;

                    return (
                        <div
                            key={index}
                            className={cn(
                                "flex flex-col bg-white items-center justify-center relative",
                                downloadMode
                                    ? "size-22"
                                    : "size-17.5 md:size-22",
                            )}
                            style={{ containerType: "size" }}
                        >
                            {isCenter && (
                                <Image
                                    alt=""
                                    src="/images-opt/emblem-opt.webp"
                                    fill
                                    className="opacity-10"
                                />
                            )}
                            <div
                                className={cn(
                                    "size-full flex flex-col justify-center text-center px-1 leading-tight font-bold",
                                    "whitespace-pre-wrap break-words z-10",
                                )}
                                style={getTextStyle(text)}
                            >
                                {text}
                            </div>
                            {isMarked && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div
                                        className={cn(
                                            "size-[95%] rounded-full border-[#fb4172] opacity-70",
                                            downloadMode
                                                ? "border-12"
                                                : "border-8 md:border-12",
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BingoExport;
