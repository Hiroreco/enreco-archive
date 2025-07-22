import { getBlurDataURL } from "@/lib/utils";
import { CommonItemData } from "@enreco-archive/common/types";
import Image from "next/image";
import React from "react";

interface ItemSelectorProps {
    item: CommonItemData;
    onItemClick?: (item: CommonItemData) => void;
}

const ViewGlossarySelector = ({ item, onItemClick }: ItemSelectorProps) => {
    return (
        <div
            className="view-item-selector dark:bg-white/10 bg-white/90 backdrop-blur-md shadow-lg"
            onClick={onItemClick ? () => onItemClick(item) : undefined}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onItemClick?.(item);
                }
            }}
        >
            <div className="absolute inset-0 -z-10">
                <Image
                    src={getBlurDataURL(item.thumbnailSrc)}
                    alt=""
                    fill
                    className="object-cover blur-md dark:opacity-10 opacity-30"
                    priority={true}
                />
                {/* Dark overlay to ensure content readability */}
                <div className="absolute inset-0 dark:bg-black/20 bg-white/20" />
            </div>
            <div className="view-item-selector-inner flex items-center gap-2">
                <Image
                    className="h-[80px] w-[80px] object-cover"
                    src={item.thumbnailSrc}
                    alt={item.title}
                    height={100}
                    width={100}
                    style={{
                        backgroundImage: "url('/images-opt/item-bg-opt.webp')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                    priority={true}
                />

                <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                </div>
            </div>
        </div>
    );
};

export default ViewGlossarySelector;
