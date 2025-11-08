import TextArchiveSelector from "@/components/view/media-archive/text-archive/TextArchiveSelector";
import TextModal from "@/components/view/utility-modals/TextModal";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const TextArchiveCard = () => {
    const t = useTranslations("mediaArchive.textArchive");
    const tCommon = useTranslations("common");
    const { getTextData } = useLocalizedData();
    const textData = getTextData();

    const groupedTexts = useMemo(() => {
        const grouped: Record<
            number,
            Record<string, { key: string; group: (typeof textData)[string] }[]>
        > = {};

        Object.entries(textData).forEach(([key, group]) => {
            if (!grouped[group.chapter]) {
                grouped[group.chapter] = {};
            }
            if (!grouped[group.chapter][group.category]) {
                grouped[group.chapter][group.category] = [];
            }
            grouped[group.chapter][group.category].push({ key, group });
        });

        return grouped;
    }, [textData]);

    const sortedTextChapters = useMemo(
        () => Object.keys(groupedTexts).sort((a, b) => Number(b) - Number(a)),
        [groupedTexts],
    );

    return (
        <>
            {sortedTextChapters.map((chapterKey) => {
                const chapter = Number(chapterKey);
                const categories = groupedTexts[chapter];
                return (
                    <div key={chapter}>
                        <div className="flex items-center gap-3 mb-2">
                            <Separator className="bg-foreground/60 flex-1" />
                            <span className="font-bold whitespace-nowrap">
                                {tCommon("chapter", {
                                    val: chapter,
                                })}
                            </span>
                            <Separator className="bg-foreground/60 flex-1" />
                        </div>
                        {Object.entries(categories).map(
                            ([category, groups]) => (
                                <div key={category} className="mb-4">
                                    <h3 className="text-sm font-semibold mb-2 capitalize opacity-80">
                                        {t(`category.${category}`) || category}
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {groups.map(({ key, group }) => (
                                            <TextModal
                                                key={key}
                                                textId={key}
                                                label={
                                                    <TextArchiveSelector
                                                        group={group}
                                                        groupKey={key}
                                                    />
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                );
            })}
        </>
    );
};

export default TextArchiveCard;
