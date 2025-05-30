import { CommonItemData } from "@enreco-archive/common/types";
import { AnimatePresence, motion } from "framer-motion";
import { Castle, ChefHat, ChevronLeft, Sword } from "lucide-react";
import { ReactElement, useEffect, useState } from "react";

import weapons from "#/glossary/weapons.json";
import hats from "#/glossary/hats.json";
import dungeons from "#/glossary/dungeons.json";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@enreco-archive/common-ui/components/card";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import ViewItemSelector from "@/components/view/items-page/ViewItemSelector";
import ViewItemViewer from "@/components/view/items-page/ViewItemsViewer";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@enreco-archive/common-ui/components/tabs";
import { Separator } from "@enreco-archive/common-ui/components/separator";

interface ViewGlossaryCardProps {
    className: string;
}

const categoryMap: {
    [key: string]: {
        data: CommonItemData[];
        label: string;
        icon: ReactElement;
    };
} = {
    "cat-weapons": {
        data: weapons,
        label: "Weapons",
        icon: <Sword />,
    },
    "cat-hats": {
        data: hats,
        label: "Hats",
        icon: <ChefHat />,
    },
    "cat-dungeons": {
        data: dungeons,
        label: "Dungeons",
        icon: <Castle />,
    },
};

const ViewGlossaryCard = ({ className }: ViewGlossaryCardProps) => {
    const [selectedItem, setSelectedItem] = useState<CommonItemData | null>(
        null,
    );

    const [selectedCategory, setSelectedCategory] = useState("cat-weapons");
    const [selectedChapter, setSelectedChapter] = useState(-1);
    const [filteredData, setFilteredData] = useState<CommonItemData[]>([]);

    useEffect(() => {
        const data = categoryMap[selectedCategory].data;
        const dataBasedOnChapter = data.filter(
            (item) =>
                selectedChapter === -1 || item.chapter === selectedChapter,
        );
        setFilteredData(dataBasedOnChapter);
    }, [selectedChapter, selectedCategory]);

    return (
        <Card className={cn("items-card flex flex-col relative", className)}>
            <CardHeader className="pb-0 px-4">
                <div className="flex flex-row items-center m-0 space-y-0 w-full justify-between">
                    <CardTitle className="flex m-0 justify-between items-center h-full gap-2">
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
                            className="overflow-x-hidden overflow-y-auto grid sm:grid-cols-2 lg:grid-cols-3 place-items-start gap-4"
                        >
                            {filteredData.map((item) => (
                                <ViewItemSelector
                                    key={item.id}
                                    item={item}
                                    onItemClick={(item) =>
                                        setSelectedItem(item)
                                    }
                                />
                            ))}
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
                    {filteredData.length === 0 && (
                        <div className="text-center text-xl text-muted-foreground">
                            Nothing here but us chickens
                        </div>
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
