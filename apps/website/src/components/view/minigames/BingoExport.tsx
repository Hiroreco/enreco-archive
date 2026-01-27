import { getTextStyle } from "@/components/view/minigames/BingoGame";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import Image from "next/image";

interface BingoExportProps {
    board: string[];
    marked: boolean[];
}

const BingoExport = ({ board, marked }: BingoExportProps) => {
    return (
        <div className="relative flex flex-col items-center justify-center gap-4 py-8 px-2">
            {/* bg */}
            <Image
                src="/test.jpg"
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
                    Chapter 3: Broken Bonds
                </h3>
            </div>

            <div className="relative z-10 grid grid-cols-5 gap-1">
                {board.map((text, index) => {
                    const isMarked = marked[index];
                    const isCenterSquare = index === 12;

                    return (
                        <div
                            key={index}
                            className={cn(
                                "size-24 flex flex-col bg-white items-center justify-center relative",
                            )}
                            style={{
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.6)",
                                containerType: "size",
                            }}
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
                                    "text-center px-2 break-words whitespace-pre-line leading-tight font-bold",
                                )}
                                style={getTextStyle(text, "export")}
                            >
                                {text}
                            </span>
                            {isMarked && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div
                                        className={cn(
                                            "size-[95%] rounded-full border-12 border-[#fb4172] opacity-70",
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
