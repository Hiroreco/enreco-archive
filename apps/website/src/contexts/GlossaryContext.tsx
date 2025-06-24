import React, { createContext, useContext, useState, ReactNode } from "react";
import type {
    CommonItemData,
    GlossaryPageData,
} from "@enreco-archive/common/types";
import weapons from "#/glossary/weapons.json";
import characters from "#/glossary/characters.json";
import lore from "#/glossary/lore.json";
import quests from "#/glossary/quests.json";
import misc from "#/glossary/misc.json";

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

const categoryMap: Record<Category, GlossaryPageData> = {
    "cat-weapons": weapons,
    "cat-characters": characters,
    "cat-lore": lore,
    "cat-quests": quests,
    "cat-misc": misc,
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

interface GlossaryContextType {
    registry: typeof registry;
    currentEntry: LookupEntry | null;
    history: LookupEntry[];
    goingBack: boolean;
    selectItem: (entry: LookupEntry | null, scrollPosition?: number) => void;
    goBack: () => void;
    goHome: () => void;
    clearHistory: () => void;
}

const GlossaryContext = createContext<GlossaryContextType | null>(null);

export function GlossaryProvider({ children }: { children: ReactNode }) {
    const [currentEntry, setCurrentEntry] = useState<LookupEntry | null>(null);
    const [history, setHistory] = useState<LookupEntry[]>([]);
    const [goingBack, setGoingBack] = useState(false);

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
