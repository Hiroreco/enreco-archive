import React, { createContext, useContext, useState, ReactNode } from "react";
import type {
    CommonItemData,
    GlossaryPageData,
} from "@enreco-archive/common/types";
import { useLocalizedData } from "@/hooks/useLocalizedData";

export type Category =
    | "cat-weapons"
    | "cat-characters"
    | "cat-lore"
    | "cat-quests"
    | "cat-misc";

export type LookupEntry = {
    categoryKey: Category;
    subcategory: string;
    item: CommonItemData;
    scrollPosition?: number;
};

interface GlossaryContextType {
    registry: Record<string, LookupEntry>;
    currentEntry: LookupEntry | null;
    history: LookupEntry[];
    goingBack: boolean;
    homeScrollPositions: Record<Category, number>;
    selectItem: (entry: LookupEntry | null, scrollPosition?: number) => void;
    goBack: () => void;
    goHome: () => void;
    clearHistory: () => void;
    saveHomeScrollPosition: (
        category: Category,
        scrollPosition: number,
    ) => void;
    getHomeScrollPosition: (category: Category) => number;
}

const GlossaryContext = createContext<GlossaryContextType | null>(null);

export function GlossaryProvider({ children }: { children: ReactNode }) {
    const { getGlossary } = useLocalizedData();

    const categoryMap: Record<Category, GlossaryPageData> = {
        "cat-weapons": getGlossary("cat-weapons"),
        "cat-characters": getGlossary("cat-characters"),
        "cat-lore": getGlossary("cat-lore"),
        "cat-quests": getGlossary("cat-quests"),
        "cat-misc": getGlossary("cat-misc"),
    };

    // Flatten registry: id → LookupEntry
    const registry: Record<string, LookupEntry> = {};
    for (const [categoryKey, data] of Object.entries(categoryMap)) {
        for (const [subcat, items] of Object.entries(data)) {
            for (const item of items) {
                registry[item.id] = {
                    categoryKey: categoryKey as Category,
                    subcategory: subcat,
                    item,
                };
            }
        }
    }

    const [currentEntry, setCurrentEntry] = useState<LookupEntry | null>(null);
    const [history, setHistory] = useState<LookupEntry[]>([]);
    const [goingBack, setGoingBack] = useState(false);
    const [homeScrollPositions, setHomeScrollPositions] = useState<
        Record<Category, number>
    >({
        "cat-weapons": 0,
        "cat-characters": 0,
        "cat-lore": 0,
        "cat-quests": 0,
        "cat-misc": 0,
    });

    const selectItem = (
        entry: LookupEntry | null,
        scrollPosition: number = 0,
    ) => {
        setHistory((h) =>
            currentEntry ? [...h, { ...currentEntry, scrollPosition }] : h,
        );
        setCurrentEntry(entry);
        setGoingBack(false);
    };

    const goBack = () => {
        setHistory((h) => {
            if (h.length === 0) {
                setCurrentEntry(null);
                return [];
            }
            const prev = h[h.length - 1];
            setCurrentEntry(prev);
            return h.slice(0, -1);
        });
        setGoingBack(true);
    };

    const goHome = () => {
        setCurrentEntry(null);
        setHistory([]);
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const saveHomeScrollPosition = (
        category: Category,
        scrollPosition: number,
    ) => {
        setHomeScrollPositions((prev) => ({
            ...prev,
            [category]: scrollPosition,
        }));
    };

    const getHomeScrollPosition = (category: Category) => {
        return homeScrollPositions[category] || 0;
    };

    return (
        <GlossaryContext.Provider
            value={{
                goingBack,
                registry,
                selectItem,
                currentEntry,
                history,
                goBack,
                goHome,
                clearHistory,
                homeScrollPositions,
                saveHomeScrollPosition,
                getHomeScrollPosition,
            }}
        >
            {children}
        </GlossaryContext.Provider>
    );
}

export function useGlossary() {
    const ctx = useContext(GlossaryContext);
    if (!ctx) throw new Error("useGlossary must live under GlossaryProvider");
    return ctx;
}
