import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ThemeType } from "@enreco-archive/common/types";

export type TimestampOption = "modal" | "tab";

interface SettingState {
    timestampOption: TimestampOption;
    setTimestampOption: (timestampOption: TimestampOption) => void;

    bgmVolume: number;
    setBgmVolume: (bgmVolume: number) => void;

    sfxVolume: number;
    setSfxVolume: (sfxVolume: number) => void;

    openDayRecapOnDayChange: boolean;
    setOpenDayRecapOnDayChange: (openDayRecapOnDayChange: boolean) => void;

    autoPanBack: boolean;
    setAutoPanBack: (autoPanBack: boolean) => void;

    themeType: ThemeType;
    setThemeType: (newThemeType: ThemeType) => void;
}

// Persists state in local storage
export const useSettingStore = create<SettingState>()(
    persist(
        (set) => ({
            timestampOption: "modal",
            setTimestampOption: (timestampOption: TimestampOption) =>
                set({ timestampOption }),

            bgmVolume: 0.5,
            setBgmVolume: (bgmVolume: number) => set({ bgmVolume }),

            sfxVolume: 0.5,
            setSfxVolume: (sfxVolume: number) => set({ sfxVolume }),

            openDayRecapOnDayChange: true,
            setOpenDayRecapOnDayChange: (openDayRecapOnDayChange: boolean) =>
                set({ openDayRecapOnDayChange }),

            autoPanBack: true,
            setAutoPanBack: (autoPanBack: boolean) => set({ autoPanBack }),

            themeType: "system",
            setThemeType: (newThemeType: ThemeType) =>
                set({ themeType: newThemeType }),
        }),
        { name: "setting" },
    ),
);
