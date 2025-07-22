import { GlossaryPageData } from "@enreco-archive/common/types";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRight,
    Book,
    ChevronLeft,
    ChevronRight,
    Dices,
    Home,
    Scroll,
    Sword,
    UserRound,
} from "lucide-react";
import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";

import ViewGlossarySelector from "@/components/view/glossary/ViewGlossarySelector";
import ViewGlossaryViewer from "@/components/view/glossary/ViewGlossaryViewer";
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
import ViewSectionJumper from "@/components/view/glossary/ViewSectionJumper";

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
    "side-quests": "Side Quests",
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

    const allEmpty = useMemo(
        () => Object.values(filteredData).every((arr) => arr.length === 0),
        [filteredData],
    );

    const entryBg = useMemo(
        () =>
            selectedCategory === "cat-weapons"
                ? "/images-opt/item-bg-opt.webp"
                : currentEntry
                  ? currentEntry.item.thumbnailSrc
                  : bgImage,
        [selectedCategory, currentEntry, bgImage],
    );

    const flattenedItems = useMemo(() => {
        const items: Array<{ id: string; subcategory: string }> = [];

        // Sort subcategories consistently
        const sortedSubcategories = Object.keys(filteredData);

        sortedSubcategories.forEach((subcategory) => {
            const subcategoryItems = filteredData[subcategory];
            if (subcategoryItems && subcategoryItems.length > 0) {
                subcategoryItems.forEach((item) => {
                    items.push({ id: item.id, subcategory });
                });
            }
        });

        return items;
    }, [filteredData]);

    const currentItemIndex = useMemo(() => {
        if (!currentEntry) return -1;
        return flattenedItems.findIndex(
            (item) => item.id === currentEntry.item.id,
        );
    }, [currentEntry, flattenedItems]);

    const canGoNext = useMemo(
        () =>
            currentItemIndex >= 0 &&
            currentItemIndex < flattenedItems.length - 1,
        [currentItemIndex, flattenedItems.length],
    );
    const canGoPrev = useMemo(() => currentItemIndex > 0, [currentItemIndex]);

    const goToNext = useCallback(() => {
        if (canGoNext) {
            const nextItem = flattenedItems[currentItemIndex + 1];
            const nextEntry = registry[nextItem.id];
            if (nextEntry) {
                selectItem(nextEntry);
            }
        }
    }, [canGoNext, currentItemIndex, flattenedItems, registry, selectItem]);

    const goToPrev = useCallback(() => {
        if (canGoPrev) {
            const prevItem = flattenedItems[currentItemIndex - 1];
            const prevEntry = registry[prevItem.id];
            if (prevEntry) {
                selectItem(prevEntry);
            }
        }
    }, [canGoPrev, currentItemIndex, flattenedItems, registry, selectItem]);

    // If context.selected changes (via a #item link), jump to its category
    useEffect(() => {
        if (currentEntry) {
            setSelectedCategory(currentEntry.categoryKey);
        }
    }, [currentEntry]);

    // Filter and prepare data based on selected category and chapter
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

            // Add keyboard navigation for prev/next
            if (currentEntry !== null) {
                if (event.key === "ArrowLeft" && canGoPrev) {
                    goToPrev();
                } else if (event.key === "ArrowRight" && canGoNext) {
                    goToNext();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentEntry, goBack, canGoPrev, canGoNext, goToPrev, goToNext]);

    return (
        <Card className={cn("items-card flex flex-col relative", className)}>
            <CardHeader className="pb-0 px-4">
                <div className="flex flex-row h-[30px] items-center w-full justify-between px-2">
                    <CardTitle className="flex justify-between items-center w-full">
                        {currentEntry !== null ? (
                            <div className="flex items-center gap-2 md:text-xl text-sm">
                                <span>
                                    {categoryMap[selectedCategory].label}
                                </span>
                                <ArrowRight size={18} className="opacity-60" />
                                <span className="font-medium">
                                    {currentEntry.item.title}
                                </span>
                            </div>
                        ) : (
                            <span>{categoryMap[selectedCategory].label}</span>
                        )}
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

                {currentEntry !== null && (
                    <ViewSectionJumper
                        content={currentEntry.item.content || ""}
                        className="block md:hidden absolute top-0 right-[22px] z-50"
                    />
                )}

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

                {/* Prev/Next Navigation */}
                {currentEntry !== null && (
                    <button
                        onClick={goToPrev}
                        disabled={!canGoPrev}
                        className={cn(
                            "absolute bottom-4 p-2 rounded-full transition-all",
                            "bg-white/20 backdrop-blur-sm shadow-md",
                            "hover:bg-white/30 hover:scale-105",
                            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
                            "left-[16px] md:left-auto md:right-[60px]",
                        )}
                        title="Previous entry (←)"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}
                {currentEntry !== null && (
                    <button
                        onClick={goToNext}
                        disabled={!canGoNext}
                        className={cn(
                            "absolute bottom-4 right-[16px] p-2 rounded-full transition-all",
                            "bg-white/20 backdrop-blur-sm shadow-md",
                            "hover:bg-white/30 hover:scale-105",
                            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
                        )}
                        title="Next entry (→)"
                    >
                        <ChevronRight size={20} />
                    </button>
                )}
            </CardFooter>
        </Card>
    );
};

export default ViewGlossaryCard;
