import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import {
    ChevronFirst,
    ChevronLast,
    Pause,
    Play,
    Repeat,
    Volume2,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useAudioStore } from "@/store/audioStore";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { Slider } from "@enreco-archive/common-ui/components/slider";
import { SONGS } from "@/lib/misc";

const PlayingAnimation = () => (
    <div className="flex items-end h-3 gap-[2px]">
        <div className="w-[3px] h-full bg-gray-200 animate-music-bar-1 rounded-sm" />
        <div className="w-[3px] h-[70%] bg-gray-200 animate-music-bar-2 rounded-sm" />
        <div className="w-[3px] h-[40%] bg-gray-200 animate-music-bar-3 rounded-sm" />
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
    // State persists across opens; no selection initially
    const [catIndex, setCatIndex] = useState<number | null>(null);
    const [trackIndex, setTrackIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loop, setLoop] = useState(false);
    const [volume, setVolume] = useState(0.5);

    const audioStore = useAudioStore();
    const listRef = useRef<HTMLDivElement>(null);

    const hasSelection = catIndex !== null && trackIndex !== null;
    const [categoryName, songs] = hasSelection
        ? categories[catIndex!]
        : ["", []];
    const currentTrack = hasSelection ? songs[trackIndex!] : null;

    // Scroll into view when selection changes
    useEffect(() => {
        if (!open || !listRef.current || !hasSelection) return;
        const selector = `[data-cat="${catIndex}"][data-track="${trackIndex}"]`;
        listRef.current
            .querySelector(selector)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [catIndex, trackIndex, open, hasSelection]);

    // Load track and auto-next/loop within category
    useEffect(() => {
        if (!open || !currentTrack) return;
        audioStore.changeBGM(currentTrack.sourceUrl, 0, 0);
        const endHandler = () => {
            if (trackIndex! < songs.length - 1) {
                setTrackIndex((i) => i! + 1);
                setIsPlaying(true);
            } else if (loop) {
                setTrackIndex(0);
                setIsPlaying(true);
            } else {
                setIsPlaying(false);
            }
        };
        audioStore.bgm?.once("end", endHandler);
    }, [catIndex, trackIndex, loop, currentTrack, open]);

    // Play/pause effect
    useEffect(() => {
        if (!open || !currentTrack) return;
        isPlaying ? audioStore.playBGM(0) : audioStore.pauseBGM(0);
    }, [isPlaying, open, currentTrack]);

    // Loop flag effect
    useEffect(() => {
        if (!open || !currentTrack) return;
        audioStore.bgm?.loop(loop);
    }, [loop, open, currentTrack]);

    // Volume effect
    useEffect(() => {
        if (!open || !currentTrack) return;
        audioStore.setBgmVolume(volume);
    }, [volume, open, currentTrack]);

    const playPause = () => setIsPlaying((p) => !p);
    const playNext = () => {
        if (!currentTrack) return;
        if (trackIndex! < songs.length - 1) {
            setTrackIndex((i) => i! + 1);
            setIsPlaying(true);
        } else if (loop) {
            setTrackIndex(0);
            setIsPlaying(true);
        }
    };
    const playPrev = () => {
        if (!currentTrack) return;
        if (trackIndex! > 0) {
            setTrackIndex((i) => i! - 1);
            setIsPlaying(true);
        } else if (loop) {
            setTrackIndex(songs.length - 1);
            setIsPlaying(true);
        }
    };
    const toggleLoop = () => setLoop((l) => !l);
    const onVolumeChange = (val: number[]) => setVolume(val[0]);

    const onSelect = (cIdx: number, tIdx: number) => {
        setCatIndex(cIdx);
        setTrackIndex(tIdx);
        setIsPlaying(true);
    };

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
                    <div className="flex flex-col items-center gap-4 p-4 w-[300px] dark:bg-white/50 bg-black/30 rounded-lg">
                        <Image
                            src={
                                currentTrack?.coverUrl ||
                                "/images-opt/logo-1.webp"
                            }
                            alt={currentTrack?.title || "Select a track"}
                            width={300}
                            height={300}
                            className="rounded-lg"
                            draggable={false}
                        />
                        <div className="text-center w-full px-2">
                            <p className="truncate font-lg font-semibold">
                                {currentTrack?.title || "Select a track"}
                            </p>
                            {currentTrack?.info && (
                                <p className="text-sm opacity-70">
                                    {currentTrack.info}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center justify-between w-full px-2">
                            <div className="flex items-center gap-2">
                                <Volume2 size={16} />
                                <Slider
                                    className="w-16"
                                    value={[volume]}
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
                                className={cn(
                                    "hover:opacity-80 transition-all",
                                    {
                                        "text-primary": loop,
                                        "opacity-50": !loop,
                                    },
                                )}
                            >
                                <Repeat size={16} />
                            </button>
                        </div>
                    </div>

                    <Separator className="md:hidden w-full" />

                    {/* Song List by Category */}
                    <div
                        ref={listRef}
                        className="flex flex-col gap-2 px-2 max-h-[60vh] overflow-auto w-[80vw] md:w-[400px]"
                    >
                        {categories.map(([cat, list], cIdx) => (
                            <div key={cat}>
                                <h4 className="px-3 pt-2 text-xs opacity-70">
                                    {categoriesLabels[cat] || cat}
                                </h4>
                                {list.map((song, tIdx) => (
                                    <div
                                        key={`${cIdx}-${tIdx}`}
                                        data-cat={cIdx}
                                        data-track={tIdx}
                                    >
                                        <div
                                            className={cn(
                                                "flex items-center cursor-pointer hover:dark:bg-white/10 hover:bg-black/10 transition-colors px-3 py-1.5 rounded-lg group",
                                                {
                                                    "dark:bg-white/20 bg-black/20":
                                                        cIdx === catIndex &&
                                                        tIdx === trackIndex,
                                                },
                                            )}
                                            onClick={() => onSelect(cIdx, tIdx)}
                                        >
                                            <span className="opacity-50 h-6 w-4 flex items-center justify-center">
                                                {cIdx === catIndex &&
                                                tIdx === trackIndex &&
                                                isPlaying ? (
                                                    <PlayingAnimation />
                                                ) : (
                                                    <>
                                                        <Play className="size-3 hidden group-hover:block" />
                                                        <span className="group-hover:hidden">
                                                            {tIdx + 1}
                                                        </span>
                                                    </>
                                                )}
                                            </span>
                                            <span className="px-2 text-sm font-semibold grow opacity-90">
                                                {song.title}
                                            </span>
                                            {song.info && (
                                                <span className="text-xs opacity-50">
                                                    {song.info}
                                                </span>
                                            )}
                                            <span className="text-xs opacity-50 ml-2">
                                                {song.duration}
                                            </span>
                                        </div>
                                    </div>
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
