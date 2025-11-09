import FanficArchiveSelector from "@/components/view/media-archive/text-archive/FanficArchiveSelector";
import TextArchiveSelector from "@/components/view/media-archive/text-archive/TextArchiveSelector";
import TextModal from "@/components/view/utility-modals/TextModal";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@enreco-archive/common-ui/components/tabs";
import { BookOpen, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const TextArchiveCard = () => {
    const t = useTranslations("mediaArchive.textArchive");
    const tCommon = useTranslations("common");
    const { getTextData, getFanficData } = useLocalizedData();
    const textData = getTextData();
    const fanficData = getFanficData();

    const [activeTab, setActiveTab] = useState<"texts" | "fanfics">("texts");
    // const [selectedFanfic, setSelectedFanfic] = useState<
    //     (typeof fanficData)[0] | null
    // >(null);

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

    // const handleFanficClick = (fanfic: (typeof fanficData)[0]) => {
    //     setSelectedFanfic(fanfic);
    // };

    // const handleBackToList = () => {
    //     setSelectedFanfic(null);
    // };

    // if (selectedFanfic && activeTab === "fanfics") {
    //     return (
    //         <FanficViewer fanfic={selectedFanfic} onBack={handleBackToList} />
    //     );
    // }

    return (
        <div className="flex flex-col gap-4 h-full">
            <Tabs
                value={activeTab}
                className="w-full"
                onValueChange={(v) => setActiveTab(v as "texts" | "fanfics")}
            >
                <TabsList className="grid grid-cols-2 flex-1">
                    <TabsTrigger value="texts" className="gap-2 size-full">
                        <BookOpen className="size-4" />
                        <span>{t("tabs.texts")}</span>
                    </TabsTrigger>
                    <TabsTrigger value="fanfics" className="gap-2 size-full">
                        <Heart className="size-4" />
                        <span>{t("tabs.fanfics")}</span>
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {activeTab === "texts" ? (
                <div className="overflow-y-auto flex-1">
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
                                                {t(`category.${category}`) ||
                                                    category}
                                            </h3>
                                            <div className="grid md:grid-cols-3 gap-2">
                                                {groups.map(
                                                    ({ key, group }) => (
                                                        <TextModal
                                                            key={key}
                                                            textId={key}
                                                            label={
                                                                <TextArchiveSelector
                                                                    group={
                                                                        group
                                                                    }
                                                                    groupKey={
                                                                        key
                                                                    }
                                                                />
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {fanficData.map((fanfic) => (
                        <FanficArchiveSelector
                            key={fanfic.storyKey}
                            fanfic={fanfic}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TextArchiveCard;
