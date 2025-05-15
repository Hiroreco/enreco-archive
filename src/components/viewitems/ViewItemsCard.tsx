import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import "@/components/viewitems/Items.css";
import ViewItemSelector from "@/components/viewitems/ViewItemSelector";
import ViewItemViewer from "@/components/viewitems/ViewItemViewer";
import { CommonItemData } from "@/lib/type";
import { AnimatePresence, motion } from "framer-motion";
import { ChefHat, ChevronLeft, Sword } from "lucide-react";
import { ReactElement, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import weapons from "@/data/glossary/weapons.json";
import hats from "@/data/glossary/hats.json";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewItemsCardProps {
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
};

const ViewItemsCard = ({ className }: ViewItemsCardProps) => {
    const [selectedItem, setSelectedItem] = useState<CommonItemData | null>(
        null,
    );

    const [selectedCategory, setSelectedCategory] = useState("cat-hats");
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
        <Card
            className={twMerge("items-card flex flex-col relative", className)}
        >
            <CardHeader>
                <CardTitle className="flex justify-between items-center gap-2">
                    <div className="flex gap-1">
                        {selectedItem !== null && (
                            <ChevronLeft
                                className="cursor-pointer"
                                onClick={() => setSelectedItem(null)}
                            />
                        )}
                        {categoryMap[selectedCategory].label}
                    </div>

                    <Select
                        value={selectedChapter.toString()}
                        onValueChange={(value: string) =>
                            setSelectedChapter(parseInt(value))
                        }
                    >
                        <SelectTrigger className="w-[180px]">
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
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[65vh] sm:h-[75vh] p-4">
                <AnimatePresence mode="wait">
                    {selectedItem === null && (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-2 overflow-x-hidden overflow-y-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
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
            <CardFooter>
                <Tabs
                    className="m-auto"
                    value={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value)}
                    defaultValue="cat-weapons"
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

export default ViewItemsCard;
