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
            className="view-item-selector card-deco"
            onClick={onItemClick ? () => onItemClick(item) : undefined}
        >
            <div className="view-item-selector-inner flex items-center gap-2">
                <Image
                    className="h-[80px] w-[80px] object-cover"
                    src={item.thumbnailSrc}
                    alt={item.title}
                    height={100}
                    width={100}
                    style={{
                        backgroundImage: "url('/images-opt/item-bg.webp')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                />

                <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                </div>
            </div>
        </div>
    );
};

export default ViewGlossarySelector;
