import { CommonItemData } from "@enreco-archive/common/types";
import Image from "next/image";
import React from "react";

interface ItemSelectorProps {
    item: CommonItemData;
    onItemClick?: (item: CommonItemData) => void;
}

const ViewItemSelector = ({ item, onItemClick }: ItemSelectorProps) => {
    return (
        <div
            className="py-2 px-4 rounded-lg card-deco backdrop-blur-md border shadow-lg w-full h-[100px] flex items-center gap-2 cursor-pointer hover:brightness-90  transition-all"
            onClick={onItemClick ? () => onItemClick(item) : undefined}
        >
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
                <p className="text-center text-sm font-semibold">
                    {item.title}
                </p>
            </div>
        </div>
    );
};

export default ViewItemSelector;
