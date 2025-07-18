import { useEffect } from "react";
import { GalleryItem } from "./types";

export const useKeyboardNavigation = (
    isOpen: boolean,
    handlePrev: () => void,
    handleNext: () => void,
    handleOpenChange: (open: boolean) => void,
    items: GalleryItem[],
    currentItemIndex: number,
) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                handlePrev();
            } else if (e.key === "ArrowRight") {
                handleNext();
            } else if (e.key === "Escape") {
                handleOpenChange(false);
            } else if (e.key === " " || e.key === "k") {
                const currentItem = items[currentItemIndex];
                if (currentItem?.type === "video") {
                    e.preventDefault();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [
        isOpen,
        handlePrev,
        handleNext,
        handleOpenChange,
        items,
        currentItemIndex,
    ]);
};
