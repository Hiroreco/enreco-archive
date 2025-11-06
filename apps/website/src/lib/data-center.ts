import siteMeta from "#/metadata.json";
import {
    Chapter,
    ChapterRecapData,
    GlossaryPageData,
    MediaType,
    SiteData,
    Song,
    TextData,
} from "@enreco-archive/common/types";

import chapter0_en from "#/en/chapter0_en.json";
import chapter1_en from "#/en/chapter1_en.json";
// import chapter2_en from "#/en/chapter2_en.json";
import chapter0_ja from "#/ja/chapter0_ja.json";
import chapter1_ja from "#/ja/chapter1_ja.json";

import textData_en from "#/en/text-data_en.json";
import textData_ja from "#/ja/text-data_ja.json";

import characters_en from "#/en/glossary/characters_en.json";
import lore_en from "#/en/glossary/lore_en.json";
import misc_en from "#/en/glossary/misc_en.json";
import quests_en from "#/en/glossary/quests_en.json";
import weapons_en from "#/en/glossary/weapons_en.json";
import characters_ja from "#/ja/glossary/characters_ja.json";
import lore_ja from "#/ja/glossary/lore_ja.json";
import misc_ja from "#/ja/glossary/misc_ja.json";
import quests_ja from "#/ja/glossary/quests_ja.json";
import weapons_ja from "#/ja/glossary/weapons_ja.json";

import songs_en from "#/en/songs_en.json";
import songs_ja from "#/ja/songs_ja.json";

import chapterRecaps_en from "#/en/chapter-recaps_en.json";
import chapterRecaps_ja from "#/ja/chapter-recaps_ja.json";

import media_archive_en from "#/en/media-archive_en.json";
import media_archive_ja from "#/ja/media-archive_ja.json";

import changelogs_en from "#/en/changelogs_en.json";
import changelogs_ja from "#/ja/changelogs_ja.json";

import clips_en from "#/en/clips_en.json";
import clips_ja from "#/ja/clips_ja.json";

import {
    ClipsData,
    RecollectionArchiveEntry,
} from "@/components/view/media-archive/types";
import { Category } from "@/contexts/GlossaryContext";
import { Locale } from "@/store/settingStore";

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
    recollectionArchive: RecollectionArchiveEntry[];
    clipData: ClipsData;
}

const DATA: Record<Locale, LocalizedData> = {
    en: {
        chapters: [
            chapter0_en as Chapter,
            chapter1_en as Chapter,
            // chapter2_en as Chapter,
        ],
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
        recollectionArchive: media_archive_en.map((entry) => ({
            ...entry,
            entries: entry.entries.map((media) => ({
                ...media,
                type: media.type as MediaType,
            })),
        })),
        clipData: {
            ...clips_en,
            clips: clips_en.clips.map((clip) => ({
                ...clip,
                contentType: clip.contentType as "clip" | "stream",
            })),
            streams: clips_en.streams.map((stream) => ({
                ...stream,
                contentType: stream.contentType as "clip" | "stream",
            })),
        },
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
        recollectionArchive: media_archive_ja.map((entry) => ({
            ...entry,
            entries: entry.entries.map((media) => ({
                ...media,
                type: media.type as MediaType,
            })),
        })),
        clipData: {
            ...clips_ja,
            clips: clips_ja.clips.map((clip) => ({
                ...clip,
                contentType: clip.contentType as "clip" | "stream",
            })),
            streams: clips_ja.streams.map((stream) => ({
                ...stream,
                contentType: stream.contentType as "clip" | "stream",
            })),
        },
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

export const getRecollectionArchive = (locale: Locale) => {
    return DATA[locale].recollectionArchive;
};

export const getClipsData = (locale: Locale) => {
    return DATA[locale].clipData;
};
