import ChapterRecapToolbar from "@/components/view/utility-modals/ChapterRecapToolbar";
import { ViewMarkdown } from "@/components/view/markdown/Markdown";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSettingStore } from "@/store/settingStore";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { AnimatePresence, motion } from "framer-motion";
import { extractMarkdownSections } from "@/components/view/glossary/glossary-utils";
import { useTranslations } from "next-intl";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChapterRecapModalProps {
    open: boolean;
    onClose: () => void;
    currentChapter: number;
}

const ChapterRecapModal = ({
    open,
    onClose,
    currentChapter,
}: ChapterRecapModalProps) => {
    const t = useTranslations("common");
    const { getChapterRecap } = useLocalizedData();

    const data = getChapterRecap();
    const validCurrentChapter = currentChapter < data.chapters.length;
    const initialChapter = validCurrentChapter
        ? currentChapter
        : data.chapters.length - 1;
    const [chapter, setChapter] = useState(initialChapter);
    const [currentSection, setCurrentSection] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const columnsContainerRef = useRef<HTMLDivElement>(null);

    const isScrollingProgrammatically = useRef(false);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    const sections = useMemo(
        () => extractMarkdownSections(data.chapters[chapter].content, [3]),
        [chapter, data.chapters],
    );

    const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

    const backdropFilter = useSettingStore((state) => state.backdropFilter);

    const onOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                onClose();
            }
        },
        [onClose],
    );

    // To avoid setting the current section when the user is scrolling programmatically
    useEffect(() => {
        // Use a short timeout to smooth out rapid section changes
        const timer = setTimeout(() => {
            if (!isScrollingProgrammatically.current) {
                // Find which section is visible in the current page
                const currentPageStart = currentPage * 2; // 2 columns per page
                const visibleSectionId = sectionIds[Math.min(currentPageStart, sectionIds.length - 1)];
                setCurrentSection(visibleSectionId || "");
            }
        }, 20);

        return () => clearTimeout(timer);
    }, [currentPage, sectionIds]);

    // Reset page when chapter changes
    useEffect(() => {
        setCurrentPage(0);
        setCurrentSection(sections[0]?.id || "");
        if (columnsContainerRef.current) {
            columnsContainerRef.current.scrollLeft = 0;
        }
    }, [chapter, sections]);

    // Update page number based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (!columnsContainerRef.current) return;
            const pageWidth = columnsContainerRef.current.clientWidth;
            const newPage = Math.round(columnsContainerRef.current.scrollLeft / pageWidth);
            setCurrentPage(newPage);
        };

        const container = columnsContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll, { passive: true });
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, []);

    const goToPreviousPage = useCallback(() => {
        if (!columnsContainerRef.current) return;
        setCurrentPage((prev) => {
            const newPage = Math.max(0, prev - 1);
            const pageWidth = columnsContainerRef.current!.clientWidth;
            columnsContainerRef.current!.scrollLeft = newPage * pageWidth;
            return newPage;
        });
    }, []);

    const goToNextPage = useCallback(() => {
        if (!columnsContainerRef.current) return;
        const container = columnsContainerRef.current;
        const pageWidth = container.clientWidth;
        const maxScroll = container.scrollWidth - container.clientWidth;

        setCurrentPage((prev) => {
            const targetScrollLeft = (prev + 1) * pageWidth;
            if (targetScrollLeft <= maxScroll) {
                container.scrollLeft = targetScrollLeft;
                return prev + 1;
            }
            return prev;
        });
    }, []);

    const handleSectionChange = (sectionId: string) => {
        if (currentSection === sectionId) return;

        setCurrentSection(sectionId);
        isScrollingProgrammatically.current = true;

        // Find which page contains this section
        const sectionIndex = sectionIds.indexOf(sectionId);
        if (sectionIndex !== -1) {
            const pageNumber = Math.floor(sectionIndex / 2);
            setCurrentPage(pageNumber);
            if (columnsContainerRef.current) {
                columnsContainerRef.current.scrollLeft = pageNumber * columnsContainerRef.current.clientWidth;
            }
        }

        if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
        }

        scrollTimeout.current = setTimeout(() => {
            isScrollingProgrammatically.current = false;
        }, 300);
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!columnsContainerRef.current) return;

            if (e.key === "ArrowRight") {
                goToNextPage();
            } else if (e.key === "ArrowLeft") {
                goToPreviousPage();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [goToNextPage, goToPreviousPage]);



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="md:max-w-[1200px] h-[95dvh] max-h-none max-w-none w-[95vw] overflow-hidden transition-all"
                showXButton={true}
                backdropFilter={backdropFilter}
            >
                <VisuallyHidden>
                    <DialogHeader>
                        <DialogTitle>Chapters Recap</DialogTitle>
                    </DialogHeader>
                </VisuallyHidden>

                <VisuallyHidden>
                    <DialogDescription>
                        General recap of the chapters
                    </DialogDescription>
                </VisuallyHidden>

                <div className="h-full w-full flex flex-col">
                    <ChapterRecapToolbar
                        currentChapter={chapter}
                        currentSection={currentSection}
                        chapters={data.chapters}
                        sections={sections}
                        onChapterChange={(newChapter) => {
                            setChapter(newChapter);
                            setCurrentPage(0);
                        }}
                        onSectionChange={handleSectionChange}
                    />

                    {/* Scrollable viewport for double-spread */}
                    <div className="overflow-hidden flex-1 relative" ref={contentRef}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={chapter}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                {/* Two-column scroll container */}
                                <div
                                    ref={columnsContainerRef}
                                    className="h-full overflow-y-hidden overflow-x-auto"
                                    style={{
                                        columnCount: 2,
                                        columnGap: "2rem",
                                        scrollBehavior: "smooth",
                                        scrollbarWidth: "none", // Firefox
                                        msOverflowStyle: "none", // IE and Edge
                                    }}
                                >
                                    {/* Without this memo, every section change would cause the Markdown to rerender  */}
                                    {useMemo(
                                        () => (
                                            <div className="p-4 md:px-8">
                                                <ViewMarkdown
                                                    className="pb-16"
                                                    onNodeLinkClicked={() => { }}
                                                    onEdgeLinkClicked={() => { }}
                                                >
                                                    {data.chapters[chapter].content}
                                                </ViewMarkdown>
                                                <Separator />
                                            </div>
                                        ),
                                        [chapter, data.chapters],
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-background/50">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 0}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </Button>

                        <span className="text-sm text-muted-foreground">
                            Page {currentPage + 1}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextPage}
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
                <div className="md:hidden absolute bottom-20 flex justify-center left-0 right-0 px-10">
                    <Button
                        className="bg-accent text-accent-foreground w-full"
                        onClick={() => onOpenChange(false)}
                    >
                        <span className="text-lg">{t("close")}</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChapterRecapModal;
