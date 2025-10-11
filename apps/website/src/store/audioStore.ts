"use client";
import { Howl } from "howler";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSettingStore } from "@/store/settingStore";
import { useEffect } from "react";
import { EasterEggState, TextAudioState } from "@enreco-archive/common/types";
import easterEggSounds from "#/easterEggSounds.json";
import { LS_KEYS } from "@/lib/constants";

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
    siteBgmKey: string | null;
    setSiteBgmKey: (key: string) => void;
    textAudioState: TextAudioState;
    playTextAudio: (textId: string) => void;
    stopTextAudio: () => void;
    isMoomPlaying: boolean;
    setIsMoomPlaying: (isPlaying: boolean) => void;
    isLizPlaying: boolean;
    setIsLizPlaying: (isPlaying: boolean) => void;
}

// Separate store for easter egg persistence
interface EasterEggPersistState {
    easterEggPlayedSounds: { [key: string]: number[] };
    addPlayedSound: (eggName: string, soundIndex: number) => void;
    resetEgg: (eggName: string) => void;
    getPlayedSounds: (eggName: string) => Set<number>;
}

// Persistent easter egg store
export const useEasterEggPersistStore = create<EasterEggPersistState>()(
    persist(
        (set, get) => ({
            easterEggPlayedSounds: {},

            addPlayedSound: (eggName: string, soundIndex: number) => {
                set((state) => ({
                    easterEggPlayedSounds: {
                        ...state.easterEggPlayedSounds,
                        [eggName]: [
                            ...(state.easterEggPlayedSounds[eggName] || []),
                            soundIndex,
                        ],
                    },
                }));
            },

            resetEgg: (eggName: string) => {
                set((state) => ({
                    easterEggPlayedSounds: {
                        ...state.easterEggPlayedSounds,
                        [eggName]: [],
                    },
                }));
            },

            getPlayedSounds: (eggName: string) => {
                const sounds = get().easterEggPlayedSounds[eggName] || [];
                return new Set(sounds);
            },
        }),
        {
            name: LS_KEYS.EASTER_EGG_STORAGE_KEY,
            // Only persist the played sounds data
            partialize: (state) => ({
                easterEggPlayedSounds: state.easterEggPlayedSounds,
            }),
        },
    ),
);

// Main audio store (non-persistent runtime state)
export const useAudioStore = create<
    AudioState & {
        easterEggStates: { [key: string]: EasterEggState };
        playEasterEgg: (eggName: string) => void;
        stopEasterEgg: (eggName: string) => void;
        initializeEasterEgg: (eggName: string) => void;
        cleanupEasterEgg: (eggName: string) => void;
    }
>((set, get) => ({
    bgm: null,
    currentBgmKey: null,
    siteBgmKey: null,
    easterEggStates: {},
    textAudioState: {
        isPlaying: false,
        currentTextId: null,
    },
    isMoomPlaying: false,
    isLizPlaying: false,

    setSiteBgmKey: (key: string) => set({ siteBgmKey: key }),
    setIsMoomPlaying: (isPlaying: boolean) => set({ isMoomPlaying: isPlaying }),
    setIsLizPlaying: (isPlaying: boolean) => set({ isLizPlaying: isPlaying }),

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
        "easter-awoo": new Howl({
            src: ["/audio/easter/easter-awoo.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
        "easter-ame": new Howl({
            src: ["/audio/easter/ame/easter-ame-0.mp3"],
            volume: useSettingStore.getState().sfxVolume,
        }),
    },
    bgmVolume: useSettingStore.getState().bgmVolume,
    sfxVolume: useSettingStore.getState().sfxVolume,

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
        console.trace("AudioStore: pauseBGM called");
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
                src: [`/audio/${name}.mp3`],
                volume: sfxVolume,
            });
            sound.play();
            set({ sfx: { ...sfx, [name]: sound } });
        } else {
            sfx[name].volume(sfxVolume);
            sfx[name].play();
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

        if (bgm) {
            bgm.fade(bgmVolume, 0, fadeOutDuration);
            setTimeout(() => {
                bgm.unload();
            }, fadeOutDuration);
        }

        const newBgm = new Howl({
            src: [newBgmSrc],
            loop: true,
            volume: 0,
        });
        let newBgmVolume = bgmVolume;
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

    initializeEasterEgg: (eggName: string) => {
        const { easterEggStates } = get();
        if (
            !easterEggStates[eggName] &&
            easterEggSounds[eggName as keyof typeof easterEggSounds]
        ) {
            // Get played sounds from persistent store
            const playedSounds = useEasterEggPersistStore
                .getState()
                .getPlayedSounds(eggName);

            set({
                easterEggStates: {
                    ...easterEggStates,
                    [eggName]: {
                        isPlaying: false,
                        currentSoundIndex: -1,
                        playedSounds: playedSounds,
                    },
                },
            });
        }
    },

    playEasterEgg: (eggName: string) => {
        const { easterEggStates, sfx, sfxVolume, playSFX } = get();
        const eggConfig =
            easterEggSounds[eggName as keyof typeof easterEggSounds];

        if (
            !eggConfig ||
            !easterEggStates[eggName] ||
            easterEggStates[eggName].isPlaying
        ) {
            return;
        }

        const eggState = easterEggStates[eggName];
        const availableSounds = eggConfig.sfxList
            .map((_, index) => index)
            .filter((index) => !eggState.playedSounds.has(index));

        // If all sounds have been played, reset
        if (availableSounds.length === 0) {
            useEasterEggPersistStore.getState().resetEgg(eggName);
            eggState.playedSounds.clear();
            availableSounds.push(...eggConfig.sfxList.map((_, index) => index));
        }

        const randomIndex =
            availableSounds[Math.floor(Math.random() * availableSounds.length)];
        const soundPath = eggConfig.sfxList[randomIndex];

        // Update runtime state to playing
        set({
            easterEggStates: {
                ...easterEggStates,
                [eggName]: {
                    ...eggState,
                    isPlaying: true,
                    currentSoundIndex: randomIndex,
                },
            },
        });

        playSFX("chicken-pop");

        // Play the easter egg sound after 1 second
        setTimeout(() => {
            let sound = sfx[soundPath];

            if (!sound) {
                sound = new Howl({
                    src: [`/audio/${soundPath}.mp3`],
                    volume: sfxVolume,
                });
                set({ sfx: { ...get().sfx, [soundPath]: sound } });
            } else {
                sound.volume(sfxVolume);
            }

            sound.once("end", () => {
                const currentStates = get().easterEggStates;
                const currentEggState = currentStates[eggName];

                // Update runtime state
                const updatedPlayedSounds = new Set([
                    ...currentEggState.playedSounds,
                    randomIndex,
                ]);

                set({
                    easterEggStates: {
                        ...currentStates,
                        [eggName]: {
                            ...currentEggState,
                            isPlaying: false,
                            playedSounds: updatedPlayedSounds,
                        },
                    },
                });

                // Save to persistent store
                useEasterEggPersistStore
                    .getState()
                    .addPlayedSound(eggName, randomIndex);
            });

            sound.play();
        }, 1000);
    },

    stopEasterEgg: (eggName: string) => {
        const { easterEggStates, sfx } = get();
        const eggConfig =
            easterEggSounds[eggName as keyof typeof easterEggSounds];

        if (!eggConfig || !easterEggStates[eggName]) return;

        const eggState = easterEggStates[eggName];

        if (eggState.currentSoundIndex >= 0) {
            const soundPath = eggConfig.sfxList[eggState.currentSoundIndex];
            const sound = sfx[soundPath];
            if (sound && sound.playing()) {
                sound.stop();
            }
        }

        set({
            easterEggStates: {
                ...easterEggStates,
                [eggName]: {
                    ...eggState,
                    isPlaying: false,
                    currentSoundIndex: -1,
                },
            },
        });
    },

    cleanupEasterEgg: (eggName: string) => {
        // Only stop the audio, preserve the state and persistent data
        get().stopEasterEgg(eggName);
    },

    playTextAudio: (textId: string) => {
        const { textAudioState, sfx, sfxVolume } = get();

        if (textAudioState.isPlaying) {
            return;
        }

        const audioPath = `text/${textId}`;

        set({
            textAudioState: {
                isPlaying: true,
                currentTextId: textId,
            },
        });

        let sound = sfx[audioPath];

        if (!sound) {
            sound = new Howl({
                src: [`/audio/text/${textId}.mp3`],
                volume: sfxVolume,
                onloaderror: () => {
                    console.warn(`Failed to load audio for text: ${textId}`);
                    set({
                        textAudioState: {
                            isPlaying: false,
                            currentTextId: null,
                        },
                    });
                },
            });
            set({ sfx: { ...get().sfx, [audioPath]: sound } });
        } else {
            sound.volume(sfxVolume);
        }

        sound.once("end", () => {
            set({
                textAudioState: {
                    isPlaying: false,
                    currentTextId: null,
                },
            });
        });

        sound.play();
    },

    stopTextAudio: () => {
        const { textAudioState, sfx } = get();

        if (!textAudioState.isPlaying || !textAudioState.currentTextId) {
            return;
        }

        const audioPath = `text/${textAudioState.currentTextId}`;
        const sound = sfx[audioPath];

        if (sound && sound.playing()) {
            sound.stop();
        }

        set({
            textAudioState: {
                isPlaying: false,
                currentTextId: null,
            },
        });
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
