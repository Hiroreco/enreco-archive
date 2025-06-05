import { CommonItemData, GlossaryPageData } from "@enreco-archive/common/types";
import { AnimatePresence, motion } from "framer-motion";
import {
    Book,
    ChevronLeft,
    Dices,
    Scroll,
    Sword,
    UserRound,
} from "lucide-react";
import { ReactElement, useEffect, useState } from "react";

import characters from "#/glossary/characters.json";
import lore from "#/glossary/lore.json";
import misc from "#/glossary/misc.json";
import quests from "#/glossary/quests.json";
import weapons from "#/glossary/weapons.json";

import ViewItemSelector from "@/components/view/items-page/ViewItemSelector";
import ViewItemViewer from "@/components/view/items-page/ViewItemsViewer";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@enreco-archive/common-ui/components/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@enreco-archive/common-ui/components/tabs";
import { cn } from "@enreco-archive/common-ui/lib/utils";

interface ViewGlossaryCardProps {
    className?: string;
}

// Each “big” category now contains a map of { subcategoryName: CommonItemData[] }
const categoryMap: {
    [key: string]: {
        data: GlossaryPageData;
        label: string;
        icon: ReactElement;
    };
} = {
    "cat-weapons": {
        data: weapons,
        label: "Weapons",
        icon: <Sword />,
    },
    "cat-characters": {
        data: characters,
        label: "Characters",
        icon: <UserRound />,
    },
    "cat-lore": {
        data: lore,
        label: "Lore",
        icon: <Book />,
    },
    "cat-quests": {
        data: quests,
        label: "Quests",
        icon: <Scroll />,
    },
    "cat-misc": {
        data: misc,
        label: "Miscellaneous",
        icon: <Dices />,
    },
};

const ViewGlossaryCard = ({ className }: ViewGlossaryCardProps) => {
    const [selectedItem, setSelectedItem] = useState<CommonItemData | null>(
        null,
    );
    const [selectedCategory, setSelectedCategory] = useState("cat-weapons");
    const [selectedChapter, setSelectedChapter] = useState(-1);

    const [filteredData, setFilteredData] = useState<GlossaryPageData>({});

    useEffect(() => {
        const dataMap = categoryMap[selectedCategory].data;
        const newMap: GlossaryPageData = {};

        Object.entries(dataMap).forEach(([subcat, items]) => {
            newMap[subcat] = items.filter(
                (item) =>
                    selectedChapter === -1 ||
                    item.chapters.includes(-1) ||
                    item.chapters.includes(selectedChapter),
            );
        });

        setFilteredData(newMap);
    }, [selectedChapter, selectedCategory]);

    const allEmpty = Object.values(filteredData).every(
        (arr) => arr.length === 0,
    );

    return (
        <Card className={cn("items-card flex flex-col relative", className)}>
            <CardHeader className="pb-0 px-4">
                <div className="flex flex-row items-center w-full justify-between">
                    <CardTitle className="flex justify-between items-center gap-2">
                        {selectedItem !== null && (
                            <ChevronLeft
                                size={16}
                                className="cursor-pointer"
                                onClick={() => setSelectedItem(null)}
                            />
                        )}
                        {categoryMap[selectedCategory].label}
                    </CardTitle>

                    <Select
                        value={selectedChapter.toString()}
                        onValueChange={(value: string) =>
                            setSelectedChapter(parseInt(value))
                        }
                    >
                        <SelectTrigger
                            className={cn("w-[180px]", {
                                invisible: selectedItem !== null,
                            })}
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={"-1"}>All Chapters</SelectItem>
                            {[...Array(10).keys()].map((chapter) => (
                                <SelectItem
                                    key={chapter}
                                    value={chapter.toString()}
                                >
                                    Chapter {chapter + 1}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Separator className="my-2" />
            </CardHeader>

            <CardContent className="h-[65vh] sm:h-[70vh] px-4 mt-2 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {selectedItem === null && (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="overflow-x-hidden overflow-y-auto space-y-6"
                        >
                            {allEmpty ? (
                                <div className="text-center text-xl text-muted-foreground">
                                    Nothing here but us chickens
                                </div>
                            ) : (
                                // For each non-empty subcategory, render a heading + its items
                                Object.entries(filteredData).map(
                                    ([subcat, items]) => {
                                        if (items.length === 0) return null;
                                        return (
                                            <div key={subcat}>
                                                <h3 className="text-lg font-semibold mb-2 capitalize">
                                                    {subcat.replace(
                                                        /[-_]/g,
                                                        " ",
                                                    )}
                                                </h3>
                                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {items.map((item) => (
                                                        <ViewItemSelector
                                                            key={item.id}
                                                            item={item}
                                                            onItemClick={(it) =>
                                                                setSelectedItem(
                                                                    it,
                                                                )
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    },
                                )
                            )}
                        </motion.div>
                    )}

                    {selectedItem !== null && (
                        <motion.div
                            className="h-full"
                            key="viewer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <ViewItemViewer item={selectedItem} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>

            <CardFooter className="p-0 pb-4">
                <Tabs
                    className="m-auto"
                    value={selectedCategory}
                    onValueChange={(value) => {
                        setSelectedCategory(value);
                        setSelectedItem(null);
                        setSelectedChapter(-1);
                    }}
                    defaultValue={selectedCategory}
                >
                    <TabsList>
                        {Object.keys(categoryMap).map((category) => (
                            <TabsTrigger value={category} key={category}>
                                {categoryMap[category].icon}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </CardFooter>
        </Card>
    );
};

export default ViewGlossaryCard;
