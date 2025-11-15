import { ViewMarkdown } from "@/components/view/markdown/Markdown";
import { getBlurDataURL } from "@/lib/utils";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { AnimatePresence, motion } from "framer-motion";
import { Play } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import type { Swiper as SwiperType } from "swiper";
import { EffectCreative } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { MediaEntry, RecollectionArchiveEntry } from "../types";

import { useViewStore } from "@/store/viewStore";
import { useTranslations } from "next-intl";
import "swiper/css";
import "swiper/css/effect-creative";
import Lightbox from "../../lightbox/Lightbox";

interface VideoArchiveViewerProps {
    entry: RecollectionArchiveEntry;
    onMediaIndexChange?: (index: number) => void;
}

const VideoArchiveViewer = ({
    entry,
    onMediaIndexChange,
}: VideoArchiveViewerProps) => {
    const t = useTranslations("mediaArchive");
    const openModal = useViewStore((state) => state.modal.openModal);

    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set());
    const containerRef = useRef<HTMLDivElement>(null);
    const swiperRef = useRef<SwiperType | null>(null);

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
                thumbnailSrc: media.thumbnailUrl,
            })),
        [entry.entries],
    );

    const isVideoType = useMemo(
        () => currentMedia.type === "video" || currentMedia.type === "youtube",
        [currentMedia.type],
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLightboxOpen || openModal !== null) {
                return;
            }
            if (e.key === "ArrowRight") {
                setCurrentMediaIndex((prev) =>
                    prev < entry.entries.length - 1 ? prev + 1 : prev,
                );
                setPlayingVideos(new Set());
            } else if (e.key === "ArrowLeft") {
                setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : prev));
                setPlayingVideos(new Set());
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [entry.entries.length, isLightboxOpen, openModal]);

    const handleThumbnailClick = useCallback(
        (index: number) => {
            setCurrentMediaIndex(index);
            onMediaIndexChange?.(index);
            // Stop any playing video when switching
            setPlayingVideos(new Set());

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
        },
        [onMediaIndexChange],
    );

    const handleMainImageClick = useCallback(() => {
        if (!isVideoType) {
            setIsLightboxOpen(true);
        }
    }, [isVideoType]);

    const handleVideoThumbnailClick = useCallback((index: number) => {
        setPlayingVideos((prev) => {
            const newSet = new Set(prev);
            newSet.add(index);
            return newSet;
        });
    }, []);

    const handleLightboxClose = useCallback(() => {
        setIsLightboxOpen(false);
    }, []);

    // Sync Swiper with external index changes
    useEffect(() => {
        if (
            swiperRef.current &&
            swiperRef.current.activeIndex !== currentMediaIndex
        ) {
            swiperRef.current.slideTo(currentMediaIndex);
        }
    }, [currentMediaIndex]);

    const handleSlideChange = (swiper: SwiperType) => {
        setCurrentMediaIndex(swiper.activeIndex);
        onMediaIndexChange?.(swiper.activeIndex);
        // Stop videos when sliding away
        setPlayingVideos(new Set());
    };

    const renderMediaItem = (media: MediaEntry, index: number) => {
        const isVideo = media.type === "video" || media.type === "youtube";
        const isPlaying = playingVideos.has(index);

        if (isVideo) {
            if (!isPlaying) {
                return (
                    <div
                        className="relative w-full h-full min-h-[100px] aspect-video cursor-pointer flex items-center justify-center"
                        onClick={() => handleVideoThumbnailClick(index)}
                    >
                        <div className="absolute inset-0 -z-10">
                            <Image
                                src={getBlurDataURL(currentMedia.thumbnailUrl)}
                                alt=""
                                fill
                                className="object-cover"
                            />
                        </div>
                        <Image
                            src={media.thumbnailUrl}
                            alt={media.title}
                            fill
                            className="object-contain"
                            blurDataURL={getBlurDataURL(media.thumbnailUrl)}
                            placeholder={
                                getBlurDataURL(media.thumbnailUrl)
                                    ? "blur"
                                    : "empty"
                            }
                        />

                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                            <div className="bg-white/90 hover:bg-white rounded-full p-6 transition-all hover:scale-110">
                                <Play className="w-16 h-16 text-black fill-black" />
                            </div>
                        </div>
                    </div>
                );
            }

            return (
                <div className="relative w-full h-full min-h-[100px] aspect-video flex items-center justify-center">
                    <div className="absolute inset-0 -z-10">
                        <Image
                            src={getBlurDataURL(currentMedia.thumbnailUrl)}
                            alt=""
                            fill
                            className="object-cover"
                        />
                    </div>
                    <ReactPlayer
                        src={media.src}
                        controls
                        width="100%"
                        playing={isPlaying}
                        height="100%"
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                        }}
                    />
                </div>
            );
        }

        return (
            <div
                className="relative w-full h-full cursor-pointer"
                onClick={handleMainImageClick}
            >
                <AnimatePresence>
                    <div className="absolute inset-0 -z-10">
                        <Image
                            src={getBlurDataURL(currentMedia.thumbnailUrl)}
                            alt=""
                            fill
                            className="object-cover"
                        />
                    </div>
                </AnimatePresence>
                <Image
                    src={currentMedia.thumbnailUrl}
                    alt={currentMedia.title}
                    fill
                    className="object-contain"
                    blurDataURL={getBlurDataURL(currentMedia.thumbnailUrl)}
                    placeholder={
                        getBlurDataURL(currentMedia.thumbnailUrl)
                            ? "blur"
                            : "empty"
                    }
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
        );
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                ref={containerRef}
                className="flex flex-col md:flex-row gap-4 h-full overflow-y-auto md:overflow-y-hidden p-2"
            >
                {/* Left Side - Media */}
                <div className="flex flex-col gap-3 md:w-[60%] h-full">
                    <div className="relative flex-1 min-h-0 bg-black/20 rounded-lg overflow-hidden group">
                        <Swiper
                            modules={[EffectCreative]}
                            spaceBetween={0}
                            slidesPerView={1}
                            centeredSlides
                            initialSlide={currentMediaIndex}
                            onSwiper={(swiper) => {
                                swiperRef.current = swiper;
                            }}
                            onSlideChange={handleSlideChange}
                            effect="creative"
                            creativeEffect={{
                                prev: {
                                    translate: ["-100%", 0, 0],
                                    opacity: 0,
                                },
                                next: {
                                    translate: ["100%", 0, 0],
                                    opacity: 0,
                                },
                            }}
                            speed={300}
                            allowTouchMove={false}
                            className="w-full h-full"
                        >
                            {entry.entries.map((media, index) => (
                                <SwiperSlide
                                    key={`${media.src}-${index}`}
                                    className="!flex !items-center !justify-center w-full h-full"
                                >
                                    {renderMediaItem(media, index)}
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Media Carousel */}
                    <div className="px-2 border-2 border-foreground/60 rounded-lg">
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
                    </div>
                </div>

                <Separator className="md:hidden" />

                {/* Right Side - Info */}
                <div className="flex flex-col gap-3 md:w-[40%] h-full">
                    <div className="flex flex-col gap-2">
                        <span className="text-xl font-bold">{entry.title}</span>
                        <p className="text-sm text-muted-foreground">
                            {currentMedia.title}
                        </p>
                    </div>

                    <Separator className="bg-foreground/60" />

                    <div className="flex-1 md:overflow-y-auto">
                        <ViewMarkdown
                            className="text-sm"
                            onNodeLinkClicked={() => {}}
                            onEdgeLinkClicked={() => {}}
                        >
                            {currentMedia.info || entry.info}
                        </ViewMarkdown>
                    </div>

                    {currentMedia && (
                        <>
                            <Separator className="bg-foreground/60" />
                            <div className="flex flex-col gap-1">
                                {currentMedia.originalUrl && (
                                    <a
                                        href={currentMedia.originalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-muted-foreground hover:underline"
                                    >
                                        {t("videoArchive.viewSource")}
                                    </a>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {!isVideoType && (
                    <Lightbox
                        src={currentMedia.src}
                        alt={currentMedia.title}
                        type={currentMedia.type}
                        authorSrc={currentMedia.originalUrl}
                        isExternallyControlled={true}
                        externalIsOpen={isLightboxOpen}
                        onExternalClose={handleLightboxClose}
                        galleryItems={galleryItems}
                        galleryIndex={currentMediaIndex}
                    />
                )}
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
    const isVideo = media.type === "video" || media.type === "youtube";

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
            {isVideo && (
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

export default VideoArchiveViewer;
