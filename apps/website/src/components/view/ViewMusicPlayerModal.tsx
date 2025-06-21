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

// Song data structure
interface Song {
    id: number;
    title: string;
    artist: string;
    coverUrl: string;
    audioSrc: string;
}

// Define our song list
const songList: Song[] = [
    {
        id: 1,
        title: "Monster (Instrumental)",
        artist: "Enreco",
        coverUrl:
            "https://hololive.hololivepro.com/wp-content/uploads/2025/05/MONSTER.png",
        audioSrc: "/audio/songs/song-monster-ins.mp3",
    },
    {
        id: 2,
        title: "Start Again (Instrumental)",
        artist: "Enreco Archive",
        coverUrl:
            "https://hololive.hololivepro.com/wp-content/uploads/2025/05/MONSTER.png",
        audioSrc: "/audio/songs/song-start-again-ins.mp3",
    },
    {
        id: 3,
        title: "Adventure Awaits",
        artist: "Enreco Studios",
        coverUrl:
            "https://hololive.hololivepro.com/wp-content/uploads/2025/05/MONSTER.png",
        audioSrc: "/audio/songs/chapter3.mp3",
    },
    // Add more songs as needed
];

const PlayingAnimation = () => {
    return (
        <div className="flex items-end h-3 gap-[2px] ml-2">
            <div className="w-[3px] h-full bg-primary animate-music-bar-1 rounded-sm"></div>
            <div className="w-[3px] h-[70%] bg-primary animate-music-bar-2 rounded-sm"></div>
            <div className="w-[3px] h-[40%] bg-primary animate-music-bar-3 rounded-sm"></div>
        </div>
    );
};

interface MusicItemProps {
    index: number;
    title: string;
    artist: string;
    isSelected: boolean;
    isPlaying: boolean;
    onClick: () => void;
}

const MusicItem = ({
    index,
    title,
    artist,
    isSelected,
    isPlaying,
    onClick,
}: MusicItemProps) => {
    return (
        <div
            className={cn(
                "flex items-center cursor-pointer hover:dark:bg-white/10 hover:bg-black/10 transition-colors px-3 py-1.5 rounded-lg group",
                {
                    "dark:bg-white/20 bg-black/20": isSelected,
                },
            )}
            onClick={onClick}
        >
            <span className="opacity-50 h-6 w-4 flex items-center justify-center">
                {isSelected && isPlaying ? (
                    <PlayingAnimation />
                ) : (
                    <>
                        <Play className="size-3 hidden group-hover:block" />
                        <span className="group-hover:hidden">{index}</span>
                    </>
                )}
            </span>
            <span className="px-2 text-sm font-semibold grow opacity-90">
                {title}
            </span>
            <span className="text-xs opacity-50">{artist}</span>
        </div>
    );
};

interface ViewMusicPlayerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ViewMusicPlayerModal = ({
    open,
    onOpenChange,
}: ViewMusicPlayerModalProps) => {
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loop, setLoop] = useState(false);
    const [volume, setVolume] = useState(0.5);

    const audioStore = useAudioStore();
    const listRef = useRef<HTMLDivElement>(null);
    const currentSong = songList[currentSongIndex];

    // Scroll to current song
    useEffect(() => {
        if (open && listRef.current) {
            const songElement = listRef.current.children[currentSongIndex];
            if (songElement) {
                songElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }
    }, [currentSongIndex, open]);

    // Handle playing and auto-next
    useEffect(() => {
        if (!open) return;
        // Start playing current song
        audioStore.changeBGM(currentSong.audioSrc, 0, 0);

        // Set up listener for when song ends (if not looping)
        if (!loop && audioStore.bgm) {
            const handleEnd = () => {
                if (currentSongIndex < songList.length - 1) {
                    setCurrentSongIndex((prev) => prev + 1);
                } else {
                    setIsPlaying(false);
                }
            };

            audioStore.bgm.once("end", handleEnd);
            return () => {
                if (audioStore.bgm) {
                    audioStore.bgm.off("end", handleEnd);
                }
            };
        }
    }, [currentSongIndex, loop, currentSong.audioSrc]);

    // Play or pause the current song
    useEffect(() => {
        if (!open) return;
        if (isPlaying) {
            audioStore.playBGM(0);
        } else {
            audioStore.pauseBGM(0);
        }
    }, [isPlaying, audioStore]);

    // Update loop setting on BGM
    useEffect(() => {
        if (!open) return;
        if (audioStore.bgm) {
            audioStore.bgm.loop(loop);
        }
    }, [loop, audioStore.bgm]);

    // Handle volume changes
    useEffect(() => {
        if (!open) return;
        audioStore.setBgmVolume(volume);
    }, [volume]);

    const playPause = () => {
        setIsPlaying(!isPlaying);
    };

    const playNext = () => {
        if (currentSongIndex < songList.length - 1) {
            setCurrentSongIndex((prev) => prev + 1);
            if (!isPlaying) setIsPlaying(true);
        }
    };

    const playPrev = () => {
        if (currentSongIndex > 0) {
            setCurrentSongIndex((prev) => prev - 1);
            if (!isPlaying) setIsPlaying(true);
        }
    };

    const toggleLoop = () => {
        setLoop(!loop);
    };

    const handleSongSelect = (index: number) => {
        setCurrentSongIndex(index);
        setIsPlaying(true);
    };

    const handleVolumeChange = (value: number[]) => {
        setVolume(value[0]);
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
                className="max-w-fit items-card"
                style={{ backgroundImage: "none" }}
            >
                <div className="flex md:flex-row flex-col items-center gap-2">
                    <div className="flex flex-col items-center gap-4 p-4 w-[300px] bg-background/50 rounded-lg">
                        <Image
                            src={currentSong.coverUrl}
                            alt={`${currentSong.title} by ${currentSong.artist}`}
                            width={300}
                            height={300}
                            className="rounded-lg"
                            draggable={false}
                        />

                        <div className="text-center w-full px-2">
                            <h3 className="font-bold text-lg truncate">
                                {currentSong.title}
                            </h3>
                            <p className="text-sm opacity-70">
                                {currentSong.artist}
                            </p>
                        </div>

                        <div className="flex items-center justify-between w-full px-2">
                            <div className="flex items-center gap-2">
                                <Volume2 size={16} />
                                <Slider
                                    className="w-16"
                                    value={[volume]}
                                    max={1}
                                    step={0.01}
                                    onValueChange={handleVolumeChange}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={playPrev}
                                    className="hover:opacity-80 transition-opacity"
                                    disabled={currentSongIndex === 0}
                                >
                                    <ChevronFirst
                                        className={cn({
                                            "opacity-50":
                                                currentSongIndex === 0,
                                        })}
                                    />
                                </button>
                                <button
                                    onClick={playPause}
                                    className="hover:opacity-80 transition-opacity"
                                >
                                    {isPlaying ? <Pause /> : <Play />}
                                </button>
                                <button
                                    onClick={playNext}
                                    className="hover:opacity-80 transition-opacity"
                                    disabled={
                                        currentSongIndex === songList.length - 1
                                    }
                                >
                                    <ChevronLast
                                        className={cn({
                                            "opacity-50":
                                                currentSongIndex ===
                                                songList.length - 1,
                                        })}
                                    />
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

                    <div
                        ref={listRef}
                        className="flex flex-col gap-2 px-2 max-h-[30vh] md:max-h-[60vh] overflow-x-hidden overflow-y-auto w-[80vw] md:w-[400px]"
                    >
                        {songList.map((song, index) => (
                            <MusicItem
                                key={song.id}
                                index={index + 1}
                                title={song.title}
                                artist={song.artist}
                                isSelected={index === currentSongIndex}
                                isPlaying={
                                    index === currentSongIndex && isPlaying
                                }
                                onClick={() => handleSongSelect(index)}
                            />
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewMusicPlayerModal;
