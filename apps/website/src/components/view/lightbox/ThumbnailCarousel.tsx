import { GalleryItem } from "@/components/view/lightbox/types";
import { getBlurDataURL } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@enreco-archive/common-ui/components/tooltip";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { forwardRef, RefObject } from "react";

interface ThumbnailCarouselProps {
    items: GalleryItem[];
    currentItemIndex: number;
    onThumbnailClick: (index: number) => void;
    thumbnailRefs: RefObject<(HTMLDivElement | null)[]>;
    showFanartMeta?: boolean;
}

export const ThumbnailCarousel = forwardRef<
    HTMLDivElement,
    ThumbnailCarouselProps
>(({ items, currentItemIndex, onThumbnailClick, thumbnailRefs }, ref) => {
    const t = useTranslations("modals.art.lightbox");
    const chapter = items[0].chapter;
    const day = items[0].day;
    const chapterDayLabel =
        chapter !== undefined && day !== undefined
            ? `C${chapter + 1}D${day + 1}`
            : null;
    return (
        <div
            ref={ref}
            className="flex mx-auto justify-start gap-2 overflow-x-auto py-2 px-4 max-w-full lg:max-w-[60vw] md:max-w-[80vw] scroll-smooth"
        >
            {items.map((item, index) => (
                <div
                    key={index}
                    ref={(el) => {
                        if (thumbnailRefs.current) {
                            thumbnailRefs.current[index] = el;
                        }
                    }}
                    className={cn(
                        "relative h-16 w-28 shrink-0 cursor-pointer transition-all duration-200 border-2 rounded-md overflow-hidden",
                        index === currentItemIndex
                            ? "border-white opacity-100 scale-105"
                            : "border-gray-500/50 opacity-70 hover:opacity-90",
                    )}
                    onClick={() => onThumbnailClick(index)}
                >
                    {item.type === "image" ? (
                        <Image
                            src={item.src}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            sizes="112px"
                            className="object-cover"
                            placeholder={
                                getBlurDataURL(item.src) ? "blur" : "empty"
                            }
                            blurDataURL={getBlurDataURL(item.src)}
                        />
                    ) : (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                            {(() => {
                                const videoName =
                                    item.src
                                        .split("/")
                                        .pop()
                                        ?.replace(/\.[^/.]+$/, "") || "";

                                const thumbnailSrc = `images-opt/${videoName}-thumb.webp`;

                                return (
                                    <>
                                        <Image
                                            src={thumbnailSrc}
                                            alt={`Video thumbnail ${index + 1}`}
                                            fill
                                            sizes="112px"
                                            className="object-cover"
                                            placeholder={
                                                getBlurDataURL(
                                                    `${videoName}-thumb`,
                                                )
                                                    ? "blur"
                                                    : "empty"
                                            }
                                            blurDataURL={getBlurDataURL(
                                                `${videoName}-thumb`,
                                            )}
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <Play className="text-white w-6 h-6 drop-shadow-lg" />
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </div>
            ))}

            {chapterDayLabel && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full cursor-default absolute bottom-4 left-2">
                            {chapterDayLabel}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                        {t("relatedTo", {
                            day: day! + 1,
                            chapter: chapter! + 1,
                        })}
                    </TooltipContent>
                </Tooltip>
            )}

            <div className="bg-black/50 text-white text-xs min-w-11 text-center px-2 py-1 rounded-full absolute bottom-4 right-2">
                {currentItemIndex + 1} / {items.length}
            </div>
        </div>
    );
});

ThumbnailCarousel.displayName = "ThumbnailCarousel";
