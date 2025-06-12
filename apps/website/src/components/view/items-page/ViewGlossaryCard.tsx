import { GlossaryPageData } from "@enreco-archive/common/types";
import { AnimatePresence, motion } from "framer-motion";
import {
    Book,
    ChevronLeft,
    Dices,
    Home,
    Scroll,
    Sword,
    UserRound,
} from "lucide-react";
import { ReactElement, useEffect, useState } from "react";

import ViewItemSelector from "@/components/view/items-page/ViewItemSelector";
import ViewItemViewer from "@/components/view/items-page/ViewItemsViewer";
import { useGlossary } from "@/contexts/GlossaryContext";
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

const categoryMap: Record<string, { label: string; icon: ReactElement }> = {
    "cat-weapons": { label: "Weapons", icon: <Sword /> },
    "cat-characters": { label: "Characters", icon: <UserRound /> },
    "cat-lore": { label: "Lore", icon: <Book /> },
    "cat-quests": { label: "Quests", icon: <Scroll /> },
    "cat-misc": { label: "Miscellaneous", icon: <Dices /> },
};

const ViewGlossaryCard = ({ className }: ViewGlossaryCardProps) => {
    const [selectedCategory, setSelectedCategory] = useState("cat-weapons");
    const [selectedChapter, setSelectedChapter] = useState(-1);

    const [filteredData, setFilteredData] = useState<GlossaryPageData>({});

    const {
        registry,
        current,
        history,
        clearHistory,
        selectItem,
        goBack,
        goHome,
    } = useGlossary();
    const selectedItem = current?.item || null;

    useEffect(() => {
        const newMap: GlossaryPageData = {};

        Object.values(registry)
            .filter(({ categoryKey }) => categoryKey === selectedCategory)
            .forEach(({ subcategory, item }) => {
                if (
                    selectedChapter !== -1 &&
                    !item.chapters.includes(-1) &&
                    !item.chapters.includes(selectedChapter)
                ) {
                    return;
                }

                if (!newMap[subcategory]) newMap[subcategory] = [];
                newMap[subcategory].push(item);
            });

        setFilteredData(newMap);
    }, [selectedCategory, selectedChapter, registry]);

    // If context.selected changes (via a #item link), jump to its category
    useEffect(() => {
        if (current) {
            setSelectedCategory(current.categoryKey);
            setSelectedChapter(-1);
        }
    }, [current]);

    const allEmpty = Object.values(filteredData).every(
        (arr) => arr.length === 0,
    );

    return (
        <Card className={cn("items-card flex flex-col relative", className)}>
            <CardHeader className="pb-0 px-4">
                <div className="flex flex-row h-[30px] items-center w-full justify-between px-2">
                    <CardTitle className="flex justify-between items-center w-full">
                        {categoryMap[selectedCategory].label}
                        {selectedItem !== null && (
                            <div className="flex items-center gap-2">
                                {history.length > 0 && (
                                    <ChevronLeft
                                        size={24}
                                        className="cursor-pointer transition-opacity opacity-60 hover:opacity-100"
                                        onClick={goBack}
                                    />
                                )}
                                <Home
                                    size={24}
                                    className="cursor-pointer transition-opacity opacity-60 hover:opacity-100"
                                    onClick={goHome}
                                />
                            </div>
                        )}
                    </CardTitle>

                    <Select
                        value={selectedChapter.toString()}
                        onValueChange={(value: string) =>
                            setSelectedChapter(parseInt(value))
                        }
                    >
                        <SelectTrigger
                            className={cn("w-[180px]", {
                                hidden: selectedItem !== null,
                            })}
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={"-1"}>All Chapters</SelectItem>
                            {[...Array(2).keys()].map((chapter) => (
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
                                                            onItemClick={(
                                                                it,
                                                            ) => {
                                                                // find which registry entry it was:
                                                                // also prettier wtf is this formatting
                                                                const entry =
                                                                    registry[
                                                                        it.id
                                                                    ];
                                                                selectItem(
                                                                    entry,
                                                                );
                                                            }}
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

            <CardFooter className="p-0 py-4">
                <Tabs
                    className="m-auto"
                    value={selectedCategory}
                    onValueChange={(value) => {
                        setSelectedCategory(value);
                        selectItem(null);
                        setSelectedChapter(-1);
                        clearHistory();
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
