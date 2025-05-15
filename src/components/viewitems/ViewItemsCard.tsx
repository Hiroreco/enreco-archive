import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface ViewItemsCardProps {
    data: CommonItemData[];
    label: string;
}

const ViewItemsCard = ({ data, label }: ViewItemsCardProps) => {
    const [selectedItem, setSelectedItem] = useState<CommonItemData | null>(
        null,
    );

    const [selectedChapter, setSelectedChapter] = useState(-1);
    const [filteredData, setFilteredData] = useState<CommonItemData[]>([]);

    useEffect(() => {
        const dataBasedOnChapter = data.filter(
            (item) =>
                selectedChapter === -1 || item.chapter === selectedChapter,
        );
        setFilteredData(dataBasedOnChapter);
    }, [selectedChapter, data]);

    return (
        <Card className="items-card flex flex-col">
            <CardHeader>
                <CardTitle className="flex justify-between items-center gap-2">
                    <div>
                        {selectedItem !== null && (
                            <ChevronLeft
                                className="cursor-pointer"
                                onClick={() => setSelectedItem(null)}
                            />
                        )}
                        {label}
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
        </Card>
    );
};

export default ViewItemsCard;
