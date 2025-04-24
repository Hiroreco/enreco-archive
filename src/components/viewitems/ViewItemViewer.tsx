import { ViewMarkdown } from "@/components/view/ViewMarkdown";
import ViewModelViewer from "@/components/viewitems/ViewModelViewer";
import { CommonItemData } from "@/lib/type";
import { useState } from "react";

import ImageBlur from "@/components/ImageBlur";
import LightBoxNextImage from "@/components/viewitems/LightBoxNextImage";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/styles.css";

interface ViewItemViewerProps {
    item: CommonItemData;
}

const ViewItemViewer = ({ item }: ViewItemViewerProps) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    return (
        <div className="flex flex-col items-center md:items-baseline overflow-y-auto overflow-x-hidden md:overflow-hidden md:flex-row gap-4 relative h-full">
            <div className="w-[250px]">
                <p className="font-bold text-center">Model Viewer</p>
                <div className="w-full h-[250px]">
                    {item.modelSrc && (
                        <ViewModelViewer modelPath={item.modelSrc} />
                    )}
                </div>
                <div className="mt-4 w-full">
                    <p className="text-center underline underline-offset-2 font-semibold">
                        {item.name}
                    </p>

                    <div className="mt-2 w-full justify-around flex">
                        <p className="flex flex-col items-center text-sm">
                            <span className="font-semibold">Category</span>
                            <span className="text-muted-foreground">
                                Weapon
                            </span>
                        </p>
                        <p className="flex flex-col items-center text-sm">
                            <span className="font-semibold">Type</span>
                            <span className="text-muted-foreground">Range</span>
                        </p>
                    </div>

                    <p className="mt-4 italic text-center text-muted-foreground text-sm">
                        "Tickle tickle~ Oh crap I think I just exploded"
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
                        <ImageBlur
                            width={178}
                            height={100}
                            key={index}
                            src={image.source.replace(
                                ".webp",
                                "-thumbnail.webp",
                            )}
                            alt={"thumbnail"}
                            className="rounded-lg h-[100px] w-[178px] object-cover border-2 border-foreground/30 shadow-md cursor-pointer opacity-70 hover:opacity-100 transition-all"
                            onClick={() => openLightbox(index)}
                        />
                    ))}
                </div>
            </div>

            {/* https://yet-another-react-lightbox.com/examples/nextjs */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                controller={{
                    closeOnBackdropClick: true,
                }}
                plugins={[Thumbnails, Captions]}
                slides={item.galleryImages.map((image) => ({
                    src: image.source,
                    thumbnail: image.source.replace(".webp", "-thumbnail.webp"),
                    title: image.title,
                }))}
                render={{
                    slide: LightBoxNextImage,
                    // @ts-expect-error yalb doesn't have proper types so yeah
                    thumbnail: LightBoxNextImage,
                }}
            />
        </div>
    );
};

export default ViewItemViewer;
