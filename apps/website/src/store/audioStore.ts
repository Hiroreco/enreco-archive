"use client";
import { Howl } from "howler";
import { create } from "zustand";
import { useSettingStore } from "@/store/settingStore";
import { useEffect } from "react";

interface AudioState {
    bgm: Howl | null;
    currentBgmKey: string | null;
    sfx: { [key: string]: Howl };
    bgmVolume: number;
    sfxVolume: number;
    playBGM: (fadeInDuration?: number) => void;
    stopBGM: (fadeOutDuration?: number) => void;
    playSFX: (name: string) => void;
    pauseBGM: (fadeOutDuration?: number) => void;
    setAllSfxVolume: (volume: number) => void;
    setBgmVolume: (volume: number) => void;
    changeBGM: (
        key: string,
        fadeInDuration?: number,
        fadeOutDuration?: number,
    ) => void;
    isMoomPlaying: boolean;
    setIsMoomPlaying: (isPlaying: boolean) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    bgm: null,
    currentBgmKey: null,
    sfx: {
        click: new Howl({
            src: ["/audio/sfx/sfx-click.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),

        unlock: new Howl({
            src: ["/audio/sfx/sfx-unlock.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
        book: new Howl({
            src: ["/audio/sfx/sfx-book.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
        break: new Howl({
            src: ["/audio/sfx/sfx-break.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
        explosion: new Howl({
            src: ["/audio/sfx/sfx-explosion.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
        xp: new Howl({
            src: ["/audio/sfx/sfx-xp.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
        "chicken-1": new Howl({
            src: ["/audio/sfx/sfx-chicken-1.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
        "chicken-2": new Howl({
            src: ["/audio/sfx/sfx-chicken-2.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
        "chicken-3": new Howl({
            src: ["/audio/sfx/sfx-chicken-3.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
        "chicken-pop": new Howl({
            src: ["/audio/sfx/sfx-chicken-pop.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
        moom: new Howl({
            src: ["/audio/easter/easter-moom.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
        "shiori-chicken": new Howl({
            src: ["/audio/easter/easter-shiori.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
        "easter-gura": new Howl({
            src: ["/audio/easter/easter-gura.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
        "easter-gigi": new Howl({
            src: ["/audio/easter/easter-gigi.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
        "easter-nerissa": new Howl({
            src: ["/audio/easter/easter-nerissa.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
    },
    bgmVolume: useSettingStore.getState().bgmVolume,
    sfxVolume: useSettingStore.getState().sfxVolume,
    isMoomPlaying: false,
    setIsMoomPlaying: (isPlaying: boolean) => set({ isMoomPlaying: isPlaying }),
    playBGM: (fadeInDuration = 1000) => {
        const { bgm, bgmVolume } = get();
        if (bgm && !bgm.playing()) {
            bgm.fade(0, bgmVolume, fadeInDuration);
            bgm.play();
        }
    },
    stopBGM: (fadeOutDuration = 1000) => {
        const { bgm, bgmVolume } = get();
        if (bgm) {
            bgm.fade(bgmVolume, 0, fadeOutDuration);
            setTimeout(() => bgm.stop(), fadeOutDuration);
        }
    },
    pauseBGM: (fadeOutDuration = 1000) => {
        const { bgm, bgmVolume } = get();
        if (bgm && bgm.playing()) {
            bgm.fade(bgmVolume, 0, fadeOutDuration);
            setTimeout(() => bgm.pause(), fadeOutDuration);
        }
    },
    playSFX: (name: string) => {
        const { sfx, sfxVolume } = get();
        if (!sfx[name]) {
            const sound = new Howl({
                src: [`/audio/sfx/${name}.mp3`],
                volume: sfxVolume,
            });
            sound.play();
            if (name === "moom") {
                sound.on("end", () => {
                    get().setIsMoomPlaying(false);
                });
            }
        } else {
            sfx[name].volume(sfxVolume);
            sfx[name].play();
            if (name === "moom") {
                sfx[name].once("end", () => {
                    get().setIsMoomPlaying(false);
                });
            }
        }
    },
    setAllSfxVolume: (volume: number) => {
        set({ sfxVolume: volume });
        const { sfx } = get();
        Object.values(sfx).forEach((sound) => sound.volume(volume));
    },
    setBgmVolume: (volume: number) => {
        set({ bgmVolume: volume });
        const { bgm } = get();
        if (bgm) {
            bgm.volume(volume);
        }
    },
    changeBGM: (
        newBgmSrc: string,
        fadeInDuration = 1000,
        fadeOutDuration = 2000,
    ) => {
        const { currentBgmKey } = get();
        const currentBgmKeyFromSrc =
            newBgmSrc.split("/").pop()?.split(".")[0] || null;
        if (
            currentBgmKey === currentBgmKeyFromSrc ||
            currentBgmKey === "potato"
        ) {
            return;
        }

        const { bgm, bgmVolume } = get();

        // Fade out current BGM
        if (bgm) {
            bgm.fade(bgmVolume, 0, fadeOutDuration);
            setTimeout(() => {
                bgm.unload();
            }, fadeOutDuration);
        }

        // Create and fade in new BGM
        const newBgm = new Howl({
            src: [newBgmSrc],
            loop: true,
            volume: 0,
        });
        let newBgmVolume = useSettingStore.getState().bgmVolume;
        if (newBgmSrc === "/audio/easter/easter-potato.mp3") {
            newBgmVolume = 0.5;
        }
        const newBgmKey = newBgmSrc.split("/").pop()?.split(".")[0] || null;

        set({ bgm: newBgm, bgmVolume: newBgmVolume, currentBgmKey: newBgmKey });

        setTimeout(() => {
            newBgm.play();
            newBgm.fade(0, newBgmVolume, fadeInDuration);
        }, fadeOutDuration);
    },
}));

// Sync volumes with settingStore
export const useAudioSettingsSync = () => {
    const setBgmVolume = useAudioStore((state) => state.setBgmVolume);
    const setAllSfxVolume = useAudioStore((state) => state.setAllSfxVolume);

    useEffect(() => {
        const unsubscribeBgm = useSettingStore.subscribe((state) => {
            const bgmVolume: number = state.bgmVolume;
            setBgmVolume(bgmVolume);
        });

        const unsubscribeSfx = useSettingStore.subscribe((state) => {
            const sfxVolume: number = state.sfxVolume;
            setAllSfxVolume(sfxVolume);
        });

        return () => {
            unsubscribeBgm();
            unsubscribeSfx();
        };
    }, [setBgmVolume, setAllSfxVolume]);
};
