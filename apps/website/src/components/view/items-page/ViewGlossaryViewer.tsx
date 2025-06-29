import ViewModelViewer from "@/components/view/items-page/ViewModelViewer";
import ViewLightbox from "@/components/view/ViewLightbox";
import { ViewMarkdown } from "@/components/view/ViewMarkdown";
import { LookupEntry } from "@/contexts/GlossaryContext";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";

interface ViewItemViewerProps {
    entry: LookupEntry;
}

const ViewGlossaryViewer = ({ entry }: ViewItemViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const item = entry.item;

    const handleAnimationComplete = () => {
        // Handle scroll position restoration after animation completes
        requestAnimationFrame(() => {
            const isMobile = window.innerWidth < 768;
            const scrollElement = isMobile
                ? containerRef.current
                : contentRef.current;

            if (scrollElement) {
                scrollElement.scrollTo({
                    top: entry.scrollPosition || 0,
                    behavior: "smooth",
                });
            }
        });
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={entry.item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onAnimationComplete={handleAnimationComplete}
                ref={containerRef}
                id="glossary-viewer-container"
                className="flex flex-col items-center md:items-start overflow-y-auto overflow-x-hidden md:overflow-hidden md:flex-row gap-2 md:h-full md:p-0 px-2"
            >
                <div className="flex flex-col items-center justify-between md:h-full">
                    <div className="flex flex-col items-center gap-2 w-[250px]">
                        <p className="font-bold text-center">General Info</p>
                        <div className="w-[250px] h-[250px]">
                            {item.modelSrc && (
                                <ViewModelViewer modelPath={item.modelSrc} />
                            )}
                            {item.imageSrc && (
                                <ViewLightbox
                                    src={item.imageSrc}
                                    alt={item.title}
                                    className="object-cover size-full"
                                    width={250}
                                    height={250}
                                />
                            )}
                        </div>
                        <div className="w-full text-center flex flex-col gap-[8px]">
                            <p className="text-center underline underline-offset-2 font-semibold">
                                {item.title}
                            </p>

                            <p className="flex flex-col items-center text-sm">
                                <span className="font-semibold text-center">
                                    First Appeared
                                </span>
                                <span className="text-muted-foreground text-center">
                                    {item.chapters.includes(-1)
                                        ? "Chapter 1"
                                        : `Chapter ${item.chapters[0] + 1}`}
                                </span>
                            </p>

                            <p className="flex flex-col items-center text-sm">
                                <span className="font-semibold text-center">
                                    Quote
                                </span>
                                <span className="italic text-center text-muted-foreground text-sm">
                                    “{item.quote}”
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex overflow-x-scroll overflow-y-hidden gap-2 content-container md:w-[250px] w-[300px]">
                        {item.galleryImages.map((image, index) => (
                            <ViewLightbox
                                key={index}
                                width={178}
                                height={100}
                                src={image.source.replace(
                                    "-opt.webp",
                                    "-opt-thumb.webp",
                                )}
                                alt={image.title || "Gallery image"}
                                containerClassName="shrink-0"
                                className="h-[100px] border-2 border-foreground/30 shadow-md rounded-lg aspect-video object-cover cursor-pointer opacity-70 hover:opacity-100 transition-all"
                                galleryImages={item.galleryImages.map(
                                    (img) => ({
                                        src: img.source,
                                        alt: img.title || "Gallery image",
                                    }),
                                )}
                                galleryIndex={index}
                            />
                        ))}
                    </div>
                </div>

                <Separator className="md:hidden" />

                <div className="flex flex-col gap-4 h-full w-full md:w-[calc(100%-250px)]">
                    <div
                        ref={contentRef}
                        id="glossary-viewer-content-container"
                        className="w-full grow md:overflow-y-auto md-content-container"
                    >
                        <ViewMarkdown
                            className="p-2"
                            onNodeLinkClicked={() => {}}
                            onEdgeLinkClicked={() => {}}
                        >
                            {item.content}
                        </ViewMarkdown>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ViewGlossaryViewer;
