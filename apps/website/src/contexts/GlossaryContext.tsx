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

type LookupEntry = {
    categoryKey: string;
    subcategory: string;
    item: CommonItemData;
};

const categoryMap: Record<string, GlossaryPageData> = {
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
            registry[item.id] = { categoryKey, subcategory: subcat, item };
        }
    }
}

interface GlossaryContextType {
    registry: typeof registry;
    current: LookupEntry | null;
    history: LookupEntry[];
    selectItem: (entry: LookupEntry | null) => void;
    goBack: () => void;
    goHome: () => void;
    clearHistory: () => void;
}

const GlossaryContext = createContext<GlossaryContextType | null>(null);

export function GlossaryProvider({ children }: { children: ReactNode }) {
    const [current, setCurrent] = useState<LookupEntry | null>(null);
    const [history, setHistory] = useState<LookupEntry[]>([]);

    const selectItem = (entry: LookupEntry | null) => {
        setHistory((h) => (current ? [...h, current] : h));
        setCurrent(entry);
    };

    const goBack = () => {
        setHistory((h) => {
            if (h.length === 0) {
                setCurrent(null);
                return [];
            }
            const prev = h[h.length - 1];
            setCurrent(prev);
            return h.slice(0, -1);
        });
    };

    const goHome = () => {
        setCurrent(null);
        setHistory([]);
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return (
        <GlossaryContext.Provider
            value={{
                registry,
                selectItem,
                current,
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
