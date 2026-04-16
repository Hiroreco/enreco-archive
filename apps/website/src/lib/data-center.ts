import {
    Chapter,
    ChapterRecapData,
    GlossaryPageData,
    LocalizedChapter,
    LocalizedChapterRecapData,
    SiteData,
    Song,
    SongRaw,
    TextData
} from "@enreco-archive/common/types";

import siteMeta from "#/recaps/metadata.json";
import chapter0 from "#/recaps/chapter0.json";
import chapter1 from "#/recaps/chapter1.json";
import chapter2 from "#/recaps/chapter2.json";

import text from "#/text.json";

import characters from "#/glossary/characters.json";
import lore from "#/glossary/lore.json";
import misc from "#/glossary/misc.json";
import quests from "#/glossary/quests.json";
import weapons from "#/glossary/weapons.json";

import songs_raw from "#/songs.json";

import chapterRecaps from "#/chapter-recaps.json";

import media_archive from "#/media-archive.json";

import changelogs from "#/changelogs.json";

import clips from "#/clips.json";

import fanfic_data_en from "#/fanfics.json";

import { FanficEntry } from "@/components/view/media-archive/text-archive/types";
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
    fanficData: FanficEntry[];
}

// Transform raw songs to locale-specific songs
const transformSongs = (
    rawSongs: Record<string, SongRaw[]>,
    locale: Locale,
): Record<string, Song[]> => {
    const result: Record<string, Song[]> = {};

    for (const [category, songs] of Object.entries(rawSongs)) {
        result[category] = songs.map((song) => ({
            ...song,
            info: song.info[locale],
        }));
    }

    return result;
};

// Convert localized glossary to locale-specific format for components
const convertLocalizedGlossary = (
    glossaryCategories: Record<string, Record<string, any>>,
    locale: Locale,
): Record<string, Record<string, any>> => {
    const result: Record<string, Record<string, any>> = {};

    // For each category (weapons, characters, lore, quests, misc)
    for (const [categoryKey, glossaryData] of Object.entries(
        glossaryCategories,
    )) {
        const convertedCategory: Record<string, any> = {};

        // For each subcategory within the category
        for (const [subcategory, entries] of Object.entries(glossaryData)) {
            convertedCategory[subcategory] = (entries as any[]).map(
                (entry: any) => ({
                    ...entry,
                    title: entry.title[locale],
                    content: entry.content[locale],
                    quote: entry.quote[locale],
                    galleryImages: entry.galleryImages?.map((img: any) => ({
                        ...img,
                        title: img.title[locale],
                    })),
                }),
            );
        }

        result[categoryKey] = convertedCategory;
    }

    return result;
};

// Convert localized media archive to locale-specific format for components
const convertLocalizedRecollectionArchive = (
    archive: Array<any>,
    locale: Locale,
): RecollectionArchiveEntry[] => {
    return archive.map((entry) => ({
        id: entry.id,
        title: entry.title[locale],
        description: entry.description[locale],
        info: entry.info[locale],
        chapter: entry.chapter,
        thumbnailUrl: entry.thumbnailUrl,
        entries: entry.entries.map((media: any) => ({
            title: media.title[locale],
            originalUrl: media.originalUrl,
            thumbnailUrl: media.thumbnailUrl,
            info: media.info[locale],
            src: media.src,
            type: media.type,
        })),
    }));
};

// Convert localized changelogs to locale-specific format for components
const convertLocalizedChangelogs = (
    changelogs: Array<any>,
    locale: Locale,
): Array<{ date: string; content: string }> => {
    return changelogs.map((entry) => ({
        date: entry.date,
        content: entry.content[locale],
    }));
};

// Convert localized chapter recaps to locale-specific format for components
const convertLocalizedChapterRecaps = (
    recaps: LocalizedChapterRecapData,
    locale: Locale,
): ChapterRecapData => {
    return {
        chapters: recaps.chapters.map((chapter) => ({
            title: chapter.title[locale],
            content: chapter.content[locale],
        })),
    };
};

// Convert localized chapter to locale-specific format
const convertLocalizedChapter = (chapter: LocalizedChapter, locale: Locale): Chapter => {
    return {
        numberOfDays: chapter.numberOfDays,
        title: chapter.title[locale],
        charts: chapter.charts.map((chart: any) => ({
            dayRecap: chart.dayRecap[locale],
            title: chart.title[locale],
            nodes: chart.nodes.map((node: any) => {
                // Extract locale-specific node content if it's localized
                if (node.data?.content && typeof node.data.content === 'object' && node.data.content[locale]) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            content: node.data.content[locale],
                        },
                    };
                }
                return node;
            }),
            edges: chart.edges.map((edge: any) => {
                // Extract locale-specific edge content if it's localized
                if (edge.data?.content && typeof edge.data.content === 'object' && edge.data.content[locale]) {
                    return {
                        ...edge,
                        data: {
                            ...edge.data,
                            content: edge.data.content[locale],
                        },
                    };
                }
                return edge;
            }),
        })),
        teams: chapter.teams,
        relationships: chapter.relationships,
        bgiSrc: chapter.bgiSrc,
        bgmSrc: chapter.bgmSrc,
    };
};

const DATA: Record<Locale, LocalizedData> = {
    en: {
        chapters: [
            convertLocalizedChapter(chapter0 as LocalizedChapter, "en"),
            convertLocalizedChapter(chapter1 as LocalizedChapter, "en"),
            convertLocalizedChapter(chapter2 as LocalizedChapter, "en"),
        ],
        textData: text as TextData,
        glossary: convertLocalizedGlossary(
            {
                weapons: weapons as any,
                characters: characters as any,
                lore: lore as any,
                quests: quests as any,
                misc: misc as any,
            } as any,
            "en",
        ) as any,
        songs: transformSongs(songs_raw as Record<string, SongRaw[]>, "en"),
        chapterRecap: convertLocalizedChapterRecaps(
            chapterRecaps as LocalizedChapterRecapData,
            "en",
        ),
        changelogs: convertLocalizedChangelogs(changelogs as any, "en"),
        recollectionArchive: convertLocalizedRecollectionArchive(
            media_archive as any,
            "en",
        ) as RecollectionArchiveEntry[],
        fanficData: fanfic_data_en,
    },
    ja: {
        chapters: [
            convertLocalizedChapter(chapter0 as LocalizedChapter, "ja"),
            convertLocalizedChapter(chapter1 as LocalizedChapter, "ja"),
            convertLocalizedChapter(chapter2 as LocalizedChapter, "ja"),
        ],
        textData: text as TextData,
        glossary: convertLocalizedGlossary(
            {
                weapons: weapons as any,
                characters: characters as any,
                lore: lore as any,
                quests: quests as any,
                misc: misc as any,
            } as any,
            "ja",
        ) as any,
        songs: transformSongs(songs_raw as Record<string, SongRaw[]>, "ja"),
        chapterRecap: convertLocalizedChapterRecaps(
            chapterRecaps as LocalizedChapterRecapData,
            "ja",
        ),
        changelogs: convertLocalizedChangelogs(changelogs as any, "ja"),
        recollectionArchive: convertLocalizedRecollectionArchive(
            media_archive as any,
            "ja",
        ) as RecollectionArchiveEntry[],
        fanficData: fanfic_data_en,
    },
};

export const getChapterData = (
    locale: Locale,
    chapterIndex: number,
): Chapter => {
    return DATA[locale].chapters[chapterIndex];
};

// Convert localized text data to locale-specific format for components
const convertLocalizedTextData = (
    textData: TextData,
    locale: Locale,
): Record<string, any> => {
    const result: Record<string, any> = {};

    for (const [key, group] of Object.entries(textData)) {
        result[key] = {
            chapter: group.chapter,
            category: group.category,
            title: group.title[locale],
            description: group.description[locale],
            entries: group.entries.map((entry) => ({
                id: entry.id,
                title: entry.title[locale],
                content: entry.content[locale],
                hasAudio: entry.hasAudio,
            })),
        };
    }

    return result;
};

export const getTextData = (locale: Locale): TextData => {
    return DATA[locale].textData;
};

// Get text data in locale-specific flattened format (for UI components)
export const getLocalizedTextData = (locale: Locale) => {
    return convertLocalizedTextData(DATA[locale].textData, locale);
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
    const textData = DATA[locale].textData;

    for (const group of Object.values(textData)) {
        const entry = group.entries.find((e) => e.id === textId);
        if (entry) {
            return {
                id: entry.id,
                content: entry.content[locale],
                title: entry.title[locale],
                hasAudio: entry.hasAudio,
                chapter: group.chapter,
                category: group.category,
                groupTitle: group.title[locale],
                groupDescription: group.description[locale],
            };
        }
    }

    return null;
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

export const getClipsData = (locale: Locale): ClipsData => {
    return clips as ClipsData;
};
export const getFanficData = (locale: Locale) => {
    return DATA[locale].fanficData;
};
