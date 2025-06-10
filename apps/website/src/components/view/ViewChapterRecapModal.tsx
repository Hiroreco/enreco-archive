import { ViewMarkdown } from "@/components/view/ViewMarkdown";
import ViewChapterRecapToolbar from "@/components/view/ViewChapterRecapToolbar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useEffect, useMemo, useRef, useState } from "react";

import data from "#/chapter-recaps.json";
import { Section } from "@/components/view/ViewChapterRecapToolbar";
import { AnimatePresence, motion } from "framer-motion";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { Button } from "@enreco-archive/common-ui/components/button";
import { useSettingStore } from "@/store/settingStore";

interface ViewChapterRecapModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentChapter: number;
}

function extractSections(content: string): Section[] {
    const regex = /### (.*?)(?=\n|$)/g;
    const matches = [...content.matchAll(regex)];

    return matches.map((match) => ({
        id: match[1].trim(),
        title: match[1].trim(),
    }));
}

const ViewChapterRecapModal = ({
    open,
    onOpenChange,
    currentChapter,
}: ViewChapterRecapModalProps) => {
    const validCurrentChapter = currentChapter < data.chapters.length;
    const initialChapter = validCurrentChapter
        ? currentChapter
        : data.chapters.length - 1;
    const [chapter, setChapter] = useState(initialChapter);
    const [currentSection, setCurrentSection] = useState("");
    const contentRef = useRef<HTMLDivElement>(null);

    const isScrollingProgrammatically = useRef(false);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    const sections = useMemo(
        () => extractSections(data.chapters[chapter].content),
        [chapter],
    );
    const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);
    const activeSection = useScrollSpy(sectionIds);
    const backdropFiler = useSettingStore((state) => state.backdropFilter);

    // To avoid setting the current section when the user is scrolling programmatically
    useEffect(() => {
        // Use a short timeout to smooth out rapid section changes
        const timer = setTimeout(() => {
            if (activeSection && !isScrollingProgrammatically.current) {
                setCurrentSection(activeSection);
            }
        }, 20);

        return () => clearTimeout(timer);
    }, [activeSection]);

    useEffect(() => {
        const contentElement = contentRef.current;
        if (!contentElement) return;

        // Add passive scroll listener for better performance
        contentElement.addEventListener("scroll", () => {}, { passive: true });

        return () => {
            contentElement.removeEventListener("scroll", () => {});

            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
        };
    }, []);

    useEffect(() => {
        setCurrentSection(sections[0]?.id || "");
        contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, [chapter, sections]);

    const handleSectionChange = (sectionId: string) => {
        if (currentSection === sectionId) return;

        setCurrentSection(sectionId);
        isScrollingProgrammatically.current = true;

        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });

            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }

            scrollTimeout.current = setTimeout(() => {
                isScrollingProgrammatically.current = false;
            }, 800);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="md:max-w-[800px] h-[95dvh] max-h-none max-w-none w-[95vw] overflow-hidden transition-all"
                showXButton={true}
                backdropFilter={backdropFiler}
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
                    <ViewChapterRecapToolbar
                        currentChapter={chapter}
                        currentSection={currentSection}
                        chapters={data.chapters}
                        sections={sections}
                        onChapterChange={setChapter}
                        onSectionChange={handleSectionChange}
                    />

                    <div className="overflow-auto flex-1 p-4" ref={contentRef}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={chapter}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Without this memo, every section change would cause the Markdown to rerender  */}
                                {useMemo(
                                    () => (
                                        <ViewMarkdown
                                            className="pb-20"
                                            onNodeLinkClicked={() => {}}
                                            onEdgeLinkClicked={() => {}}
                                        >
                                            {data.chapters[chapter].content}
                                        </ViewMarkdown>
                                    ),
                                    [chapter],
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
                <div className="md:hidden absolute bottom-4 flex justify-center left-0 right-0 px-10 card-deco border-t pt-4">
                    <Button
                        className="bg-accent text-accent-foreground w-full"
                        onClick={() => onOpenChange(false)}
                    >
                        <span className="text-lg">Close</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewChapterRecapModal;
