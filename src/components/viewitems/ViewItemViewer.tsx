import { ViewMarkdown } from "@/components/view/ViewMarkdown";
import ViewModelViewer from "@/components/viewitems/ViewModelViewer";
import { CommonItemData } from "@/lib/type";
import Image from "next/image";
import { useState } from "react";

import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import LightBoxNextImage from "@/components/viewitems/LightBoxNextImage";

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
        <div className="w-full h-full flex md:flex-row gap-4 relative">
            <div className="flex-1 flex flex-col gap-4">
                <div className="w-full grow overflow-y-auto p-4 rounded-lg bg-background/10 backdrop-blur-md border border-white/20 shadow-lg">
                    <ViewMarkdown
                        onNodeLinkClicked={() => {}}
                        onEdgeLinkClicked={() => {}}
                    >
                        {item.content}
                    </ViewMarkdown>
                </div>

                <div className="flex gap-4 h-[150px] overflow-x-auto w-full overflow-y-auto p-4 rounded-lg bg-background/10 backdrop-blur-md border border-white/20 shadow-lg">
                    {item.galleryImages.map((image, index) => (
                        <Image
                            width={204}
                            height={113}
                            key={index}
                            src={image.thumbnailSrc}
                            alt={image.thumbnailSrc}
                            className="rounded-lg aspect-video object-cover border-2 border-foreground/30 shadow-md cursor-pointer opacity-70 hover:opacity-100 transition-all"
                            onClick={() => openLightbox(index)}
                        />
                    ))}
                </div>
            </div>

            <div className="max-w-[300px]">
                <div className="w-full h-[300px]">
                    {item.modelSrc && (
                        <ViewModelViewer modelPath={item.modelSrc} />
                    )}
                </div>
                <div className="mt-4">
                    <p className="text-center underline underline-offset-2 text-xl font-semibold">
                        {item.name}
                    </p>

                    <p className="mt-4">
                        "Tickle tickle or sth Idk I'm just trying to fill up
                        this space" - Shiori, not really
                    </p>
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
                plugins={[Thumbnails]}
                slides={item.galleryImages.map((image) => ({
                    src: image.bigSrc,
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
