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
    selectItem: (entry: LookupEntry | null) => void;
    selected: LookupEntry | null;
}

const GlossaryContext = createContext<GlossaryContextType | null>(null);

export function GlossaryProvider({ children }: { children: ReactNode }) {
    const [selected, setSelected] = useState<LookupEntry | null>(null);
    const selectItem = (entry: LookupEntry | null) => setSelected(entry);

    return (
        <GlossaryContext.Provider value={{ registry, selectItem, selected }}>
            {children}
        </GlossaryContext.Provider>
    );
}

export function useGlossary() {
    const ctx = useContext(GlossaryContext);
    if (!ctx) throw new Error("useGlossary must live under GlossaryProvider");
    return ctx;
}
