import { getFontSizeClass } from "@/components/view/minigames/BingoGame";
import { cn } from "@enreco-archive/common-ui/lib/utils";

interface BingoExportProps {
    board: string[];
    marked: boolean[];
}

const BingoExport = ({ board, marked }: BingoExportProps) => {
    return (
        <div
            className="relative flex flex-col items-center gap-4 p-8 rounded-lg"
            style={{
                backgroundImage: "url('/images-opt/logo-1-opt.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "600px",
                height: "700px",
            }}
        >
            <div className="absolute inset-0 bg-black/40 rounded-lg" />

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

            <div className="relative z-10 grid grid-cols-5 gap-1 bg-white/90 p-3 rounded">
                {board.map((text, index) => {
                    const isMarked = marked[index];

                    return (
                        <div
                            key={index}
                            className={cn(
                                "w-24 h-24 border-2 border-gray-800",
                                "flex flex-col items-center justify-center relative",
                                {
                                    "bg-blue-500/60": isMarked,
                                    "bg-white": !isMarked,
                                },
                            )}
                        >
                            <span
                                className={cn(
                                    "text-center px-2 break-words whitespace-pre-line leading-tight",
                                    getFontSizeClass(text),
                                )}
                            >
                                {text}
                            </span>

                            {isMarked && (
                                <>
                                    <div className="absolute inset-0 bg-red-600 rotate-45 h-1 m-auto" />
                                    <div className="absolute inset-0 bg-red-600 -rotate-45 h-1 m-auto" />
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BingoExport;
