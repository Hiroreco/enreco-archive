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
import { memo, useState } from "react";

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
    priority = false,
    galleryImages,
    galleryIndex = 0,
}: ViewLightboxProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(galleryIndex);
    const backdropFilter = useSettingStore((state) => state.backdropFilter);

    // Create a gallery array if one wasn't provided
    const images = galleryImages || [{ src, alt }];

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            // Reset to initial index when opening
            setCurrentImageIndex(galleryIndex);
        }
    };

    const handleNext = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentImageIndex(
            (prev) => (prev - 1 + images.length) % images.length,
        );
    };

    const handleThumbnailClick = (index: number) => {
        setCurrentImageIndex(index);
    };

    const currentImage = images[currentImageIndex];

    return (
        <div>
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

                    <div className="relative lg:w-[60vw] md:w-[80vw] w-[95vw] aspect-video">
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
                        <Image
                            src={currentImage.src}
                            alt={currentImage.alt}
                            fill
                            className="object-cover"
                            placeholder={
                                getBlurDataURL(currentImage.src)
                                    ? "blur"
                                    : "empty"
                            }
                            blurDataURL={getBlurDataURL(currentImage.src)}
                        />
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <span className="text-white text-center font-semibold text-sm md:text-lg">
                            {currentImage.alt}
                        </span>

                        {images.length > 1 && (
                            <div className="flex justify-center gap-2 overflow-x-auto py-2 max-w-full">
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "relative h-16 w-28 cursor-pointer transition-all duration-200 border-2 rounded-md overflow-hidden",
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
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default memo(ViewLightbox);
