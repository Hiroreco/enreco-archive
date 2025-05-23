"use client";
import { ThemeType } from "@enreco-archive/common/types";
import { useEffect, useState } from "react";

export default function useLightDarkModeSwitcher(themeType: ThemeType) {
    const [useDarkMode, setUseDarkMode] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) {
            return;
        }

        const isSystemDarkMode = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;

        const isDarkMode =
            themeType === "dark" ||
            (themeType === "system" && isSystemDarkMode);
        if (typeof document !== "undefined") {
            if (isDarkMode) {
                document.documentElement.classList.add("dark");
                setUseDarkMode(true);
            } else {
                document.documentElement.classList.remove("dark");
                setUseDarkMode(false);
            }
        }

        const systemDarkModeListener = (event: MediaQueryListEvent) => {
            if (themeType === "system") {
                const isNowDarkMode = event.matches;
                setUseDarkMode(isNowDarkMode);

                if (isNowDarkMode) {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }
            }
        };
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", systemDarkModeListener);

        return () => {
            window
                .matchMedia("(prefers-color-scheme: dark)")
                .removeEventListener("change", systemDarkModeListener);
        };
    }, [themeType]);

    return useDarkMode;
}
