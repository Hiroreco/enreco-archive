import { getBlurDataURL } from "@/lib/utils";
import { useSettingStore } from "@/store/settingStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { memo, useState, useRef, useEffect, useCallback } from "react";

interface GalleryImage {
    src: string;
    alt: string;
}

interface ViewLightboxProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    containerClassName?: string;
    priority?: boolean;
    galleryImages?: GalleryImage[];
    galleryIndex?: number;
}

const ViewLightbox = ({
    src,
    alt,
    width = 500,
    height = 500,
    className,
    containerClassName,
    priority = false,
    galleryImages,
    galleryIndex = 0,
}: ViewLightboxProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(galleryIndex);
    const backdropFilter = useSettingStore((state) => state.backdropFilter);
    const carouselRef = useRef<HTMLDivElement>(null);
    const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

    const images = galleryImages || [{ src, alt }];

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setIsOpen(open);
            if (open) {
                // Reset to initial index when opening
                setCurrentImageIndex(galleryIndex);
            }
        },
        [galleryIndex],
    );

    const handleNext = useCallback(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const handlePrev = useCallback(() => {
        setCurrentImageIndex(
            (prev) => (prev - 1 + images.length) % images.length,
        );
    }, [images.length]);

    const handleThumbnailClick = (index: number) => {
        setCurrentImageIndex(index);
    };

    // Center the selected thumbnail when it changes
    useEffect(() => {
        if (
            isOpen &&
            thumbnailRefs.current[currentImageIndex] &&
            carouselRef.current
        ) {
            const thumbnail = thumbnailRefs.current[currentImageIndex];
            const carousel = carouselRef.current;

            // Calculate the scroll position to center the thumbnail
            const thumbnailLeft = thumbnail!.offsetLeft;
            const thumbnailWidth = thumbnail!.offsetWidth;
            const carouselWidth = carousel.offsetWidth;

            const scrollPosition =
                thumbnailLeft - carouselWidth / 2 + thumbnailWidth / 2;

            carousel.scrollTo({
                left: scrollPosition,
                behavior: "smooth",
            });
        }
    }, [currentImageIndex, isOpen]);

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                handlePrev();
            } else if (e.key === "ArrowRight") {
                handleNext();
            } else if (e.key === "Escape") {
                handleOpenChange(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, handlePrev, handleNext, handleOpenChange]);

    // Initialize thumbnail refs array
    useEffect(() => {
        thumbnailRefs.current = thumbnailRefs.current.slice(0, images.length);
    }, [images.length]);

    const currentImage = images[currentImageIndex];

    return (
        <div className={containerClassName}>
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={cn(
                    "cursor-pointer transition-opacity hover:opacity-90",
                    className,
                )}
                placeholder={getBlurDataURL(src) ? "blur" : "empty"}
                blurDataURL={getBlurDataURL(src)}
                priority={priority}
                onClick={() => handleOpenChange(true)}
            />

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent
                    backdropFilter={backdropFilter}
                    className="max-w-fit p-0 gap-4 border-0 bg-none flex flex-col items-center shadow-none"
                    showXButton={false}
                    style={{
                        backgroundImage: "none",
                        backgroundColor: "transparent",
                    }}
                >
                    <DialogTitle className="sr-only">
                        <VisuallyHidden>{currentImage.alt}</VisuallyHidden>
                    </DialogTitle>

                    <DialogDescription className="sr-only">
                        <VisuallyHidden>{currentImage.alt}</VisuallyHidden>
                    </DialogDescription>

                    <button
                        onClick={() => handleOpenChange(false)}
                        className="absolute -top-7 size-6 right-0 text-white hover:text-gray-300 transition-colors"
                        aria-label="Close lightbox"
                    >
                        <X className="size-full" />
                    </button>

                    <div className="relative lg:w-[60vw] md:w-[80vw] w-[95vw] h-[60vh] flex items-center justify-center">
                        {images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                                    onClick={handlePrev}
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                                    onClick={handleNext}
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}
                        <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
                            <Image
                                src={currentImage.src}
                                alt={currentImage.alt}
                                className="object-contain max-h-[60vh] max-w-full"
                                placeholder={
                                    getBlurDataURL(currentImage.src)
                                        ? "blur"
                                        : "empty"
                                }
                                blurDataURL={getBlurDataURL(currentImage.src)}
                                width={1200}
                                height={1200}
                                sizes="(max-width: 768px) 95vw, (max-width: 1024px) 80vw, 60vw"
                                style={{ width: "auto", height: "auto" }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 max-w-full">
                        <span className="text-white text-center font-semibold text-sm md:text-lg">
                            {currentImage.alt}
                        </span>

                        {images.length > 1 && (
                            <div
                                ref={carouselRef}
                                className="flex justify-start gap-2 overflow-x-auto py-2 px-4 max-w-full lg:max-w-[60vw] md:max-w-[80vw] scroll-smooth"
                                style={{
                                    scrollbarWidth: "thin",
                                    scrollbarColor:
                                        "rgba(255,255,255,0.3) transparent",
                                }}
                            >
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        ref={(el) => {
                                            thumbnailRefs.current[index] = el;
                                        }}
                                        className={cn(
                                            "relative h-16 w-28 shrink-0 cursor-pointer transition-all duration-200 border-2 rounded-md overflow-hidden",
                                            index === currentImageIndex
                                                ? "border-white opacity-100 scale-105"
                                                : "border-gray-500/50 opacity-70 hover:opacity-90",
                                        )}
                                        onClick={() =>
                                            handleThumbnailClick(index)
                                        }
                                    >
                                        <Image
                                            src={image.src}
                                            alt={`Thumbnail ${index + 1}`}
                                            fill
                                            sizes="112px"
                                            className="object-cover"
                                            placeholder={
                                                getBlurDataURL(image.src)
                                                    ? "blur"
                                                    : "empty"
                                            }
                                            blurDataURL={getBlurDataURL(
                                                image.src,
                                            )}
                                        />
                                    </div>
                                ))}

                                {/* Simple image counter */}
                                <div className="absolute bottom-2 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                    {currentImageIndex + 1} / {images.length}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default memo(ViewLightbox);
