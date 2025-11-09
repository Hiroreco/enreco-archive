import { useMusicPlayerStore } from "@/store/musicPlayerStore";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useEffect, useState } from "react";
import { isMobileViewport } from "@/lib/utils";
import Image from "next/image";

const PlayingAnimation = () => (
    <div className="flex items-end h-3 gap-[2px]">
        <div className="w-[3px] h-full bg-gray-200 animate-music-bar-1 rounded-sm" />
        <div className="w-[3px] h-[70%] bg-gray-200 animate-music-bar-2 rounded-sm" />
        <div className="w-[3px] h-[40%] bg-gray-200 animate-music-bar-3 rounded-sm" />
    </div>
);

export const NowPlayingToast = () => {
    const { getSongs } = useLocalizedData();
    const SONGS = useMemo(() => getSongs(), [getSongs]);
    const categories = useMemo(() => Object.entries(SONGS), [SONGS]);

    const catIndex = useMusicPlayerStore((state) => state.catIndex);
    const trackIndex = useMusicPlayerStore((state) => state.trackIndex);
    const isPlaying = useMusicPlayerStore((state) => state.isPlaying);

    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const isMobile = isMobileViewport();

    const currentSong = useMemo(() => {
        if (catIndex === null || trackIndex === null) return null;
        const [, songs] = categories[catIndex];
        return songs[trackIndex];
    }, [catIndex, trackIndex, categories]);

    const shouldShow = isPlaying && currentSong;

    const songThumbNail = currentSong?.coverUrl
        ? currentSong.coverUrl.replace(/\.webp$/, "-thumb.webp")
        : "/images-opt/song-chapter-2-thumb-opt.webp";

    useEffect(() => {
        if (shouldShow) {
            setIsVisible(true);

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            const newTimeoutId = setTimeout(() => {
                setIsVisible(false);
            }, 5000);

            setTimeoutId(newTimeoutId);
        } else {
            setIsVisible(false);
            if (timeoutId) {
                clearTimeout(timeoutId);
                setTimeoutId(null);
            }
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldShow, catIndex, trackIndex]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className={cn("fixed z-50 pointer-events-none", {
                        "bottom-4 left-4": !isMobile,
                        "bottom-20 left-1/2 -translate-x-1/2": isMobile,
                    })}
                >
                    <div
                        className={cn(
                            "flex items-center gap-3 bg-background/80 backdrop-blur-md border border-white/20 text-foreground shadow-lg",
                            {
                                "px-4 py-3 rounded-lg": !isMobile,
                                "px-3 py-2 rounded-full": isMobile,
                            },
                        )}
                    >
                        <div className="relative flex items-center justify-center">
                            <Image
                                src={songThumbNail}
                                alt={currentSong?.title || ""}
                                width={isMobile ? 32 : 40}
                                height={isMobile ? 32 : 40}
                                className={cn("object-cover", {
                                    "size-10 rounded": !isMobile,
                                    "size-8 rounded-full": isMobile,
                                })}
                                draggable={false}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <PlayingAnimation />
                        </div>

                        <div className="flex flex-col min-w-0">
                            <span
                                className={cn("font-semibold truncate", {
                                    "text-sm max-w-[200px]": !isMobile,
                                    "text-xs max-w-[150px]": isMobile,
                                })}
                            >
                                {currentSong?.title}
                            </span>
                            {!isMobile && (
                                <span className="text-xs opacity-70 truncate max-w-[200px]">
                                    {currentSong?.info || "Now Playing"}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
