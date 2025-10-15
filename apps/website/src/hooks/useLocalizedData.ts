import { Category } from "@/contexts/GlossaryContext";
import {
    getChangelog,
    getChapterData,
    getChapterRecap,
    getGlossaryData,
    getRecollectionArchive,
    getSiteData,
    getSongsData,
    getTextData,
    getTextItem,
} from "@/lib/data-center";
import { Locale } from "@/store/settingStore";
import { useLocale } from "next-intl";

export const useLocalizedData = () => {
    const locale = useLocale() as Locale;

    return {
        locale,
        getChapter: (chapterIndex: number) =>
            getChapterData(locale, chapterIndex),
        getTextData: () => getTextData(locale),
        getGlossary: (category: Category) => getGlossaryData(locale, category),
        getSongs: () => getSongsData(locale),
        getSiteData: () => getSiteData(locale),
        getTextItem: (textId: string) => getTextItem(locale, textId),
        getChapterRecap: () => getChapterRecap(locale),
        getChangelog: () => getChangelog(locale),
        getRecollectionArchive: () => getRecollectionArchive(locale),
    };
};
