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
            className="content-container h-[100px] flex items-center gap-2 cursor-pointer hover:bg-accent hover:text-primary-foreground transition-all"
            onClick={onItemClick ? () => onItemClick(item) : undefined}
        >
            <Image
                className="h-[100px] w-[100px] object-cover"
                src={item.thumbnailSrc}
                alt={item.title}
                height={100}
                width={100}
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
