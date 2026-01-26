import { getFontSizeClass } from "@/components/view/minigames/BingoGame";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import Image from "next/image";

interface BingoExportProps {
    board: string[];
    marked: boolean[];
}

const BingoExport = ({ board, marked }: BingoExportProps) => {
    return (
        <div className="relative flex flex-col items-center justify-center gap-4 p-8">
            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 text-white text-center">
                <h2 className="text-2xl font-bold text-shadow-strong">
                    ENigmatic Recollection
                </h2>
                <h1 className="text-6xl font-bold my-2 text-shadow-strong">
                    BINGO
                </h1>
                <h3 className="text-xl font-semibold text-shadow-strong">
                    Chapter 3: Broken Bonds
                </h3>
            </div>

            <div className="relative z-10 grid grid-cols-5 gap-1 bg-white p-3">
                {board.map((text, index) => {
                    const isMarked = marked[index];
                    const isCenterSquare = index === 12;

                    return (
                        <div
                            key={index}
                            className={cn(
                                "size-24",
                                "flex flex-col shadow-md items-center justify-center relative",
                            )}
                        >
                            {isCenterSquare ? (
                                <Image
                                    src="/images-opt/logo-1-opt.webp"
                                    alt="Free Square"
                                    fill
                                    className="absolute -z-10 opacity-50"
                                />
                            ) : null}
                            <span
                                className={cn(
                                    "text-center px-2 break-words whitespace-pre-line leading-tight",
                                    getFontSizeClass(text),
                                )}
                            >
                                {text}
                            </span>
                            {isMarked && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div
                                        className={cn(
                                            "w-[90%] h-[90%] rounded-full border-8 border-red-500 opacity-80 -z-10",
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
