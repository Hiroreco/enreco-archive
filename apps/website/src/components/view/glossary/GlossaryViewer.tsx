import ViewModelViewer from "@/components/view/glossary/ModelViewer";
import ViewSectionJumper from "@/components/view/glossary/SectionJumper";
import ViewLightbox from "@/components/view/lightbox/Lightbox";
import { ViewMarkdown } from "@/components/view/markdown/Markdown";
import { LookupEntry } from "@/contexts/GlossaryContext";
import { useSettingStore } from "@/store/settingStore";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useRef } from "react";

interface ViewItemViewerProps {
    entry: LookupEntry;
}

const ViewGlossaryViewer = ({ entry }: ViewItemViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const tGlossaryInfo = useTranslations("glossary.info");
    const tCommon = useTranslations("common");
    const locale = useSettingStore((state) => state.locale);

    const handleAnimationComplete = useCallback(() => {
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
    }, [entry.scrollPosition]);

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
                className="flex flex-col items-center md:items-start overflow-y-auto overflow-x-hidden md:overflow-hidden md:flex-row gap-2 md:h-full md:p-0 px-2 relative h-full"
            >
                <div className="flex flex-col items-center justify-between md:h-full">
                    <div className="flex flex-col items-center gap-2 w-[250px]">
                        <p className="font-bold text-center">
                            {tGlossaryInfo("generalInfo")}
                        </p>
                        <div className="w-[250px] h-[250px]">
                            {entry.item.modelSrc && (
                                <ViewModelViewer
                                    modelPath={entry.item.modelSrc}
                                />
                            )}
                            {entry.item.imageSrc && (
                                <ViewLightbox
                                    src={entry.item.imageSrc}
                                    alt={entry.item.title}
                                    className="object-cover size-full"
                                    width={250}
                                    height={250}
                                />
                            )}
                        </div>
                        <div className="w-full text-center flex flex-col gap-[8px]">
                            <p className="text-center underline underline-offset-2 font-semibold">
                                {entry.item.title}
                            </p>

                            <p className="flex flex-col items-center text-sm">
                                <span className="font-semibold text-center">
                                    {tGlossaryInfo("firstAppeared")}
                                </span>
                                <span className="text-muted-foreground text-center">
                                    {entry.item.chapters.includes(-1)
                                        ? tCommon("chapter", { val: 1 })
                                        : tCommon("chapter", {
                                              val: entry.item.chapters[0] + 1,
                                          })}
                                </span>
                            </p>

                            <div className="flex flex-col items-center text-sm">
                                <span className="font-semibold text-center">
                                    {tGlossaryInfo("quote")}
                                </span>
                                <ViewMarkdown
                                    className="italic text-center text-muted-foreground text-sm"
                                    onNodeLinkClicked={() => {}}
                                    onEdgeLinkClicked={() => {}}
                                >
                                    {locale === "ja"
                                        ? entry.item.quote || ""
                                        : `“${entry.item.quote || ""}”`}
                                </ViewMarkdown>
                            </div>
                        </div>
                    </div>

                    <div
                        className="flex overflow-x-scroll overflow-y-hidden gap-2 content-container md:w-[250px] w-[300px] min-h-0"
                        style={{ padding: "0.5rem" }}
                    >
                        {entry.item.galleryImages.map((image, index) => (
                            <div
                                key={index}
                                className="shrink-0 flex-none"
                                style={{
                                    aspectRatio: "16/9",
                                    height: "100%",
                                }}
                            >
                                <ViewLightbox
                                    width={124}
                                    height={70}
                                    src={image.source.replace(
                                        "-opt.webp",
                                        "-opt-thumb.webp",
                                    )}
                                    alt={image.title || "Gallery image"}
                                    containerClassName="w-full h-full"
                                    className="w-full h-full border-2 border-foreground/30 shadow-md rounded-lg object-cover cursor-pointer opacity-70 hover:opacity-100 transition-all"
                                    galleryItems={entry.item.galleryImages.map(
                                        (img) => ({
                                            src: img.source,
                                            alt: img.title || "Gallery image",
                                            type: "image",
                                        }),
                                    )}
                                    galleryIndex={index}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <Separator className="md:hidden" />

                <div className="flex flex-col gap-4 h-full w-full md:w-[calc(100%-250px)] relative">
                    <ViewSectionJumper
                        className="hidden md:block"
                        content={entry.item.content || ""}
                    />

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
                            {entry.item.content}
                        </ViewMarkdown>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ViewGlossaryViewer;
