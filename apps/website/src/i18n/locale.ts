"use client";

const defaultLocale = "en";
const locales = ["en", "ja"];

export function getUserLocale(): string {
    if (typeof window === "undefined") return defaultLocale;
    return localStorage.getItem("locale") || defaultLocale;
}

export function setUserLocale(locale: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("locale", locale);
}

export function getValidLocale(locale: string): string {
    return locales.includes(locale) ? locale : defaultLocale;
}

export const supportedLocales = locales;
