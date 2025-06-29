import { getBlurDataURL } from "@/lib/utils";
import { useSettingStore } from "@/store/settingStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
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
    authorSrc?: string;
    onNextEnd?: () => void;
    onPrevEnd?: () => void;
    isExternallyControlled?: boolean;
    externalIsOpen?: boolean;
    onExternalClose?: () => void;
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
    authorSrc,
    onNextEnd,
    onPrevEnd,
    isExternallyControlled = false,
    externalIsOpen = false,
    onExternalClose,
}: ViewLightboxProps) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(galleryIndex);
    const backdropFilter = useSettingStore((state) => state.backdropFilter);
    const carouselRef = useRef<HTMLDivElement>(null);
    const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

    const images = galleryImages || [{ src, alt }];

    // Use external control if provided, otherwise use internal
    const isOpen = isExternallyControlled ? externalIsOpen : internalIsOpen;

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (isExternallyControlled) {
                if (!open && onExternalClose) {
                    onExternalClose();
                }
            } else {
                setInternalIsOpen(open);
                if (open) {
                    // Reset to initial index when opening
                    setCurrentImageIndex(galleryIndex);
                }
            }
        },
        [isExternallyControlled, onExternalClose, galleryIndex],
    );

    const handleNext = useCallback(() => {
        if (currentImageIndex < images.length - 1) {
            setCurrentImageIndex((prev) => prev + 1);
        } else if (onNextEnd) {
            // If at the end of gallery and callback exists, call it
            onNextEnd();
        } else {
            setCurrentImageIndex(0);
        }
    }, [images.length, currentImageIndex, onNextEnd]);

    const handlePrev = useCallback(() => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex((prev) => prev - 1);
        } else if (onPrevEnd) {
            // If at the beginning of gallery and callback exists, call it
            onPrevEnd();
        } else {
            setCurrentImageIndex(images.length - 1);
        }
    }, [currentImageIndex, onPrevEnd, images.length]);

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

    // Handle external control opening
    useEffect(() => {
        if (containerClassName === "hidden" && !isExternallyControlled) {
            // If container is hidden, this means it's being controlled externally (legacy support)
            setInternalIsOpen(true);
        }
    }, [containerClassName, isExternallyControlled]);

    // Update current image index when gallery changes (for entry switching)
    useEffect(() => {
        if (galleryImages && galleryImages.length > 0) {
            setCurrentImageIndex(0);
        }
    }, [galleryImages]);

    // Ensure currentImageIndex is always valid
    useEffect(() => {
        if (currentImageIndex >= images.length) {
            setCurrentImageIndex(0);
        }
    }, [currentImageIndex, images.length]);

    // Update current image index when galleryIndex changes
    useEffect(() => {
        if (!isExternallyControlled) {
            setCurrentImageIndex(galleryIndex);
        }
    }, [galleryIndex, isExternallyControlled]);

    // Safe currentImage access with fallback
    const currentImage = images[currentImageIndex] || images[0] || { src, alt };

    return (
        <div className={containerClassName}>
            {!isExternallyControlled && (
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
            )}

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent
                    backdropFilter={backdropFilter}
                    className="max-w-fit bg-blur p-2 gap-4 flex flex-col items-center"
                    showXButton={false}
                    style={{
                        backgroundImage: "none",
                    }}
                >
                    <DialogTitle className="sr-only">
                        <VisuallyHidden>{currentImage.alt}</VisuallyHidden>
                    </DialogTitle>

                    <DialogDescription className="sr-only">
                        <VisuallyHidden>{currentImage.alt}</VisuallyHidden>
                    </DialogDescription>

                    {/* Blurred background image for fancy effect*/}
                    <div className="absolute inset-0 -z-10">
                        <Image
                            src={currentImage.src}
                            alt=""
                            fill
                            className="object-cover blur-xl opacity-20"
                            placeholder={
                                getBlurDataURL(currentImage.src)
                                    ? "blur"
                                    : "empty"
                            }
                            blurDataURL={getBlurDataURL(currentImage.src)}
                            priority={false}
                        />
                        {/* Dark overlay to ensure content readability */}
                        <div className="absolute inset-0 bg-black/30" />
                    </div>

                    <button
                        onClick={() => handleOpenChange(false)}
                        className="absolute -top-7 size-6 right-0 text-white hover:text-gray-300 transition-colors z-10"
                        aria-label="Close lightbox"
                    >
                        <X className="size-full" />
                    </button>

                    <div className="relative lg:w-[60vw] md:w-[80vw] w-[90vw] h-[60vh] flex items-center justify-center">
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
                        <div className="relative w-full h-full flex items-center justify-center">
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
                        <div className="flex justify-center items-center gap-1">
                            <Separator className="md:w-[200px] w-[30px] opacity-50" />
                            <span className="text-white flex items-center gap-1 text-center font-semibold text-sm md:text-lg">
                                {currentImage.alt}
                                {authorSrc && (
                                    <a
                                        href={authorSrc}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="size-4 stroke-white" />
                                    </a>
                                )}
                            </span>
                            <Separator className="md:w-[200px] w-[30px] opacity-50" />
                        </div>
                        <div
                            ref={carouselRef}
                            className="flex mx-auto justify-start gap-2 overflow-x-auto py-2 px-4 max-w-full lg:max-w-[60vw] md:max-w-[80vw] scroll-smooth"
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
                                    onClick={() => handleThumbnailClick(index)}
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
                                        blurDataURL={getBlurDataURL(image.src)}
                                    />
                                </div>
                            ))}

                            {/* Simple image counter */}
                            <div className="absolute bottom-2 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default memo(ViewLightbox);
