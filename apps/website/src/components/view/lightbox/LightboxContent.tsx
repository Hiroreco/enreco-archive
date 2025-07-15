import { GalleryItem } from "@/components/view/lightbox/types";
import { getBlurDataURL } from "@/lib/utils";
import Image from "next/image";

interface LightboxContentProps {
    currentItem: GalleryItem;
    priority: boolean;
}

export const LightboxContent = ({
    currentItem,
    priority,
}: LightboxContentProps) => {
    if (currentItem.type === "image") {
        return (
            <Image
                src={currentItem.src}
                alt={currentItem.alt}
                className="object-contain max-w-full max-h-full"
                placeholder={getBlurDataURL(currentItem.src) ? "blur" : "empty"}
                priority={priority}
                blurDataURL={getBlurDataURL(currentItem.src)}
                width={1200}
                height={1200}
                sizes="(max-width: 768px) 95vw, (max-width: 1024px) 80vw, 60vw"
                style={{ width: "auto", height: "auto" }}
            />
        );
    }

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <video
                src={currentItem.src}
                controls
                preload="metadata"
                style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                }}
                className="object-contain"
            />
        </div>
    );
};
