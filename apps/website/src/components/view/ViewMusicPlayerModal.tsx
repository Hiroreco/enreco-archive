import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@enreco-archive/common-ui/components/tooltip";
import { SONGS } from "@/lib/misc";
import { useAudioStore } from "@/store/audioStore";
import { useMusicPlayerStore } from "@/store/musicPlayerStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { Slider } from "@enreco-archive/common-ui/components/slider";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { Song } from "@enreco-archive/common/types";
import {
    ChevronFirst,
    ChevronLast,
    Pause,
    Play,
    Repeat,
    Volume2,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef } from "react";
import AudioVisualizer from "@/components/view/ViewAudioVisualizer";

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
}: TrackItemProps) => (
    <div key={`${cIdx}-${tIdx}`} data-cat={cIdx} data-track={tIdx}>
        <div
            className={cn(
                "flex items-center cursor-pointer hover:dark:bg-white/10 hover:bg-black/10 transition-colors px-3 py-1.5 rounded-lg group",
                {
                    "dark:bg-white/20 bg-black/20":
                        cIdx === catIndex && tIdx === trackIndex,
                },
            )}
            onClick={() => onSelect(cIdx, tIdx)}
        >
            <span className="opacity-50 h-6 w-4 flex items-center justify-center">
                {cIdx === catIndex && tIdx === trackIndex && isPlaying ? (
                    <PlayingAnimation />
                ) : (
                    <>
                        <Play className="size-3 hidden group-hover:block" />
                        <span className="group-hover:hidden">{tIdx + 1}</span>
                    </>
                )}
            </span>
            <span className="px-2 text-sm font-semibold grow opacity-90">
                {song.title}
            </span>

            <span className="text-xs opacity-50 ml-2">{song.duration}</span>
        </div>
    </div>
);

const categories = Object.entries(SONGS);
const categoriesLabels: Record<string, string> = {
    enreco: "Official Themes",
    ingame: "In-Game Music",
    stream: "Talent-used Music",
    talent: "Hero Themes",
    instrumental: "Instrumental",
};

interface ViewMusicPlayerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ViewMusicPlayerModal = ({
    open,
    onOpenChange,
}: ViewMusicPlayerModalProps) => {
    const {
        catIndex,
        setCatIndex,
        trackIndex,
        setTrackIndex,
        isPlaying,
        setIsPlaying,
        loopWithinCategory,
        setLoopWithinCategory,
        loopCurrentSong,
        setLoopCurrentSong,
    } = useMusicPlayerStore();

    const { changeBGM, bgm, playBGM, pauseBGM, bgmVolume, setBgmVolume } =
        useAudioStore();
    const listRef = useRef<HTMLDivElement>(null);

    const hasSelection = catIndex !== null && trackIndex !== null;
    const [, songs] = hasSelection ? categories[catIndex!] : ["", []];

    const playNext = useCallback(() => {
        if (trackIndex === null || loopCurrentSong) {
            return;
        }
        if (trackIndex < songs.length - 1) {
            setTrackIndex(trackIndex + 1);
            setIsPlaying(true);
        } else if (loopWithinCategory) {
            setTrackIndex(0);
            setIsPlaying(true);
        } else {
            setTrackIndex(0);
            setCatIndex((catIndex! + 1) % categories.length);
        }
    }, [
        trackIndex,
        loopCurrentSong,
        setTrackIndex,
        songs,
        setIsPlaying,
        catIndex,
        setCatIndex,
        loopWithinCategory,
    ]);

    const playPrev = () => {
        if (trackIndex === null || loopCurrentSong) {
            return;
        }

        if (trackIndex > 0) {
            setTrackIndex(trackIndex! - 1);
            setIsPlaying(true);
        } else if (loopWithinCategory) {
            setTrackIndex(songs.length - 1);
            setIsPlaying(true);
        } else {
            const newCatIndex = (catIndex! + 1) % categories.length;
            setCatIndex(newCatIndex);
            setTrackIndex(categories[newCatIndex].length - 1);
        }
    };

    const playPause = () => {
        setIsPlaying(!isPlaying);
        if (isPlaying) {
            pauseBGM(0);
        } else {
            playBGM(0);
        }
    };

    const toggleLoop = () => {
        if (loopCurrentSong) {
            bgm?.loop(false);
        } else {
            bgm?.loop(true);
        }
        setLoopCurrentSong(!loopCurrentSong);
    };
    const onVolumeChange = (val: number[]) => setBgmVolume(val[0]);

    const onSelect = (cIdx: number, tIdx: number) => {
        setCatIndex(cIdx);
        setTrackIndex(tIdx);
        setIsPlaying(true);
    };

    // Scroll into view when selection changes
    useEffect(() => {
        if (!listRef.current || !hasSelection) return;
        const selector = `[data-cat="${catIndex}"][data-track="${trackIndex}"]`;
        listRef.current
            .querySelector(selector)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [catIndex, trackIndex, hasSelection]);

    useEffect(() => {
        if (trackIndex === null) return;
        const currentTrack = songs[trackIndex];
        changeBGM(currentTrack?.sourceUrl, 0, 0);

        if (bgm) {
            bgm.loop(loopCurrentSong);
        }
    }, [trackIndex, songs, changeBGM, bgm, loopCurrentSong]);

    useEffect(() => {
        if (!bgm) return;

        const endHandler = () => {
            if (!loopCurrentSong) {
                playNext();
            }
        };

        bgm.on("end", endHandler);
        return () => {
            bgm.off("end", endHandler);
        };
    }, [bgm, loopCurrentSong, playNext]);

    const currentTrack = useMemo(
        () => (trackIndex !== null ? songs[trackIndex] : null),
        [songs, trackIndex],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogHeader>
                <DialogTitle className="sr-only">Music Player</DialogTitle>
                <DialogDescription className="sr-only">
                    Listen to music
                </DialogDescription>
            </DialogHeader>
            <DialogContent
                className="max-w-fit dark:bg-white/10 bg-black/10 text-gray-200 backdrop-blur-md border border-white/20 shadow-lg"
                style={{ backgroundImage: "none" }}
            >
                <div className="flex md:flex-row flex-col items-center gap-2">
                    {/* Cover & Controls */}
                    <div className="flex flex-col items-center gap-4 p-2 dark:bg-white/50 bg-black/30 rounded-lg">
                        <Image
                            // TODO: temp no song logo, change later
                            src={
                                currentTrack?.coverUrl ||
                                "/images-opt/logo-1.webp"
                            }
                            alt={currentTrack?.title || "Select a track"}
                            width={300}
                            height={300}
                            className="rounded-lg md:size-[300px] size-[250px]"
                            draggable={false}
                        />
                        <div className="text-center grow px-2 md:w-[300px] w-[250px] relative">
                            <p className="truncate font-lg font-semibold">
                                {currentTrack?.title || "Select a track"}
                            </p>
                            {currentTrack?.info && (
                                <p className="text-sm opacity-70">
                                    {currentTrack.info}
                                </p>
                            )}
                            <AudioVisualizer className="absolute bottom-0 left-0 w-full h-8 z-0 opacity-20" />
                        </div>
                        <div className="flex items-center justify-between w-full px-2">
                            <div className="flex items-center gap-2">
                                <Volume2 size={16} />
                                <Slider
                                    className="w-16"
                                    value={[bgmVolume]}
                                    max={1}
                                    step={0.01}
                                    onValueChange={onVolumeChange}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={playPrev}
                                    disabled={!currentTrack}
                                    className="hover:opacity-80 transition-opacity"
                                >
                                    <ChevronFirst />
                                </button>
                                <button
                                    onClick={playPause}
                                    disabled={!currentTrack}
                                    className="hover:opacity-80 transition-opacity"
                                >
                                    {isPlaying ? <Pause /> : <Play />}
                                </button>
                                <button
                                    onClick={playNext}
                                    disabled={!currentTrack}
                                    className="hover:opacity-80 transition-opacity"
                                >
                                    <ChevronLast />
                                </button>
                            </div>
                            <button
                                onClick={toggleLoop}
                                className={cn("transition-opacity", {
                                    "opacity-100": loopCurrentSong,
                                    "opacity-50 hover:opacity-80":
                                        !loopCurrentSong,
                                })}
                            >
                                <Repeat size={16} />
                            </button>
                        </div>
                    </div>

                    <Separator className="md:hidden w-full opacity-50" />
                    {/* Song List by Category */}
                    <div
                        ref={listRef}
                        className="flex flex-col gap-2 px-2 max-h-[40vh] md:max-h-[60vh] overflow-y-auto w-[80vw] md:w-[400px]"
                    >
                        {categories.map(([cat, list], cIdx) => (
                            <div key={cat}>
                                <div className="flex justify-between">
                                    <div className="px-3 pt-2 text-sm font-semibold underline underline-offset-2 opacity-70">
                                        {categoriesLabels[cat] || cat}
                                    </div>
                                    {cIdx === 0 && (
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
                                                Loop within category
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
