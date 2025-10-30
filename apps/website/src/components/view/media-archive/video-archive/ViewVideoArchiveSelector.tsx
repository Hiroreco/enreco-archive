import React from "react";
import { RecollectionArchiveEntry } from "../types";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import Image from "next/image";
import { getBlurDataURL } from "@/lib/utils";

interface ViewVideoArchiveSelectorProps {
    entry: RecollectionArchiveEntry;
    onEntryClick?: (entry: RecollectionArchiveEntry) => void;
}

const ViewVideoArchiveSelector = ({
    entry,
    onEntryClick,
}: ViewVideoArchiveSelectorProps) => {
    const thumbnailUrl = entry.thumbnailUrl;

    return (
        <div
            className={cn(
                "group cursor-pointer overflow-hidden rounded-lg",
                "bg-white/90 dark:bg-white/10 backdrop-blur-md shadow-lg",
                "hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
                "flex flex-col",
            )}
            onClick={onEntryClick ? () => onEntryClick(entry) : undefined}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onEntryClick?.(entry);
                }
            }}
        >
            {/* Desktop: Vertical Layout */}
            <div className="hidden md:flex md:flex-col">
                <div className="relative w-full aspect-video overflow-hidden">
                    <Image
                        src={thumbnailUrl}
                        alt={entry.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        blurDataURL={getBlurDataURL(thumbnailUrl)}
                        placeholder={
                            getBlurDataURL(thumbnailUrl) ? "blur" : "empty"
                        }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                <div className="p-2.5 flex flex-col gap-1 flex-1">
                    <span className="font-semibold text-xs line-clamp-2 leading-tight">
                        {entry.title}
                    </span>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                        {entry.description}
                    </p>
                </div>
            </div>

            {/* Mobile: Horizontal Layout */}
            <div className="flex md:hidden items-center gap-2.5 p-2.5">
                <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-md">
                    <Image
                        src={thumbnailUrl}
                        alt={entry.title}
                        fill
                        className="object-cover"
                        blurDataURL={getBlurDataURL(thumbnailUrl)}
                        placeholder={
                            getBlurDataURL(thumbnailUrl) ? "blur" : "empty"
                        }
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <span className="font-semibold text-xs line-clamp-2 leading-tight">
                        {entry.title}
                    </span>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-tight">
                        {entry.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ViewVideoArchiveSelector;
