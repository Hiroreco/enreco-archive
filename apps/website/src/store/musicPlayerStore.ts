import { create } from "zustand";

interface MusicPlayerState {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;

    catIndex: number | null;
    trackIndex: number | null;
    isPlaying: boolean;
    loopWithinCategory: boolean;
    loopCurrentSong: boolean;
    isShuffled: boolean;
    shuffledIndices: number[];

    setCatIndex: (index: number | null) => void;
    setTrackIndex: (index: number | null) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setLoopCurrentSong: (loop: boolean) => void;
    setLoopWithinCategory: (loop: boolean) => void;
    setIsShuffled: (shuffled: boolean) => void;
    setShuffledIndices: (indices: number[]) => void;
}

export const useMusicPlayerStore = create<MusicPlayerState>((set) => ({
    isOpen: false,
    setIsOpen: (open) => set({ isOpen: open }),

    catIndex: null,
    trackIndex: null,
    isPlaying: false,
    loopWithinCategory: false,
    loopCurrentSong: false,
    isShuffled: false,
    shuffledIndices: [],

    setCatIndex: (index) => set({ catIndex: index }),
    setTrackIndex: (index) => set({ trackIndex: index }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setLoopWithinCategory: (loop) => set({ loopWithinCategory: loop }),
    setLoopCurrentSong(loop) {
        set({ loopCurrentSong: loop });
    },
    setIsShuffled: (shuffled) => set({ isShuffled: shuffled }),
    setShuffledIndices: (indices) => set({ shuffledIndices: indices }),
}));
