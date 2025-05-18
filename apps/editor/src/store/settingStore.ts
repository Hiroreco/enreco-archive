import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimestampOption = "modal" | "tab";
export type ThemeType = "system" | "light" | "dark";

interface SettingState {
    themeType: ThemeType;
    setThemeType: (newThemeType: ThemeType) => void;
}

// Persists state in local storage
export const useSettingStore = create<SettingState>()(
    persist(
        (set) => ({
            themeType: "system",
            setThemeType: (newThemeType: ThemeType) =>
                set({ themeType: newThemeType }),
        }),
        { name: "setting" },
    ),
);
