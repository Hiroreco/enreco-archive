import type { FanartEntry } from "@/components/view/fanart/FanartModal";
import Lightbox from "@/components/view/lightbox/Lightbox";
import { GalleryItem } from "@/components/view/lightbox/types";
import { getBlurDataURL } from "@/lib/utils";
import { Button } from "@enreco-archive/common-ui/components/button";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import {
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    ImageIcon,
    Play,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";

interface CardFanartCarouselProps {
    fanartEntries: FanartEntry[];
    className?: string;
}

const getVideoThumbnailSrc = (videoSrc: string): string => {
    const videoName = videoSrc.split("/").pop()?.replace(/\.[^/.]+$/, "") || "";
    return `images-opt/${videoName}-thumb.webp`;
};

const getPreviewMedia = (entry: FanartEntry) => {
    const firstImage = entry.images[0];

    if (firstImage) {
        return {
            src: firstImage.src.replace("-opt.webp", "-opt-thumb.webp"),
            isVideo: false,
        };
    }

    return {
        src: getVideoThumbnailSrc(entry.videos[0].src),
        isVideo: true,
    };
};

const CardFanartCarousel = ({
    fanartEntries,
    className,
}: CardFanartCarouselProps) => {
    const tSection = useTranslations("cards.fanartSection");
    const tCard = useTranslations("modals.art.card");

    const carouselRef = useRef<HTMLDivElement>(null);
    const [selectedEntryIndex, setSelectedEntryIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const selectedEntry = fanartEntries[selectedEntryIndex] ?? fanartEntries[0];

    const galleryItems = useMemo<GalleryItem[]>(() => {
        if (!selectedEntry) {
            return [];
        }

        return [
            ...selectedEntry.images.map((image) => ({
                src: image.src,
                alt: `${selectedEntry.label} by ${selectedEntry.author}`,
                type: "image" as const,
                width: image.width,
                height: image.height,
                chapter: selectedEntry.chapter,
                day: selectedEntry.day,
            })),
            ...selectedEntry.videos.map((video) => ({
                src: video.src,
                alt: `${selectedEntry.label} by ${selectedEntry.author}`,
                type: "video" as const,
                thumbnailSrc: getVideoThumbnailSrc(video.src),
                chapter: selectedEntry.chapter,
                day: selectedEntry.day,
            })),
        ];
    }, [selectedEntry]);

    const handleOpenEntry = useCallback((index: number) => {
        setSelectedEntryIndex(index);
        setIsLightboxOpen(true);
    }, []);

    const handleScroll = useCallback((direction: "left" | "right") => {
        if (!carouselRef.current) {
            return;
        }

        carouselRef.current.scrollBy({
            left: direction === "left" ? -260 : 260,
            behavior: "smooth",
        });
    }, []);

    const handleNextEntry = useCallback(() => {
        setSelectedEntryIndex((currentIndex) =>
            currentIndex < fanartEntries.length - 1 ? currentIndex + 1 : 0,
        );
    }, [fanartEntries.length]);

    const handlePreviousEntry = useCallback(() => {
        setSelectedEntryIndex((currentIndex) =>
            currentIndex > 0 ? currentIndex - 1 : fanartEntries.length - 1,
        );
    }, [fanartEntries.length]);

    if (fanartEntries.length === 0 || !selectedEntry) {
        return null;
    }

    return (
        <section className={cn("space-y-3", className)}>
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                        {tSection("title")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {fanartEntries.length} {tSection("items")}
                    </p>
                </div>

                {fanartEntries.length > 1 && (
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleScroll("left")}
                            aria-label={tSection("scrollLeft")}
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleScroll("right")}
                            aria-label={tSection("scrollRight")}
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div
                ref={carouselRef}
                className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth"
            >
                {fanartEntries.map((entry, index) => {
                    const previewMedia = getPreviewMedia(entry);
                    const totalMediaCount = entry.images.length + entry.videos.length;
                    const hasVideo = entry.videos.length > 0;

                    return (
                        <article
                            key={`${entry.url}-${index}`}
                            className="relative shrink-0 w-52 snap-start"
                        >
                            <button
                                type="button"
                                className="group w-full overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                onClick={() => handleOpenEntry(index)}
                                aria-label={tSection("openImage", {
                                    label: entry.label,
                                })}
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                    <Image
                                        src={previewMedia.src}
                                        alt={entry.label}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        sizes="208px"
                                        placeholder={
                                            getBlurDataURL(previewMedia.src)
                                                ? "blur"
                                                : "empty"
                                        }
                                        blurDataURL={getBlurDataURL(previewMedia.src)}
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />

                                    <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[11px] text-white">
                                        {hasVideo ? (
                                            <Play className="size-3 fill-white" />
                                        ) : (
                                            <ImageIcon className="size-3" />
                                        )}
                                        <span>{totalMediaCount}</span>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                        <p className="line-clamp-2 text-sm font-semibold leading-tight">
                                            {entry.label}
                                        </p>
                                        <p className="mt-1 line-clamp-1 text-xs text-white/80">
                                            {tCard("by", { author: entry.author })}
                                        </p>
                                        <p className="mt-1 text-[11px] uppercase tracking-wide text-white/70">
                                            C{entry.chapter + 1} D{entry.day + 1}
                                        </p>
                                    </div>
                                </div>
                            </button>

                            <a
                                href={entry.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-black/80"
                                aria-label={tSection("openOriginal")}
                            >
                                <ExternalLink className="size-4" />
                            </a>
                        </article>
                    );
                })}
            </div>

            <Lightbox
                src={galleryItems[0]?.src || ""}
                alt={galleryItems[0]?.alt || selectedEntry.label}
                type={galleryItems[0]?.type || "image"}
                width={galleryItems[0]?.width}
                height={galleryItems[0]?.height}
                galleryItems={galleryItems}
                authorSrc={selectedEntry.url}
                isExternallyControlled={true}
                externalIsOpen={isLightboxOpen}
                onExternalClose={() => setIsLightboxOpen(false)}
                onNextEnd={handleNextEntry}
                onPrevEnd={handlePreviousEntry}
                showFanartMeta={true}
            />
        </section>
    );
};

export default CardFanartCarousel;