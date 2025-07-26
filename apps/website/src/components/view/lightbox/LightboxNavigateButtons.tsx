import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationButtonsProps {
    onPrev: () => void;
    onNext: () => void;
}

export const LightboxNavigateButtons = ({
    onPrev,
    onNext,
}: NavigationButtonsProps) => {
    return (
        <>
            <button
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                onClick={onPrev}
                aria-label="Previous item"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <button
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                onClick={onNext}
                aria-label="Next item"
            >
                <ChevronRight className="h-6 w-6" />
            </button>
        </>
    );
};
