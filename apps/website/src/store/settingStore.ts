import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ThemeType } from "@enreco-archive/common/types";

export type BackdropFilter = "blur" | "clear";
export type FontSize = "small" | "medium" | "large" | "xlarge";
export type Locale = "en" | "ja";

interface SettingState {
    backdropFilter: BackdropFilter;
    setBackdropFilter: (backdropFilter: BackdropFilter) => void;

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

    fontSize: FontSize;
    setFontSize: (fontSize: FontSize) => void;

    locale: Locale;
    setLocale: (locale: Locale) => void;
}

// Persists state in local storage
export const useSettingStore = create<SettingState>()(
    persist(
        (set) => ({
            backdropFilter: "blur",
            setBackdropFilter: (backdropFilter: BackdropFilter) =>
                set({ backdropFilter: backdropFilter }),

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

            fontSize: "medium",
            setFontSize: (fontSize: FontSize) => set({ fontSize }),

            locale: "en",
            setLocale: (language: Locale) => set({ locale: language }),
        }),
        { name: "setting" },
    ),
);
