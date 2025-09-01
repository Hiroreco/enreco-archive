import {
    Chapter,
    ChapterRecapData,
    GlossaryPageData,
    SiteData,
    Song,
    TextData,
} from "@enreco-archive/common/types";
import siteMeta from "#/metadata.json";

import chapter0_en from "#/chapter0.json";
import chapter1_en from "#/chapter1.json";
import chapter0_ja from "#/chapter0_ja.json";
import chapter1_ja from "#/chapter1_ja.json";

import textData_en from "#/text-data.json";
import textData_ja from "#/text-data_ja.json";

import weapons_en from "#/glossary/weapons.json";
import weapons_ja from "#/glossary/weapons_ja.json";
import characters_en from "#/glossary/characters.json";
import characters_ja from "#/glossary/characters_ja.json";
import lore_en from "#/glossary/lore.json";
import lore_ja from "#/glossary/lore_ja.json";
import quests_en from "#/glossary/quests.json";
import quests_ja from "#/glossary/quests_ja.json";
import misc_en from "#/glossary/misc.json";
import misc_ja from "#/glossary/misc_ja.json";

import songs_en from "#/songs.json";
import songs_ja from "#/songs_ja.json";

import chapterRecaps_en from "#/chapter-recaps.json";
import chapterRecaps_ja from "#/chapter-recaps_ja.json";

import changelogs_en from "#/changelogs.json";
import changelogs_ja from "#/changelogs_ja.json";

import { Locale } from "@/store/settingStore";
import { Category } from "@/contexts/GlossaryContext";

interface LocalizedData {
    chapters: Chapter[];
    textData: TextData;
    glossary: {
        weapons: GlossaryPageData;
        characters: GlossaryPageData;
        lore: GlossaryPageData;
        quests: GlossaryPageData;
        misc: GlossaryPageData;
    };
    songs: Record<string, Song[]>;
    chapterRecap: ChapterRecapData;
    changelogs: Array<{
        date: string;
        content: string;
    }>;
}

const DATA: Record<Locale, LocalizedData> = {
    en: {
        chapters: [chapter0_en as Chapter, chapter1_en as Chapter],
        textData: textData_en as TextData,
        glossary: {
            weapons: weapons_en,
            characters: characters_en,
            lore: lore_en,
            quests: quests_en,
            misc: misc_en,
        },
        songs: songs_en,
        chapterRecap: chapterRecaps_en,
        changelogs: changelogs_en,
    },
    ja: {
        chapters: [chapter0_ja as Chapter, chapter1_ja as Chapter],
        textData: textData_ja as TextData,
        glossary: {
            weapons: weapons_ja,
            characters: characters_ja,
            lore: lore_ja,
            quests: quests_ja,
            misc: misc_ja,
        },
        songs: songs_ja,
        chapterRecap: chapterRecaps_ja,
        changelogs: changelogs_ja,
    },
};

export const getChapterData = (
    locale: Locale,
    chapterIndex: number,
): Chapter => {
    return DATA[locale].chapters[chapterIndex];
};

export const getTextData = (locale: Locale): TextData => {
    return DATA[locale].textData;
};

const CATEGORY_KEY_MAP: Record<Category, keyof LocalizedData["glossary"]> = {
    "cat-weapons": "weapons",
    "cat-characters": "characters",
    "cat-lore": "lore",
    "cat-quests": "quests",
    "cat-misc": "misc",
};

export const getGlossaryData = (locale: Locale, category: Category) => {
    const key = CATEGORY_KEY_MAP[category];
    return DATA[locale].glossary[key];
};

export const getSongsData = (locale: Locale) => {
    return DATA[locale].songs;
};

export const getSiteData = (locale: Locale): SiteData => {
    return {
        version: siteMeta.version,
        numberOfChapters: siteMeta.numChapters,
        event: "ENigmatic Recollection",
        chapters: {
            [locale]: DATA[locale].chapters,
        },
    };
};

export const getTextItem = (locale: Locale, textId: string) => {
    return DATA[locale].textData[textId];
};

export const getChapterRecap = (locale: Locale) => {
    return DATA[locale].chapterRecap;
};

export const getChangelog = (locale: Locale) => {
    return DATA[locale].changelogs;
};
