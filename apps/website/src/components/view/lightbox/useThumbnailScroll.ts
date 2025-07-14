import { useEffect, RefObject } from "react";

export const useThumbnailScroll = (
    carouselRef: RefObject<HTMLDivElement | null>,
    thumbnailRefs: RefObject<(HTMLDivElement | null)[]>,
    currentItemIndex: number,
    isOpen: boolean,
) => {
    useEffect(() => {
        if (
            isOpen &&
            thumbnailRefs.current?.[currentItemIndex] &&
            carouselRef.current
        ) {
            const thumbnail = thumbnailRefs.current[currentItemIndex];
            const carousel = carouselRef.current;

            if (thumbnail && carousel) {
                const thumbnailLeft = thumbnail.offsetLeft;
                const thumbnailWidth = thumbnail.offsetWidth;
                const carouselWidth = carousel.offsetWidth;

                const scrollPosition =
                    thumbnailLeft - carouselWidth / 2 + thumbnailWidth / 2;

                carousel.scrollTo({
                    left: scrollPosition,
                    behavior: "smooth",
                });
            }
        }
    }, [currentItemIndex, isOpen, carouselRef, thumbnailRefs]);
};
