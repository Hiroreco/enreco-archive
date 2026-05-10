import { Category } from "@/contexts/GlossaryContext";
import {
    getChangelog,
    getChapterData,
    getChapterRecap,
    getClipsData,
    getFanficData,
    getGlossaryData,
    getLocalizedTextData,
    getRecollectionArchive,
    getSiteData,
    getSongsData,
    getTextItem,
} from "@/lib/data-center";
import { Locale, useSettingStore } from "@/store/settingStore";

export const useLocalizedData = () => {
    const locale = useSettingStore((state) => state.locale);

    return {
        locale,
        getChapter: (chapterIndex: number) =>
            getChapterData(locale, chapterIndex),
        getTextData: () => getLocalizedTextData(locale),
        getGlossary: (category: Category) => getGlossaryData(locale, category),
        getSongs: () => getSongsData(locale),
        getSiteData: () => getSiteData(locale),
        getTextItem: (textId: string) => getTextItem(locale, textId),
        getChapterRecap: () => getChapterRecap(locale),
        getChangelog: () => getChangelog(locale),
        getRecollectionArchive: () => getRecollectionArchive(locale),
        getClipsData: () => getClipsData(locale),
        getFanficData: () => getFanficData(locale),
    };
};
