import { CommonItemData } from "@/lib/type";
import Image from "next/image";
import React from "react";

interface ItemSelectorProps {
    item: CommonItemData;
    onItemClick?: (item: CommonItemData) => void;
}

const ViewItemSelector = ({ item, onItemClick }: ItemSelectorProps) => {
    return (
        <div
            className="card-deco"
            onClick={onItemClick ? () => onItemClick(item) : undefined}
        >
            <div className="flex items-end justify-center border rounded-lg p-4 cursor-pointer hover:scale-105 transition-all">
                <Image
                    className="w-[50px] h-auto"
                    src={item.thumbnailSrc}
                    alt={item.name}
                    width={50}
                    height={50}
                />
            </div>
        </div>
    );
};

export default ViewItemSelector;
