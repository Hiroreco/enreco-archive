import { useCallback, useEffect, useRef } from "react";

interface UseScrollRestorationOptions {
    smooth?: boolean;
    shouldRestore?: boolean;
}

export function useScrollRestoration({
    smooth = true,
    shouldRestore = false,
}: UseScrollRestorationOptions) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const savedScrollPosition = useRef<number>(0);

    // Save scroll position
    const saveScrollPosition = useCallback(() => {
        if (scrollContainerRef.current) {
            savedScrollPosition.current = scrollContainerRef.current.scrollTop;
        }
    }, []);

    // Manual restore function
    const restoreScrollPosition = useCallback(() => {
        if (scrollContainerRef.current) {
            const scrollTo = savedScrollPosition.current;

            if (smooth) {
                scrollContainerRef.current.scrollTo({
                    top: scrollTo,
                    behavior: "smooth",
                });
            } else {
                scrollContainerRef.current.scrollTop = scrollTo;
            }
        }
    }, [smooth]);

    useEffect(() => {
        if (shouldRestore) {
            restoreScrollPosition();
        }
    }, [shouldRestore, smooth, restoreScrollPosition]);

    return {
        scrollContainerRef,
        saveScrollPosition,
        restoreScrollPosition,
    };
}
