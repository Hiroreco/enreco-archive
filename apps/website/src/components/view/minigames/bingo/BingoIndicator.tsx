import { usePersistedViewStore } from "@/store/persistedViewStore";
import { useViewStore } from "@/store/viewStore";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import Image from "next/image";

interface BingoIndicatorProps {
    className?: string;
}

const BingoIndicator = ({ className }: BingoIndicatorProps) => {
    const openBingoModal = useViewStore((state) => state.openBingoModal);
    const setHasDismissedBingoIndicator = usePersistedViewStore(
        (state) => state.setHasDismissedBingoIndicator,
    );

    const handleClick = () => {
        setHasDismissedBingoIndicator(true);
        openBingoModal();
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "cursor-pointer opacity-80",
                "hover:opacity-100 transition-all",
                className,
            )}
            aria-label="Open Bingo"
        >
            <Image
                src="/images-opt/bingo-logo-opt.webp"
                alt="Bingo"
                height={80}
                width={80}
                className="h-full w-auto"
            />
        </button>
    );
};

export default BingoIndicator;
