import { LightboxContent } from "@/components/view/lightbox/LightboxContent";
import { LightboxInfo } from "@/components/view/lightbox/LightboxInfo";
import { LightboxNavigateButtons } from "@/components/view/lightbox/LightboxNavigateButtons";
import { LightboxTrigger } from "@/components/view/lightbox/LightboxTrigger";
import { ThumbnailCarousel } from "@/components/view/lightbox/ThumbnailCarousel";
import { GalleryItem } from "@/components/view/lightbox/types";
import { useKeyboardNavigation } from "@/components/view/lightbox/useKeyboardNavigation";
import { useThumbnailScroll } from "@/components/view/lightbox/useThumbnailScroll";
import { getBlurDataURL } from "@/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import { useSettingStore } from "@/store/settingStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { MediaType } from "@enreco-archive/common/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

interface LightboxProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    type?: MediaType;
    className?: string;
    containerClassName?: string;
    priority?: boolean;
    galleryItems?: GalleryItem[];
    galleryIndex?: number;
    authorSrc?: string;
    onNextEnd?: () => void;
    onPrevEnd?: () => void;
    isExternallyControlled?: boolean;
    externalIsOpen?: boolean;
    alwaysShowNavigationArrows?: boolean;
    onExternalClose?: () => void;
    showFanartMeta?: boolean;
}

const Lightbox = ({
    src,
    alt,
    width = 500,
    height = 500,
    type = "image",
    className,
    containerClassName,
    priority = false,
    galleryItems,
    galleryIndex = 0,
    authorSrc,
    onNextEnd,
    onPrevEnd,
    alwaysShowNavigationArrows = false,
    isExternallyControlled = false,
    externalIsOpen = false,
    onExternalClose,
    showFanartMeta = false,
}: LightboxProps) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [currentItemIndex, setCurrentItemIndex] = useState(galleryIndex);
    const [currentGalleryIndex, setCurrentGalleryIndex] =
        useState(galleryIndex);

    const backdropFilter = useSettingStore((state) => state.backdropFilter);
    const carouselRef = useRef<HTMLDivElement>(null);
    const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);
    const playBGM = useAudioStore((state) => state.playBGM);
    const pauseBGM = useAudioStore((state) => state.pauseBGM);

    const items = useMemo(
        () => galleryItems || [{ src, alt, type, width, height }],
        [galleryItems, src, alt, type, width, height],
    );

    const isOpen = useMemo(
        () => (isExternallyControlled ? externalIsOpen : internalIsOpen),
        [isExternallyControlled, externalIsOpen, internalIsOpen],
    );

    const currentItem = useMemo(
        () =>
            items[currentItemIndex] ||
            items[0] || { src, alt, type, width, height },
        [items, currentItemIndex, src, alt, type, width, height],
    );

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (isExternallyControlled) {
                if (!open && onExternalClose) {
                    onExternalClose();
                }
            } else {
                setInternalIsOpen(open);
                if (open) {
                    setCurrentItemIndex(galleryIndex);
                    setCurrentGalleryIndex(galleryIndex);
                }
            }
        },
        [isExternallyControlled, onExternalClose, galleryIndex],
    );

    const handleThumbnailClick = useCallback((index: number) => {
        setCurrentGalleryIndex(index);
    }, []);

    useEffect(() => {
        setCurrentGalleryIndex(0);
    }, [galleryItems]);

    // Create gallery items array
    const galleryItemsArray = useMemo(() => {
        if (galleryItems) {
            return galleryItems;
        }
        return [{ src, alt, type, width, height }];
    }, [galleryItems, src, alt, type, width, height]);

    // Update current item to use gallery index
    const currentGalleryItem = useMemo(
        () => galleryItemsArray[currentGalleryIndex] || galleryItemsArray[0],
        [galleryItemsArray, currentGalleryIndex],
    );

    // Custom hooks for complex logic
    useThumbnailScroll(carouselRef, thumbnailRefs, currentGalleryIndex, isOpen);

    const handlePrev = useCallback(() => {
        if (currentGalleryIndex > 0) {
            setCurrentGalleryIndex((prev) => prev - 1);
        } else {
            // At the beginning of gallery, go to previous entry
            if (onPrevEnd) {
                onPrevEnd();
            } else {
                // Fallback: wrap to end of current gallery
                setCurrentGalleryIndex(galleryItemsArray.length - 1);
            }
        }
    }, [currentGalleryIndex, onPrevEnd, galleryItemsArray.length]);

    const handleNext = useCallback(() => {
        if (currentGalleryIndex < galleryItemsArray.length - 1) {
            setCurrentGalleryIndex((prev) => prev + 1);
        } else {
            // At the end of gallery, go to next entry
            if (onNextEnd) {
                onNextEnd();
            } else {
                // Fallback: wrap to beginning of current gallery
                setCurrentGalleryIndex(0);
            }
        }
    }, [galleryItemsArray.length, currentGalleryIndex, onNextEnd]);

    useKeyboardNavigation(
        isOpen,
        handlePrev,
        handleNext,
        handleOpenChange,
        galleryItemsArray,
        currentGalleryIndex,
    );

    // Initialize thumbnail refs array
    useEffect(() => {
        thumbnailRefs.current = thumbnailRefs.current.slice(
            0,
            galleryItemsArray.length,
        );
    }, [galleryItemsArray.length]);

    // Reset current item index when gallery changes
    useEffect(() => {
        if (galleryItems && galleryItems.length > 0) {
            setCurrentGalleryIndex(0);
        }
    }, [galleryItems]);

    useEffect(() => {
        setCurrentGalleryIndex(galleryIndex);
    }, [galleryIndex]);

    // Pauses BGM when lightbox opens and current entry is a video, resumes when closed
    useEffect(() => {
        if (isOpen) {
            if (currentGalleryItem.type === "video") {
                pauseBGM();
            } else {
                playBGM();
            }
        } else {
            playBGM();
        }
    }, [isOpen, currentGalleryItem.type, playBGM, pauseBGM]);

    const showNavigation =
        galleryItemsArray.length > 1 || alwaysShowNavigationArrows;

    let blurBgSrc = "";
    if (currentGalleryItem.type === "image") {
        blurBgSrc = getBlurDataURL(currentGalleryItem.src);
    } else if (currentGalleryItem.type === "video") {
        if (currentGalleryItem.thumbnailSrc) {
            blurBgSrc = getBlurDataURL(currentGalleryItem.thumbnailSrc);
        } else {
            const videoName =
                currentGalleryItem.src
                    .split("/")
                    .pop()
                    ?.replace(/\.[^/.]+$/, "") || "";

            const thumbnailSrc = `${videoName}-thumb.webp`;
            blurBgSrc = getBlurDataURL(thumbnailSrc) || "";
        }
        if (!blurBgSrc) {
            blurBgSrc = getBlurDataURL("bg-0-dark-opt");
        }
    }

    return (
        <div className={containerClassName}>
            {!isExternallyControlled && (
                <LightboxTrigger
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    type={type}
                    className={className}
                    priority={priority}
                    onClick={() => handleOpenChange(true)}
                />
            )}

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent
                    backdropFilter={backdropFilter}
                    className="max-w-fit bg-blur p-2 gap-4 flex flex-col items-center h-[80dvh] md:h-[90vh]"
                    showXButton={false}
                    style={{ backgroundImage: "none" }}
                >
                    <DialogTitle className="sr-only">
                        <VisuallyHidden>{currentItem.alt}</VisuallyHidden>
                    </DialogTitle>

                    <DialogDescription className="sr-only">
                        <VisuallyHidden>{currentItem.alt}</VisuallyHidden>
                    </DialogDescription>

                    {/* Blurred background */}
                    <div className="absolute inset-0 -z-10">
                        <Image
                            src={blurBgSrc}
                            alt=""
                            fill
                            priority={priority}
                            className="object-cover blur-md opacity-30"
                        />

                        <div className="absolute inset-0 bg-black/30" />
                    </div>

                    <button
                        onClick={() => handleOpenChange(false)}
                        className="absolute -top-7 size-6 right-0 text-white hover:text-gray-300 transition-colors z-10"
                        aria-label="Close lightbox"
                    >
                        <X className="size-full" />
                    </button>

                    <div className="relative lg:w-[60vw] md:w-[80vw] w-[90vw] flex items-center justify-center flex-1 min-h-0">
                        {showNavigation && (
                            <LightboxNavigateButtons
                                onPrev={handlePrev}
                                onNext={handleNext}
                            />
                        )}

                        <LightboxContent
                            currentItem={currentGalleryItem}
                            priority={priority}
                            items={galleryItemsArray}
                            currentItemIndex={currentGalleryIndex}
                            onSlideChange={setCurrentGalleryIndex}
                            onNext={handleNext}
                            onPrev={handlePrev}
                        />
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <LightboxInfo
                            alt={currentGalleryItem.alt}
                            authorSrc={authorSrc}
                        />
                        <ThumbnailCarousel
                            ref={carouselRef}
                            items={galleryItemsArray}
                            currentItemIndex={currentGalleryIndex}
                            onThumbnailClick={handleThumbnailClick}
                            thumbnailRefs={thumbnailRefs}
                            showFanartMeta={showFanartMeta}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default memo(Lightbox);
