import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "@/components/viewitems/Items.css";
import ViewItemSelector from "@/components/viewitems/ViewItemSelector";
import ViewItemViewer from "@/components/viewitems/ViewItemViewer";
import { CommonItemData } from "@/lib/type";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

interface ViewItemsCardProps {
    data: CommonItemData[];
    label: string;
}

const ViewItemsCard = ({ data, label }: ViewItemsCardProps) => {
    const [selectedItem, setSelectedItem] = useState<CommonItemData | null>(
        null,
    );

    return (
        <Card className="items-card flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {selectedItem !== null && (
                        <ChevronLeft
                            className="cursor-pointer"
                            onClick={() => setSelectedItem(null)}
                        />
                    )}
                    {label}
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
                            {data.map((weapon) => (
                                <ViewItemSelector
                                    key={weapon.id}
                                    item={weapon}
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
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

export default ViewItemsCard;
