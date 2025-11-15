import FanficArchiveSelector from "@/components/view/media-archive/text-archive/FanficArchiveSelector";
import FanficViewer from "@/components/view/media-archive/text-archive/FanficViewer";
import TextArchiveSelector from "@/components/view/media-archive/text-archive/TextArchiveSelector";
import TextModal from "@/components/view/utility-modals/TextModal";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@enreco-archive/common-ui/components/tabs";
import { AnimatePresence, motion } from "framer-motion";
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
    const [selectedFanfic, setSelectedFanfic] = useState<
        (typeof fanficData)[0] | null
    >(null);

    const { scrollContainerRef, saveScrollPosition, restoreScrollPosition } =
        useScrollRestoration({
            smooth: true,
            shouldRestore: false,
        });

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

    const handleFanficClick = (fanfic: (typeof fanficData)[0]) => {
        saveScrollPosition();
        setSelectedFanfic(fanfic);
    };

    const handleBackToList = () => {
        setSelectedFanfic(null);
    };

    const handleAnimationComplete = () => {
        if (!selectedFanfic && activeTab === "fanfics") {
            restoreScrollPosition();
        }
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <Tabs
                value={activeTab}
                className="w-full"
                onValueChange={(v) => setActiveTab(v as "texts" | "fanfics")}
            >
                <TabsList className="grid grid-cols-2 flex-1 px-4">
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

            <AnimatePresence mode="wait">
                {activeTab === "texts" ? (
                    <motion.div
                        key="texts-viewer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-y-auto overflow-x-hidden px-4 flex-1"
                    >
                        {sortedTextChapters.map((chapterKey) => {
                            const chapter = Number(chapterKey);
                            const categories = groupedTexts[chapter];
                            return (
                                <div key={chapter}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Separator className="bg-foreground/60 flex-1" />
                                        <span className="font-bold whitespace-nowrap text-xl">
                                            {tCommon("chapter", {
                                                val: chapter,
                                            })}
                                        </span>
                                        <Separator className="bg-foreground/60 flex-1" />
                                    </div>
                                    {Object.entries(categories).map(
                                        ([category, groups]) => (
                                            <div
                                                key={category}
                                                className="mb-4"
                                            >
                                                <span className="text-lg font-semibold opacity-80 mx-auto underline underline-offset-2">
                                                    {t(
                                                        `category.${category}`,
                                                    ) || category}
                                                </span>
                                                <div className="grid md:grid-cols-3 gap-2 mt-2">
                                                    {groups.map(
                                                        ({ key, group }) => (
                                                            <TextModal
                                                                showDescriptionPanel={
                                                                    true
                                                                }
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
                    </motion.div>
                ) : selectedFanfic && activeTab === "fanfics" ? (
                    <motion.div
                        key="fanfics-reader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-x-hidden overflow-y-auto flex-1"
                    >
                        <FanficViewer
                            fanfic={selectedFanfic}
                            onBack={handleBackToList}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="fanfics-viewer"
                        ref={scrollContainerRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onAnimationComplete={handleAnimationComplete}
                        className="overflow-x-hidden overflow-y-auto py-2 flex-1"
                    >
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 px-4">
                            {fanficData.map((fanfic, index) => (
                                <FanficArchiveSelector
                                    key={index}
                                    fanfic={fanfic}
                                    onClick={() => handleFanficClick(fanfic)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TextArchiveCard;
