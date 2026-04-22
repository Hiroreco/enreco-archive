import { ViewMarkdown } from "@/components/view/markdown/Markdown";
import ChapterRecapToolbar from "@/components/view/utility-modals/ChapterRecapToolbar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { extractMarkdownSections } from "@/components/view/glossary/glossary-utils";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { useSettingStore } from "@/store/settingStore";
import { Button } from "@enreco-archive/common-ui/components/button";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

// There's a bug where sometimes after scrolling to the end, the "Next" button doesn't disable when it should, because it thinks that it can scroll a little more. 
// This magic number is a buffer to prevent that from happening. It's not perfect, but it works in practice.
const MAGIC_NUMBER_THRESHOLD = 100;

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
    const [canScrollRight, setCanScrollRight] = useState(true);
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

    // Disable browser scroll restoration for this component
    useEffect(() => {
        if (typeof window !== "undefined" && "scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }
    }, []);

    const onOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                onClose();
            }
        },
        [onClose],
    );

    // Reset page when chapter changes
    useEffect(() => {
        setCurrentPage(0);
        setCurrentSection(sections[0]?.id || "");
        setCanScrollRight(true);
        if (columnsContainerRef.current) {
            columnsContainerRef.current.scrollLeft = 0;
        }
    }, [chapter, sections]);

    // Reset scroll position when modal opens (prevents browser scroll restoration)
    useEffect(() => {
        if (open) {
            // rAF ensures this runs after the browser has restored scroll,
            // then we immediately override it
            const raf = requestAnimationFrame(() => {
                if (columnsContainerRef.current) {
                    columnsContainerRef.current.scrollLeft = 0;
                }
                setCurrentPage(0);
            });
            return () => cancelAnimationFrame(raf);
        }
    }, [open]);


    // Track current page and section based on actual scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (!columnsContainerRef.current) return;
            const container = columnsContainerRef.current;
            const stride = container.clientWidth;
            const newPage = Math.round(container.scrollLeft / stride);

            // Only update page from scroll when not doing a programmatic scroll
            // (programmatic scrolls have already set the page from the button handler)
            if (!isScrollingProgrammatically.current) {
                setCurrentPage(newPage);
            }

            if (!isScrollingProgrammatically.current) {
                // Find the last section that's visible on this page
                const pageStart = newPage * stride;
                const pageEnd = pageStart + stride;
                const containerRect = container.getBoundingClientRect();

                let visibleSection: string | undefined;
                for (let i = sectionIds.length - 1; i >= 0; i--) {
                    const id = sectionIds[i];
                    const el = document.getElementById(id);
                    if (!el) continue;

                    const elemRect = el.getBoundingClientRect();
                    const elemScrollLeft = container.scrollLeft + (elemRect.left - containerRect.left);

                    if (elemScrollLeft >= pageStart && elemScrollLeft < pageEnd) {
                        visibleSection = id;
                        break;
                    }
                }

                // Fallback: find the last section before page end
                if (!visibleSection) {
                    for (let i = sectionIds.length - 1; i >= 0; i--) {
                        const id = sectionIds[i];
                        const el = document.getElementById(id);
                        if (!el) continue;

                        const elemRect = el.getBoundingClientRect();
                        const elemScrollLeft = container.scrollLeft + (elemRect.left - containerRect.left);

                        if (elemScrollLeft < pageEnd) {
                            visibleSection = id;
                            break;
                        }
                    }
                }

                if (visibleSection) {
                    console.log(visibleSection);
                    setCurrentSection(visibleSection);
                }
            }
        };

        const container = columnsContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll, { passive: true });
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, [sectionIds, currentPage]);

    const scrollToPage = useCallback((pageIndex: number) => {
        if (!columnsContainerRef.current) return;
        const container = columnsContainerRef.current;
        const stride = container.clientWidth;
        container.scrollLeft = pageIndex * stride;
    }, []);

    const goToPreviousPage = useCallback(() => {
        if (!columnsContainerRef.current) return;
        const container = columnsContainerRef.current;
        const stride = container.clientWidth;
        const currentPage = Math.round(container.scrollLeft / stride);
        const newPage = Math.max(0, currentPage - 1);

        isScrollingProgrammatically.current = true;
        setCurrentPage(newPage);
        scrollToPage(newPage);

        // Calculate canScrollRight immediately based on target scroll position
        const targetScrollLeft = newPage * stride;
        const canScroll = targetScrollLeft + container.clientWidth < container.scrollWidth - MAGIC_NUMBER_THRESHOLD;
        setCanScrollRight(canScroll);

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            isScrollingProgrammatically.current = false;
        }, 600);
    }, [scrollToPage]);

    const goToNextPage = useCallback(() => {
        if (!columnsContainerRef.current) return;
        const container = columnsContainerRef.current;
        const stride = container.clientWidth;
        const currentPage = Math.round(container.scrollLeft / stride);
        const newPage = currentPage + 1;

        isScrollingProgrammatically.current = true;
        setCurrentPage(newPage);
        scrollToPage(newPage);

        // Calculate canScrollRight immediately based on target scroll position
        const targetScrollLeft = newPage * stride;
        const canScroll = targetScrollLeft + container.clientWidth < container.scrollWidth - MAGIC_NUMBER_THRESHOLD;
        setCanScrollRight(canScroll);

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            isScrollingProgrammatically.current = false;
        }, 600);
    }, [scrollToPage]);

    const handleSectionChange = useCallback((sectionId: string) => {
        if (currentSection === sectionId) return;

        isScrollingProgrammatically.current = true;

        const element = document.getElementById(sectionId);
        if (element && columnsContainerRef.current) {
            const container = columnsContainerRef.current;
            const stride = container.clientWidth;

            // Get the actual scroll position where this element appears
            const elemRect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const elemScrollLeft = container.scrollLeft + (elemRect.left - containerRect.left);

            const targetPage = Math.floor(elemScrollLeft / stride);

            setCurrentPage(targetPage);
            container.scrollLeft = targetPage * stride;

            // Calculate canScrollRight for the target position
            const targetScrollLeft = targetPage * stride;
            const canScroll = targetScrollLeft + container.clientWidth < container.scrollWidth - MAGIC_NUMBER_THRESHOLD;
            setCanScrollRight(canScroll);
        }

        setCurrentSection(sectionId);

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            isScrollingProgrammatically.current = false;
        }, 300);
    }, [currentSection]);

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
                className="md:max-w-[1200px] h-[90dvh] max-h-none max-w-none w-[95vw] overflow-hidden transition-all"
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
                        {/* Vertical separator between pages */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/50 transform -translate-x-1/2 pointer-events-none z-10" />
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={chapter}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                {/* Outer wrapper owns the padding — NOT inside the column flow */}
                                <div className="h-full px-4 md:px-8">
                                    {/* Two-column scroll container */}
                                    <div
                                        ref={columnsContainerRef}
                                        className="h-full py-4 overflow-y-hidden overflow-x-auto"
                                        style={{
                                            columnCount: 2,
                                            columnGap: "0px",
                                            scrollBehavior: "smooth",
                                            scrollbarWidth: "none",
                                            msOverflowStyle: "none",
                                        }}
                                    >
                                        {useMemo(() => (
                                            <div>
                                                <ViewMarkdown
                                                    className="px-4"
                                                    // Each column's content gets internal padding
                                                    // This creates visual breathing room without affecting scrollWidth
                                                    onNodeLinkClicked={() => { }}
                                                    onEdgeLinkClicked={() => { }}
                                                >
                                                    {data.chapters[chapter].content}
                                                </ViewMarkdown>
                                            </div>
                                        ), [chapter, data.chapters])}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between px-4 border-t pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 0}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            {t("previous")}
                        </Button>

                        <span className="text-sm text-muted-foreground">
                            {t("page", { val: currentPage + 1 })}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextPage}
                            disabled={!canScrollRight}
                        >
                            {t("next")}
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
