import FanartCard from "@/components/view/fanart/FanartCard";
import { FanartEntry } from "@/components/view/fanart/FanartModal";
import { AnimatePresence, motion } from "framer-motion";

interface MasonryColumn {
    items: Array<{ entry: FanartEntry; index: number }>;
    height: number;
}

interface FanartMasonryGridProps {
    masonryColumns: MasonryColumn[];
    filteredFanart: FanartEntry[];
    selectedCharacters: string[];
    selectedChapter: string;
    selectedDay: string;
    onOpenLightbox: (index: number) => void;
}

const FanartMasonryGrid = ({
    masonryColumns,
    filteredFanart,
    selectedCharacters,
    selectedChapter,
    selectedDay,
    onOpenLightbox,
}: FanartMasonryGridProps) => {
    if (filteredFanart.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-center">
                <div>
                    <p className="text-lg font-medium text-muted-foreground mb-2">
                        No fanart found
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Try adjusting your filters to see more results
                    </p>
                </div>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`${selectedCharacters.join(",")}-${selectedChapter}-${selectedDay}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.125 }}
                className="flex gap-4 items-start"
                style={{ minHeight: "fit-content" }}
            >
                {masonryColumns.map((column, columnIndex) => (
                    <div key={columnIndex} className="flex-1 flex flex-col">
                        {column.items.map(({ entry, index }) => (
                            <FanartCard
                                key={`${entry.url}-${index}`}
                                entry={entry}
                                index={index}
                                onClick={onOpenLightbox}
                            />
                        ))}
                    </div>
                ))}
            </motion.div>
        </AnimatePresence>
    );
};

export default FanartMasonryGrid;
