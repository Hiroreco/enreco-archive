import ViewModelViewer from "@/components/view/items-page/ViewModelViewer";
import ViewLightbox from "@/components/view/ViewLightbox";
import { ViewMarkdown } from "@/components/view/ViewMarkdown";
import { LookupEntry } from "@/contexts/GlossaryContext";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { useEffect, useRef } from "react";

interface ViewItemViewerProps {
    entry: LookupEntry;
}

const ViewGlossaryViewer = ({ entry }: ViewItemViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Handle scroll position restoration and reset
    useEffect(() => {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
            const isMobile = window.innerWidth < 768;
            const scrollElement = isMobile
                ? containerRef.current
                : contentRef.current;

            if (scrollElement) {
                scrollElement.scrollTop = entry.scrollPosition || 0;
            }
        });
    }, [entry]);

    const item = entry.item;

    return (
        <div
            ref={containerRef}
            id="glossary-viewer-container"
            className="flex flex-col items-center md:items-start overflow-y-auto overflow-x-hidden md:overflow-hidden md:flex-row gap-2 h-full md:p-0 px-2"
        >
            <div className="flex flex-col items-center justify-between h-full">
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
                    <div className="w-full text-center">
                        <p className="text-center underline underline-offset-2 font-semibold">
                            {item.title}
                        </p>

                        <p className="flex flex-col items-center text-sm mt-4">
                            <span className="font-semibold text-center">
                                First Appeared
                            </span>
                            <span className="text-muted-foreground text-center">
                                Chapter{" "}
                                {item.chapters.includes(-1)
                                    ? 1
                                    : item.chapters[0] + 1}
                            </span>
                        </p>

                        <p className="flex flex-col items-center text-sm mt-4">
                            <span className="font-semibold text-center">
                                Quote
                            </span>
                            <span className="italic text-center text-muted-foreground text-sm">
                                “{item.quote}”
                            </span>
                        </p>
                    </div>
                </div>

                <div className="shrink-0 flex overflow-x-scroll content-container md:w-[250px] w-[320px]">
                    {item.galleryImages.map((image, index) => (
                        <ViewLightbox
                            key={index}
                            width={178}
                            height={100}
                            src={image.source.replace(".webp", "-thumb.webp")}
                            alt={image.title || "Gallery image"}
                            className="h-[70px] aspect-video rounded-lg object-cover border-2 border-foreground/30 shadow-md cursor-pointer opacity-70 hover:opacity-100 transition-all mr-2"
                            galleryImages={item.galleryImages.map((img) => ({
                                src: img.source,
                                alt: img.title || "Gallery image",
                            }))}
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
        </div>
    );
};

export default ViewGlossaryViewer;
