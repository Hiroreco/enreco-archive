import ViewLightbox from "@/components/view/lightbox/ViewLightbox";
import { ViewMarkdown } from "@/components/view/markdown/ViewMarkdown";
import { getBlurDataURL } from "@/lib/utils";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { AnimatePresence, motion } from "framer-motion";
import { Play } from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { MediaEntry, RecollectionArchiveEntry } from "./types";

interface ViewVideoArchiveViewerProps {
    entry: RecollectionArchiveEntry;
}

const ViewVideoArchiveViewer = ({ entry }: ViewVideoArchiveViewerProps) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentMedia = useMemo(
        () => entry.entries[currentMediaIndex] || entry.entries[0],
        [entry.entries, currentMediaIndex],
    );

    const galleryItems = useMemo(
        () =>
            entry.entries.map((media) => ({
                src: media.src,
                alt: media.title,
                type: media.type,
            })),
        [entry.entries],
    );

    const handleThumbnailClick = useCallback((index: number) => {
        setCurrentMediaIndex(index);
        const carousel = document.getElementById("carousel");
        const thumbnail = carousel?.children[index] as HTMLElement;
        if (thumbnail && carousel) {
            const thumbnailLeft = thumbnail.offsetLeft;
            const thumbnailWidth = thumbnail.offsetWidth;
            const carouselWidth = carousel.offsetWidth;
            const scrollPosition =
                thumbnailLeft - (carouselWidth - thumbnailWidth) / 2;
            carousel.scrollTo({
                left: scrollPosition,
                behavior: "smooth",
            });
        }
    }, []);

    const handleMainImageClick = useCallback(() => {
        setIsLightboxOpen(true);
    }, []);

    const handleLightboxClose = useCallback(() => {
        setIsLightboxOpen(false);
    }, []);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                ref={containerRef}
                className="flex flex-col md:flex-row gap-4 h-full overflow-hidden p-2"
            >
                {/* Left Side - Media */}
                <div className="flex flex-col gap-3 md:w-[60%] h-full">
                    {/* Main Media Display */}
                    <div className="relative flex-1 min-h-0 bg-black/20 rounded-lg overflow-hidden group cursor-pointer">
                        <div
                            className="relative w-full h-full"
                            onClick={handleMainImageClick}
                        >
                            <Image
                                src={currentMedia.thumbnailUrl}
                                alt={currentMedia.title}
                                fill
                                className="object-contain"
                                blurDataURL={getBlurDataURL(
                                    currentMedia.thumbnailUrl,
                                )}
                                placeholder={
                                    getBlurDataURL(currentMedia.thumbnailUrl)
                                        ? "blur"
                                        : "empty"
                                }
                                priority
                            />

                            {/* Video Play Overlay */}
                            {currentMedia.type === "video" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                                    <div className="bg-white/90 rounded-full p-4 group-hover:scale-110 transition-transform">
                                        <Play className="w-12 h-12 text-black fill-black" />
                                    </div>
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                    </div>

                    {/* Media Carousel */}
                    <div className="px-2 border rounded-lg">
                        {entry.entries.length > 1 && (
                            <div
                                className="flex gap-2 overflow-x-auto p-2 min-h-[80px]"
                                id="carousel"
                            >
                                {entry.entries.map((media, index) => (
                                    <MediaThumbnail
                                        key={index}
                                        media={media}
                                        index={index}
                                        isActive={index === currentMediaIndex}
                                        onClick={handleThumbnailClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <Separator className="md:hidden" />

                {/* Right Side - Info */}
                <div className="flex flex-col gap-3 md:w-[40%] h-full overflow-y-auto">
                    <div className="flex flex-col gap-2">
                        <span className="text-2xl font-bold">
                            {entry.title}
                        </span>
                        <p className="text-sm text-muted-foreground">
                            {currentMedia.title}
                        </p>
                    </div>

                    <Separator />

                    <div className="flex-1">
                        <ViewMarkdown
                            className="text-sm"
                            onNodeLinkClicked={() => {}}
                            onEdgeLinkClicked={() => {}}
                        >
                            {currentMedia.info}
                        </ViewMarkdown>
                    </div>

                    {currentMedia && (
                        <>
                            <Separator />
                            <div className="flex flex-col gap-1">
                                {currentMedia.type === "video" && (
                                    <a
                                        href={currentMedia.originalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-muted-foreground hover:underline"
                                    >
                                        View original source
                                    </a>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <ViewLightbox
                    src={currentMedia.src}
                    alt={currentMedia.title}
                    type={currentMedia.type}
                    isExternallyControlled={true}
                    externalIsOpen={isLightboxOpen}
                    onExternalClose={handleLightboxClose}
                    galleryItems={galleryItems}
                    galleryIndex={currentMediaIndex}
                />
            </motion.div>
        </AnimatePresence>
    );
};

interface MediaThumbnailProps {
    media: MediaEntry;
    index: number;
    isActive: boolean;
    onClick: (index: number) => void;
}

const MediaThumbnail = ({
    media,
    index,
    isActive,
    onClick,
}: MediaThumbnailProps) => {
    return (
        <div
            className={`relative shrink-0 w-[120px] h-[68px] rounded-md overflow-hidden cursor-pointer transition-all ${
                isActive
                    ? "ring-2 ring-primary scale-105"
                    : "ring-1 ring-foreground/30 hover:ring-foreground/60"
            }`}
            onClick={() => onClick(index)}
        >
            <Image
                src={media.thumbnailUrl}
                alt={media.title}
                fill
                className="object-cover"
                blurDataURL={getBlurDataURL(media.thumbnailUrl)}
                placeholder={
                    getBlurDataURL(media.thumbnailUrl) ? "blur" : "empty"
                }
            />

            {/* Video indicator */}
            {media.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="bg-white/80 rounded-full p-1">
                        <Play className="w-4 h-4 text-black fill-black" />
                    </div>
                </div>
            )}

            {/* Active overlay */}
            {isActive && (
                <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
            )}
        </div>
    );
};

export default ViewVideoArchiveViewer;
