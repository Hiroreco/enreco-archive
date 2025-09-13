import AudioVisualizer from "@/components/view/jukebox/ViewAudioVisualizer";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { getBlurDataURL } from "@/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import { useMusicPlayerStore } from "@/store/musicPlayerStore";
import { useSettingStore } from "@/store/settingStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { Slider } from "@enreco-archive/common-ui/components/slider";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@enreco-archive/common-ui/components/tooltip";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { Song } from "@enreco-archive/common/types";
import {
    ChevronFirst,
    ChevronLast,
    ExternalLink,
    Pause,
    Play,
    Repeat,
    Shuffle,
    Volume2,
    VolumeX,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef } from "react";

const PlayingAnimation = () => (
    <div className="flex items-end h-3 gap-[2px]">
        <div className="w-[3px] h-full bg-gray-200 animate-music-bar-1 rounded-sm" />
        <div className="w-[3px] h-[70%] bg-gray-200 animate-music-bar-2 rounded-sm" />
        <div className="w-[3px] h-[40%] bg-gray-200 animate-music-bar-3 rounded-sm" />
    </div>
);

interface TrackItemProps {
    song: Song;
    cIdx: number;
    tIdx: number;
    catIndex: number | null;
    trackIndex: number | null;
    isPlaying: boolean;
    onSelect: (cIdx: number, tIdx: number) => void;
}

const TrackItem = ({
    song,
    cIdx,
    tIdx,
    catIndex,
    trackIndex,
    isPlaying,
    onSelect,
}: TrackItemProps) => {
    const songThumbNail = song.coverUrl
        ? song.coverUrl.replace(/\.webp$/, "-thumb.webp")
        : "/images-opt/song-chapter-2-thumb-opt.webp";
    return (
        <div
            key={`${cIdx}-${tIdx}`}
            data-cat={cIdx}
            data-track={tIdx}
            className={cn(
                "flex items-center cursor-pointer hover:dark:bg-white/10 hover:bg-black/10 transition-colors rounded-lg px-3 py-1.5 group",
                {
                    "dark:bg-white/20 bg-black/20":
                        cIdx === catIndex && tIdx === trackIndex,
                },
            )}
            onClick={() => onSelect(cIdx, tIdx)}
        >
            <Image
                src={songThumbNail}
                alt={song.title}
                width={32}
                height={32}
                className="object-cover size-8 rounded"
                draggable={false}
            />

            <span className="opacity-50 h-6 w-4 flex items-center justify-center mx-1">
                {cIdx === catIndex && tIdx === trackIndex && isPlaying ? (
                    <PlayingAnimation />
                ) : (
                    <Play className="size-3 hidden group-hover:block" />
                )}
            </span>
            <div className="flex flex-col grow opacity-90 items-start ">
                <span className="text-sm font-semibold line-clamp-1">
                    {song.title}
                </span>
                <span className="text-xs opacity-70 line-clamp-1">
                    {song.info || "No info available"}
                </span>
            </div>

            <span className="text-xs opacity-50 ml-2">{song.duration}</span>
        </div>
    );
};

interface PlayerControlsProps {
    bgmVolume: number;
    onVolumeChange: (val: number[]) => void;
    isShuffled: boolean;
    toggleShuffle: () => void;
    playPrev: () => void;
    playPause: (val: boolean) => void;
    isPlaying: boolean;
    playNext: () => void;
    toggleLoop: () => void;
    loopCurrentSong: boolean;
    currentTrack: Song | null;
}

const PlayerControls = ({
    bgmVolume,
    onVolumeChange,
    isShuffled,
    toggleShuffle,
    playPrev,
    playPause,
    isPlaying,
    playNext,
    toggleLoop,
    loopCurrentSong,
    currentTrack,
}: PlayerControlsProps) => {
    const t = useTranslations("modals.music");
    const previousVolumeBeforeMute = useRef(bgmVolume);
    return (
        <div className="flex items-center justify-between w-full px-2">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => {
                        if (bgmVolume > 0) {
                            previousVolumeBeforeMute.current = bgmVolume;
                            onVolumeChange([0]);
                        } else {
                            onVolumeChange([previousVolumeBeforeMute.current]);
                        }
                    }}
                >
                    {bgmVolume > 0 ? (
                        <Volume2 size={16} />
                    ) : (
                        <VolumeX size={16} />
                    )}
                </button>
                <Slider
                    className="w-16"
                    value={[bgmVolume]}
                    max={1}
                    step={0.01}
                    onValueChange={onVolumeChange}
                />
            </div>
            <div className="flex items-center gap-4">
                <Tooltip delayDuration={300}>
                    <TooltipTrigger
                        onClick={toggleShuffle}
                        className={cn("transition-opacity", {
                            "opacity-100": isShuffled,
                            "opacity-50 hover:opacity-80": !isShuffled,
                        })}
                    >
                        <Shuffle size={16} />
                    </TooltipTrigger>
                    <TooltipContent>
                        {isShuffled
                            ? t("controls.shuffle.off")
                            : t("controls.shuffle.on")}
                    </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={300}>
                    <TooltipTrigger
                        onClick={playPrev}
                        disabled={!currentTrack}
                        className="hover:opacity-80 transition-opacity disabled:opacity-30"
                    >
                        <ChevronFirst />
                    </TooltipTrigger>
                    <TooltipContent>
                        {t("controls.previousTrack")}
                    </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={300}>
                    <TooltipTrigger
                        onClick={() => playPause(!isPlaying)}
                        disabled={!currentTrack}
                        className="hover:opacity-80 transition-opacity disabled:opacity-30"
                    >
                        {isPlaying ? <Pause /> : <Play />}
                    </TooltipTrigger>
                    <TooltipContent>
                        {isPlaying ? t("controls.pause") : t("controls.play")}
                    </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={300}>
                    <TooltipTrigger
                        onClick={playNext}
                        disabled={!currentTrack}
                        className="hover:opacity-80 transition-opacity disabled:opacity-30"
                    >
                        <ChevronLast />
                    </TooltipTrigger>
                    <TooltipContent>{t("controls.nextTrack")}</TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={300}>
                    <TooltipTrigger
                        onClick={toggleLoop}
                        className={cn("transition-opacity", {
                            "opacity-100": loopCurrentSong,
                            "opacity-50 hover:opacity-80": !loopCurrentSong,
                        })}
                    >
                        <Repeat size={16} />
                    </TooltipTrigger>
                    <TooltipContent>
                        {loopCurrentSong
                            ? t("controls.repeatCurrentTrack.off")
                            : t("controls.repeatCurrentTrack.on")}
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
};

interface ViewMusicPlayerModalProps {
    open: boolean;
    onClose: () => void;
}

const ViewMusicPlayerModal = ({ open, onClose }: ViewMusicPlayerModalProps) => {
    const { getSongs } = useLocalizedData();
    const SONGS = useMemo(() => getSongs(), [getSongs]);
    const categories = useMemo(() => Object.entries(SONGS), [SONGS]);
    const t = useTranslations("modals.music");
    const categoriesLabels = useMemo(
        () =>
            ({
                enreco: t("categories.enreco"),
                ingame: t("categories.ingame"),
                stream: t("categories.stream"),
                talent: t("categories.talent"),
                special: t("categories.special"),
            }) as Record<string, string>,
        [t],
    );

    const catIndex = useMusicPlayerStore((state) => state.catIndex);
    const setCatIndex = useMusicPlayerStore((state) => state.setCatIndex);
    const trackIndex = useMusicPlayerStore((state) => state.trackIndex);
    const setTrackIndex = useMusicPlayerStore((state) => state.setTrackIndex);
    const isPlaying = useMusicPlayerStore((state) => state.isPlaying);
    const setIsPlaying = useMusicPlayerStore((state) => state.setIsPlaying);
    const loopWithinCategory = useMusicPlayerStore(
        (state) => state.loopWithinCategory,
    );
    const setLoopWithinCategory = useMusicPlayerStore(
        (state) => state.setLoopWithinCategory,
    );
    const loopCurrentSong = useMusicPlayerStore(
        (state) => state.loopCurrentSong,
    );
    const setLoopCurrentSong = useMusicPlayerStore(
        (state) => state.setLoopCurrentSong,
    );
    const isShuffled = useMusicPlayerStore((state) => state.isShuffled);
    const setIsShuffled = useMusicPlayerStore((state) => state.setIsShuffled);
    const shuffledIndices = useMusicPlayerStore(
        (state) => state.shuffledIndices,
    );
    const setShuffledIndices = useMusicPlayerStore(
        (state) => state.setShuffledIndices,
    );

    const changeBGM = useAudioStore((state) => state.changeBGM);
    const bgm = useAudioStore((state) => state.bgm);
    const playBGM = useAudioStore((state) => state.playBGM);
    const pauseBGM = useAudioStore((state) => state.pauseBGM);
    const siteBgmKey = useAudioStore((state) => state.siteBgmKey);

    const setBgmVolume = useSettingStore((state) => state.setBgmVolume);
    const bgmVolume = useSettingStore((state) => state.bgmVolume);

    const listRef = useRef<HTMLDivElement>(null);

    const hasSelection = catIndex !== null && trackIndex !== null;
    const [, songs] = hasSelection ? categories[catIndex!] : ["", []];

    // Shuffle utility functions
    const generateShuffledIndices = useCallback((length: number) => {
        const indices = Array.from({ length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices;
    }, []);

    const getNextTrackIndex = useCallback(() => {
        if (trackIndex === null) return null;

        if (isShuffled) {
            const currentShuffledIndex = shuffledIndices.indexOf(trackIndex);
            if (currentShuffledIndex < shuffledIndices.length - 1) {
                return shuffledIndices[currentShuffledIndex + 1];
            } else if (loopWithinCategory) {
                return shuffledIndices[0];
            }
            return null;
        } else {
            if (trackIndex < songs.length - 1) {
                return trackIndex + 1;
            } else if (loopWithinCategory) {
                return 0;
            }
            return null;
        }
    }, [
        trackIndex,
        isShuffled,
        shuffledIndices,
        songs.length,
        loopWithinCategory,
    ]);

    const getPrevTrackIndex = useCallback(() => {
        if (trackIndex === null) return null;

        if (isShuffled) {
            const currentShuffledIndex = shuffledIndices.indexOf(trackIndex);
            if (currentShuffledIndex > 0) {
                return shuffledIndices[currentShuffledIndex - 1];
            } else if (loopWithinCategory) {
                return shuffledIndices[shuffledIndices.length - 1];
            }
            return null;
        } else {
            if (trackIndex > 0) {
                return trackIndex - 1;
            } else if (loopWithinCategory) {
                return songs.length - 1;
            }
            return null;
        }
    }, [
        trackIndex,
        isShuffled,
        shuffledIndices,
        songs.length,
        loopWithinCategory,
    ]);

    const playNext = useCallback(() => {
        if (trackIndex === null || loopCurrentSong) {
            return;
        }

        const nextIndex = getNextTrackIndex();
        if (nextIndex !== null) {
            setTrackIndex(nextIndex);
            setIsPlaying(true);
        } else if (!loopWithinCategory) {
            // Move to next category
            setTrackIndex(0);
            setCatIndex((catIndex! + 1) % categories.length);
        }
    }, [
        trackIndex,
        loopCurrentSong,
        getNextTrackIndex,
        setTrackIndex,
        setIsPlaying,
        loopWithinCategory,
        catIndex,
        setCatIndex,
        categories.length,
    ]);

    const playPrev = useCallback(() => {
        if (trackIndex === null) {
            return;
        }

        const prevIndex = getPrevTrackIndex();
        if (prevIndex !== null) {
            setTrackIndex(prevIndex);
            setIsPlaying(true);
        } else if (!loopWithinCategory) {
            // Move to previous category
            const newCatIndex =
                (catIndex! + categories.length - 1) % categories.length;
            setCatIndex(newCatIndex);
            setTrackIndex(categories[newCatIndex][1].length - 1);
        }
    }, [
        trackIndex,
        getPrevTrackIndex,
        setTrackIndex,
        setIsPlaying,
        loopWithinCategory,
        catIndex,
        setCatIndex,
        categories,
    ]);

    const playPause = useCallback(
        (val: boolean) => {
            if (val === true) {
                playBGM(0);
            } else {
                pauseBGM(0);
            }
            setIsPlaying(val);
        },
        [setIsPlaying, playBGM, pauseBGM],
    );

    const toggleLoop = useCallback(() => {
        if (loopCurrentSong) {
            bgm?.loop(false);
        } else {
            bgm?.loop(true);
        }
        setLoopCurrentSong(!loopCurrentSong);
    }, [bgm, loopCurrentSong, setLoopCurrentSong]);

    const toggleShuffle = useCallback(() => {
        if (!isShuffled) {
            // Enable shuffle: generate shuffled indices
            const newShuffledIndices = generateShuffledIndices(songs.length);
            setShuffledIndices(newShuffledIndices);
        }
        setIsShuffled(!isShuffled);
    }, [
        isShuffled,
        generateShuffledIndices,
        songs.length,
        setShuffledIndices,
        setIsShuffled,
    ]);

    const onVolumeChange = useCallback(
        (val: number[]) => setBgmVolume(val[0]),
        [setBgmVolume],
    );

    const onSelect = useCallback(
        (cIdx: number, tIdx: number) => {
            // If clicking the currently selected and playing song, pause it
            if (cIdx === catIndex && tIdx === trackIndex && isPlaying) {
                playPause(false);
            } else {
                setCatIndex(cIdx);
                setTrackIndex(tIdx);
                playPause(true);
            }
        },
        [
            catIndex,
            trackIndex,
            isPlaying,
            setCatIndex,
            setTrackIndex,
            playPause,
        ],
    );

    // Regenerate shuffled indices when category changes
    useEffect(() => {
        if (isShuffled && songs.length > 0) {
            const newShuffledIndices = generateShuffledIndices(songs.length);
            setShuffledIndices(newShuffledIndices);
        }
    }, [
        catIndex,
        isShuffled,
        songs.length,
        generateShuffledIndices,
        setShuffledIndices,
    ]);

    useEffect(() => {
        setLoopWithinCategory(false);
    }, [setLoopWithinCategory, catIndex]);

    // Scroll into view when selection changes
    useEffect(() => {
        if (!hasSelection) return;

        const scrollToSelection = () => {
            if (!listRef.current) {
                // If ref is still null, try again on next frame
                requestAnimationFrame(scrollToSelection);
                return;
            }
            const selector = `[data-cat="${catIndex}"][data-track="${trackIndex}"]`;
            const element = listRef.current.querySelector(selector);
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
        };

        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(scrollToSelection);
    }, [catIndex, trackIndex, hasSelection, open]);

    useEffect(() => {
        if (trackIndex === null || !isPlaying) return;
        const currentTrack = songs[trackIndex];
        changeBGM(currentTrack?.sourceUrl, 0, 0);
        if (bgm) {
            bgm.loop(loopCurrentSong);
        }
    }, [trackIndex, songs, changeBGM, bgm, loopCurrentSong, isPlaying]);

    useEffect(() => {
        if (!bgm || !isPlaying) return;

        const endHandler = () => {
            if (!loopCurrentSong) {
                playNext();
            }
        };

        bgm.on("end", endHandler);
        return () => {
            bgm.off("end", endHandler);
        };
    }, [bgm, loopCurrentSong, playNext, isPlaying]);

    // Keyboard navigation, play/pause on space, left/right for changeing songs, up/down for volume
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!open) return;
            if (event.key === " ") {
                event.preventDefault();
                playPause(!isPlaying);
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                playNext();
            } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                playPrev();
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                onVolumeChange([Math.min(bgmVolume + 0.1, 1)]);
            } else if (event.key === "ArrowDown") {
                event.preventDefault();
                onVolumeChange([Math.max(bgmVolume - 0.1, 0)]);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        playPause,
        playNext,
        playPrev,
        onVolumeChange,
        bgmVolume,
        open,
        isPlaying,
    ]);

    const currentTrack = useMemo(
        () => (trackIndex !== null ? songs[trackIndex] : null),
        [songs, trackIndex],
    );

    const coverImage = useMemo(() => {
        return currentTrack?.coverUrl || "images-opt/song-chapter-2-opt.webp";
    }, [currentTrack]);

    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                if (val == false) {
                    if (!isPlaying) {
                        changeBGM(siteBgmKey!, 0, 0);
                    }
                    onClose();
                }
            }}
        >
            <DialogHeader>
                <DialogTitle className="sr-only">Music Player</DialogTitle>
                <DialogDescription className="sr-only">
                    Listen to music
                </DialogDescription>
            </DialogHeader>
            <DialogContent
                className="max-w-fit dark:bg-white/10 bg-black/10 text-gray-200 backdrop-blur-md border border-white/20"
                style={{ backgroundImage: "none" }}
                showXButtonForce={true}
                showXButton={true}
                xButtonClassName="right-1.5"
            >
                <div className="absolute inset-0 -z-10">
                    <Image
                        src={getBlurDataURL(coverImage)}
                        alt="Music Player Background"
                        fill
                        className="object-cover blur-md opacity-20"
                    />
                    {/* Dark overlay to ensure content readability */}
                    <div className="absolute inset-0 bg-black/30" />
                </div>
                <div className="flex md:flex-row flex-col items-center gap-2">
                    {/* Cover & Controls */}
                    <div className="hidden md:flex flex-col items-center gap-4 p-2 dark:bg-white/5 bg-black/30 rounded-lg">
                        <div className="relative group">
                            <Image
                                // TODO: temp no song logo, change later
                                src={
                                    currentTrack?.coverUrl ||
                                    "/images-opt/song-chapter-2-opt.webp"
                                }
                                alt={currentTrack?.title || "Select a track"}
                                placeholder={
                                    getBlurDataURL(
                                        currentTrack?.coverUrl ||
                                            "/images-opt/song-chapter-2-opt.webp",
                                    )
                                        ? "blur"
                                        : "empty"
                                }
                                blurDataURL={getBlurDataURL(
                                    currentTrack?.coverUrl ||
                                        "/images-opt/song-chapter-2-opt.webp",
                                )}
                                width={300}
                                height={300}
                                className="rounded-lg size-[300px]"
                                draggable={false}
                                title={isPlaying ? "Pause" : "Play"}
                            />
                            {/* Hover overlay with play/pause button, actually like this better with the default cursor */}
                            {currentTrack && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg hover:bg-black/50"
                                    onClick={() => playPause(!isPlaying)}
                                >
                                    {isPlaying ? (
                                        <Pause
                                            size={32}
                                            className="text-white"
                                        />
                                    ) : (
                                        <Play
                                            size={32}
                                            className="text-white"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col text-center items-center px-2 w-[300px] relative">
                            <div className="w-full flex justify-center items-center gap-1 z-10">
                                <p className="truncate font-lg font-semibold">
                                    {currentTrack?.title || t("controls.title")}
                                </p>
                                {currentTrack?.originalUrl && (
                                    <a
                                        href={currentTrack.originalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="opacity-70"
                                    >
                                        <ExternalLink
                                            size={16}
                                            stroke="white"
                                        />
                                    </a>
                                )}
                            </div>
                            <p className="text-sm opacity-70 z-10">
                                {currentTrack?.info ||
                                    t("controls.noTrackSelected")}
                            </p>
                            <AudioVisualizer className="absolute bottom-0 left-0 w-full h-12 z-0 opacity-20" />
                        </div>
                        <PlayerControls
                            bgmVolume={bgmVolume}
                            onVolumeChange={onVolumeChange}
                            isShuffled={isShuffled}
                            toggleShuffle={toggleShuffle}
                            playPrev={playPrev}
                            playPause={() => playPause(!isPlaying)}
                            isPlaying={isPlaying}
                            playNext={playNext}
                            toggleLoop={toggleLoop}
                            loopCurrentSong={loopCurrentSong}
                            currentTrack={currentTrack}
                        />
                    </div>

                    <div className="text-center flex md:hidden flex-col items-center gap-4">
                        <div className="flex flex-col items-center w-[300px] relative">
                            <div className="w-full flex justify-around items-center gap-2 z-10">
                                <span className="w-8 h-8 rounded bg-black/20 border border-white/10">
                                    <Image
                                        src={
                                            currentTrack?.coverUrl
                                                ? currentTrack.coverUrl.replace(
                                                      /\.webp$/,
                                                      "-thumb.webp",
                                                  )
                                                : "/images-opt/song-chapter-2-opt-thumb.webp"
                                        }
                                        alt={
                                            currentTrack?.title ||
                                            "ENreco Archive Jukebox"
                                        }
                                        width={32}
                                        height={32}
                                        className="object-cover w-8 h-8"
                                        draggable={false}
                                    />
                                </span>
                                <div className="flex-1 flex justify-center min-w-0">
                                    <p className="truncate font-lg font-semibold text-center w-full">
                                        {currentTrack?.title ||
                                            "ENreco Archive Jukebox"}
                                    </p>
                                </div>
                                {currentTrack?.originalUrl ? (
                                    <a
                                        href={currentTrack.originalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="opacity-70 size-8 flex items-center justify-center "
                                    >
                                        <ExternalLink
                                            size={16}
                                            stroke="white"
                                        />
                                    </a>
                                ) : (
                                    // Placeholder for when there is no original URL
                                    <div className="opacity-40 size-8 flex items-center justify-center ">
                                        <ExternalLink
                                            size={16}
                                            stroke="white"
                                        />
                                    </div>
                                )}
                            </div>
                            <p className="text-sm opacity-70 z-10 text-center">
                                {currentTrack?.info || "No track selected"}
                            </p>
                            <AudioVisualizer className="absolute bottom-0 left-0 w-full h-12 z-0 opacity-20" />
                        </div>
                        <PlayerControls
                            bgmVolume={bgmVolume}
                            onVolumeChange={onVolumeChange}
                            isShuffled={isShuffled}
                            toggleShuffle={toggleShuffle}
                            playPrev={playPrev}
                            playPause={() => playPause(!isPlaying)}
                            isPlaying={isPlaying}
                            playNext={playNext}
                            toggleLoop={toggleLoop}
                            loopCurrentSong={loopCurrentSong}
                            currentTrack={currentTrack}
                        />
                    </div>

                    {/* Song List by Category */}
                    <div
                        ref={listRef}
                        className="flex flex-col gap-2 px-2 border-y border-neutral-500 max-h-[45vh] md:max-h-[60vh] overflow-y-auto w-[80vw] md:w-[400px]"
                    >
                        {categories.map(([cat, list], cIdx) => (
                            <div key={cat}>
                                <div className="flex justify-between">
                                    <div className="px-3 pt-2 text-sm font-semibold underline underline-offset-2 opacity-70">
                                        {categoriesLabels[cat] || cat}
                                    </div>
                                    {cIdx === catIndex && (
                                        <Tooltip delayDuration={300}>
                                            <TooltipTrigger
                                                onClick={() =>
                                                    setLoopWithinCategory(
                                                        !loopWithinCategory,
                                                    )
                                                }
                                                className={cn(
                                                    "transition-opacity mr-2",
                                                    {
                                                        "opacity-100":
                                                            loopWithinCategory,
                                                        "opacity-50 hover:opacity-80":
                                                            !loopWithinCategory,
                                                    },
                                                )}
                                            >
                                                <Repeat size={14} />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {loopWithinCategory
                                                    ? "Turn off loop within category"
                                                    : "Loop within category"}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>

                                {list.map((song, tIdx) => (
                                    <TrackItem
                                        key={`${cIdx}-${tIdx}`}
                                        song={song}
                                        cIdx={cIdx}
                                        tIdx={tIdx}
                                        catIndex={catIndex}
                                        trackIndex={trackIndex}
                                        isPlaying={isPlaying}
                                        onSelect={onSelect}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewMusicPlayerModal;
