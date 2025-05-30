import ViewModelViewer from "@/components/view/items-page/ViewModelViewer";
import ViewLightbox from "@/components/view/ViewLightbox";
import { ViewMarkdown } from "@/components/view/ViewMarkdown";
import { CommonItemData } from "@enreco-archive/common/types";

interface ViewItemViewerProps {
    item: CommonItemData;
}

const ViewItemViewer = ({ item }: ViewItemViewerProps) => {
    return (
        <div className="flex flex-col items-center md:items-baseline overflow-y-auto overflow-x-hidden md:overflow-hidden md:flex-row gap-4 relative h-full px-2">
            <div className="w-[250px]">
                <p className="font-bold text-center">Model Viewer</p>
                <div className="w-full h-[250px]">
                    {item.modelSrc && (
                        <ViewModelViewer modelPath={item.modelSrc} />
                    )}
                </div>
                <div className="mt-4 w-full">
                    <p className="text-center underline underline-offset-2 font-semibold">
                        {item.title}
                    </p>

                    <p className="flex flex-col items-center text-sm mt-4">
                        <span className="font-semibold text-center">
                            First Appeared
                        </span>
                        <span className="text-muted-foreground text-center">
                            Chapter {item.chapter + 1}
                        </span>
                    </p>

                    <p className="flex flex-col items-center text-sm mt-4">
                        <span className="font-semibold text-center">Quote</span>
                        <span className="italic text-center text-muted-foreground text-sm">
                            {item.quote}
                        </span>
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4 h-full">
                <div className="w-full grow md:overflow-y-auto md-content-container">
                    <ViewMarkdown
                        onNodeLinkClicked={() => {}}
                        onEdgeLinkClicked={() => {}}
                    >
                        {item.content}
                    </ViewMarkdown>
                </div>

                <div className="shrink-0 flex overflow-x-auto w-full content-container">
                    {item.galleryImages.map((image, index) => (
                        <ViewLightbox
                            key={index}
                            width={178}
                            height={100}
                            src={image.source.replace(
                                ".webp",
                                "-thumbnail.webp",
                            )}
                            alt={image.title || "Gallery image"}
                            className="rounded-lg h-[100px] w-[178px] object-cover border-2 border-foreground/30 shadow-md cursor-pointer opacity-70 hover:opacity-100 transition-all mr-2"
                            galleryImages={item.galleryImages.map((img) => ({
                                src: img.source,
                                alt: img.title || "Gallery image",
                            }))}
                            galleryIndex={index}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ViewItemViewer;
