import { getTextStyle } from "@/components/view/minigames/bingo/BingoGame";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useTranslations } from "next-intl";
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
    const t = useTranslations("common");
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
                className="h-45 w-auto object-cover"
            />
            <div className="relative">
                {showDay && (
                    <span className="absolute -top-8 right-0 font-[Chesterfield] text-white text-3xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                        {t("day", { val: currentDay })}
                    </span>
                )}
                <div className="grid grid-cols-5 gap-1 mt-2">
                    {board.map((text, index) => {
                        const isMarked = marked[index];
                        const isCenter = index === 12;

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "flex flex-col items-center justify-center relative but when its light mode  font-[Chesterfield]",
                                    downloadMode
                                        ? "size-22"
                                        : "size-17.5 md:size-22",
                                    index % 2 === 0
                                        ? "bg-white text-[#444444]"
                                        : "bg-[#669feb] text-white",
                                )}
                                style={{
                                    containerType: "size",
                                    colorScheme: "light",
                                }}
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
        </div>
    );
};

export default BingoExport;
