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
import { ReactElement, useEffect, useMemo, useState } from "react";

import ViewGlossarySelector from "@/components/view/items-page/ViewGlossarySelector";
import ViewGlossaryViewer from "@/components/view/items-page/ViewGlossaryViewer";
import { Category, useGlossary } from "@/contexts/GlossaryContext";
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
import Image from "next/image";
import { getBlurDataURL } from "@/lib/utils";

interface ViewGlossaryCardProps {
    className?: string;
    bgImage: string;
}

const categoryMap: Record<Category, { label: string; icon: ReactElement }> = {
    "cat-weapons": { label: "Weapons", icon: <Sword /> },
    "cat-characters": { label: "Characters", icon: <UserRound /> },
    "cat-lore": { label: "Lore", icon: <Book /> },
    "cat-quests": { label: "Quests", icon: <Scroll /> },
    "cat-misc": { label: "Miscellaneous", icon: <Dices /> },
};

const subCatergoryMap: Record<string, string> = {
    revelations: "Revelations",
    npcs: "NPCs",
    general: "General",
    locations: "Locations",
    "main-quests": "Main Quests",
    "special-quests": "Special Quests",
    mechanics: "Mechanics",
    quests: "Quests",
};

const ViewGlossaryCard = ({ className, bgImage }: ViewGlossaryCardProps) => {
    const [selectedCategory, setSelectedCategory] =
        useState<Category>("cat-weapons");
    const [selectedChapter, setSelectedChapter] = useState(-1);
    const [filteredData, setFilteredData] = useState<GlossaryPageData>({});

    const {
        registry,
        currentEntry,
        history,
        clearHistory,
        selectItem,
        goBack,
        goHome,
    } = useGlossary();

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
        if (currentEntry) {
            setSelectedCategory(currentEntry.categoryKey);
        }
    }, [currentEntry]);

    const allEmpty = useMemo(
        () => Object.values(filteredData).every((arr) => arr.length === 0),
        [filteredData],
    );

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isAnyDialogOpen =
                document.querySelector('[role="dialog"]') !== null;

            if (isAnyDialogOpen) return;
            if (event.key === "Escape" || event.key === "Backspace") {
                if (currentEntry !== null) {
                    goBack();
                }
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentEntry, goBack]);

    const entryBg = useMemo(
        () =>
            selectedCategory === "cat-weapons"
                ? "/images-opt/item-bg-opt.webp"
                : currentEntry
                  ? currentEntry.item.thumbnailSrc
                  : bgImage,
        [selectedCategory, currentEntry, bgImage],
    );

    return (
        <Card className={cn("items-card flex flex-col relative", className)}>
            <CardHeader className="pb-0 px-4">
                <div className="flex flex-row h-[30px] items-center w-full justify-between px-2">
                    <CardTitle className="flex justify-between items-center w-full">
                        {categoryMap[selectedCategory].label}
                        {currentEntry !== null && (
                            <div className="flex items-center gap-2">
                                {history.length > 0 && (
                                    <ChevronLeft
                                        size={24}
                                        className="cursor-pointer transition-opacity opacity-60 hover:opacity-100"
                                        onClick={() => {
                                            goBack();
                                        }}
                                    />
                                )}
                                <Home
                                    size={24}
                                    className="cursor-pointer transition-opacity opacity-60 hover:opacity-100"
                                    onClick={() => {
                                        setSelectedCategory(
                                            history[0]?.categoryKey ||
                                                currentEntry?.categoryKey ||
                                                "cat-weapons",
                                        );
                                        goHome();
                                    }}
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
                                hidden: currentEntry !== null,
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

                <Separator className="my-2 bg-foreground/60" />
            </CardHeader>

            <CardContent className="h-[65vh] pb-0 sm:h-[70vh] px-4 mt-2 overflow-y-auto relative">
                {/* Fade shadows for overflow boundaries */}
                <div
                    className={cn(
                        "absolute bottom-0 transition-opacity left-0 right-0 h-4 bg-gradient-to-t from-black/5 to-transparent pointer-events-none z-10",
                        {
                            "opacity-0": currentEntry !== null,
                            "opacity-100": currentEntry === null,
                        },
                    )}
                />

                {/* Content layer */}
                <AnimatePresence mode="wait">
                    {currentEntry === null && (
                        <motion.div
                            key={`grid-${selectedCategory}-${selectedChapter}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-x-hidden overflow-y-auto space-y-6 h-full"
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
                                                    {subCatergoryMap[subcat] ||
                                                        subcat}
                                                </h3>
                                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {items.map((item) => (
                                                        <ViewGlossarySelector
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
                    {currentEntry !== null && (
                        <motion.div
                            className="h-full"
                            key="viewer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                            exit={{ opacity: 0 }}
                        >
                            <ViewGlossaryViewer entry={currentEntry} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>

            <AnimatePresence>
                {currentEntry === null && (
                    <motion.div
                        key="card-bg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 -z-10"
                    >
                        <Image
                            src={getBlurDataURL(bgImage)}
                            alt=""
                            fill
                            className="object-cover blur-xl dark:opacity-20 opacity-40"
                            priority={false}
                        />
                        {/* Dark overlay to ensure content readability */}
                        <div className="absolute inset-0 dark:bg-black/30 bg-white/30" />
                    </motion.div>
                )}
                {currentEntry !== null && (
                    <motion.div
                        key={`viewer-bg-${currentEntry.item.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 -z-10"
                    >
                        <Image
                            src={getBlurDataURL(entryBg)}
                            alt=""
                            fill
                            className="object-cover blur-md dark:opacity-20 opacity-40"
                            priority={false}
                        />
                        {/* Dark overlay to ensure content readability */}
                        <div className="absolute inset-0 dark:bg-black/30 bg-white/50" />
                    </motion.div>
                )}
            </AnimatePresence>

            <CardFooter className="p-0 py-4 z-10">
                <Tabs
                    className="m-auto"
                    value={selectedCategory}
                    onValueChange={(value) => {
                        setSelectedCategory(value as Category);
                        selectItem(null);
                        clearHistory();
                    }}
                    defaultValue={selectedCategory}
                >
                    <TabsList className="bg-transparent shadow-md">
                        {Object.keys(categoryMap).map((category) => (
                            <TabsTrigger
                                value={category}
                                key={category}
                                onClick={() => {
                                    if (selectedCategory === category) {
                                        selectItem(null);
                                        clearHistory();
                                    }
                                }}
                            >
                                {categoryMap[category as Category].icon}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </CardFooter>
        </Card>
    );
};

export default ViewGlossaryCard;
