import { GalleryItem } from "@/components/view/lightbox/types";
import { getBlurDataURL } from "@/lib/utils";
import Image from "next/image";
import ReactPlayer from "react-player";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectCreative } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-creative";
import { isMobile } from "react-device-detect";

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
        console.log(translate);

        if (swiper.isEnd && translate < maxTranslate - 50) {
            onNext?.();
        } else if (swiper.isBeginning && translate > minTranslate + 50) {
            onPrev?.();
        }
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
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                <motion.div
                    className="w-full h-full flex items-center justify-center"
                    drag={isMobile ? "x" : undefined}
                    dragConstraints={
                        isMobile ? { left: 0, right: 0 } : undefined
                    }
                    dragElastic={isMobile ? 0.2 : undefined}
                    onDragEnd={
                        isMobile
                            ? (_, info) => {
                                  const offset = info.offset.x;
                                  if (offset < -50) onNext?.();
                                  else if (offset > 50) onPrev?.();
                              }
                            : undefined
                    }
                    animate={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {renderMediaItem(currentItem)}
                </motion.div>
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
