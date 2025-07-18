import { GalleryItem } from "@/components/view/lightbox/types";
import { getBlurDataURL } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import type { Swiper as SwiperType } from "swiper";
import { EffectCreative, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import { isMobile } from "react-device-detect";
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface LightboxContentProps {
    currentItem: GalleryItem;
    priority: boolean;
    items?: GalleryItem[];
    currentItemIndex?: number;
    onSlideChange?: (index: number) => void;
    onNext?: () => void;
    onPrev?: () => void;
}

export const LightboxContent = ({
    currentItem,
    priority,
    items = [currentItem],
    currentItemIndex = 0,
    onSlideChange,
    onNext,
    onPrev,
}: LightboxContentProps) => {
    const swiperRef = useRef<SwiperType | null>(null);
    const [touchStartX, setTouchStartX] = useState(0);

    // Sync external index
    useEffect(() => {
        if (
            swiperRef.current &&
            swiperRef.current.activeIndex !== currentItemIndex
        ) {
            swiperRef.current.slideTo(currentItemIndex);
        }
    }, [currentItemIndex]);

    const handleSlideChange = (swiper: SwiperType) => {
        onSlideChange?.(swiper.activeIndex);
    };

    const handleSwiperTouchEnd = (swiper: SwiperType) => {
        const translate = swiper.translate;
        const maxTranslate = swiper.maxTranslate();
        const minTranslate = swiper.minTranslate();

        if (swiper.isEnd && translate < maxTranslate - 50) {
            onNext?.();
        } else if (swiper.isBeginning && translate > minTranslate + 50) {
            onPrev?.();
        }
    };

    const handleSingleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleSingleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        const endX = e.changedTouches[0].clientX;
        const delta = endX - touchStartX;
        if (delta < -50) onNext?.();
        else if (delta > 50) onPrev?.();
    };

    const renderMediaItem = (item: GalleryItem) => {
        if (item.type === "image") {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <Image
                        src={item.src}
                        alt={item.alt}
                        className="object-contain max-w-full max-h-full"
                        placeholder={
                            getBlurDataURL(item.src) ? "blur" : "empty"
                        }
                        priority={priority}
                        blurDataURL={getBlurDataURL(item.src)}
                        width={1200}
                        height={1200}
                        sizes="(max-width: 768px) 95vw, (max-width: 1024px) 80vw, 60vw"
                        style={{
                            width: "auto",
                            height: "auto",
                            maxWidth: "100%",
                            maxHeight: "100%",
                        }}
                    />
                </div>
            );
        }

        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <ReactPlayer
                    src={item.src}
                    controls
                    width="100%"
                    height="100%"
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                    volume={0.7}
                />
            </div>
        );
    };

    const isSingle = items.length === 1;

    if (isSingle) {
        return (
            <div
                className="w-full h-full"
                onTouchStart={handleSingleTouchStart}
                onTouchEnd={handleSingleTouchEnd}
            >
                {renderMediaItem(currentItem)}
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <Swiper
                modules={[Navigation, Pagination, EffectCreative]}
                spaceBetween={0}
                slidesPerView={1}
                centeredSlides
                initialSlide={currentItemIndex}
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                }}
                onSlideChange={handleSlideChange}
                onTouchEnd={handleSwiperTouchEnd}
                effect="creative"
                creativeEffect={{
                    prev: { translate: ["-100%", 0, 0], opacity: 0 },
                    next: { translate: ["100%", 0, 0], opacity: 0 },
                }}
                speed={300}
                allowTouchMove={isMobile}
                touchRatio={1}
                threshold={10}
                longSwipes={false}
                shortSwipes={true}
                touchStartPreventDefault={false}
                resistanceRatio={0.85}
                centeredSlidesBounds
                className="flex items-center justify-center w-full h-full"
                style={
                    {
                        "--swiper-theme-color": "#ffffff",
                    } as React.CSSProperties
                }
            >
                {items.map((item, index) => (
                    <SwiperSlide
                        key={`${item.src}-${index}`}
                        className="!flex !items-center !justify-center w-full h-full"
                    >
                        {renderMediaItem(item)}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};
