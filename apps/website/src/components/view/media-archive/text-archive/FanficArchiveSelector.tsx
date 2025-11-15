import { FanficEntry } from "@/components/view/media-archive/text-archive/types";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { BookHeart, User } from "lucide-react";

interface FanficArchiveSelectorProps {
    fanfic: FanficEntry;
    onClick?: () => void;
}

const FanficArchiveSelector = ({
    fanfic,
    onClick,
}: FanficArchiveSelectorProps) => {
    return (
        <a
            className={cn(
                "group cursor-pointer overflow-hidden rounded-lg p-4",
                "bg-white/90 dark:bg-white/10 backdrop-blur-md shadow-lg",
                "hover:shadow-xl hover:ring-2 hover:ring-accent transition-all",
                "flex flex-col gap-2",
            )}
            onClick={(e) => {
                e.preventDefault();
                onClick?.();
            }}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick?.();
                }
            }}
            href={fanfic.src}
            target="_blank"
            rel="noopener noreferrer"
        >
            <div className="flex items-start gap-2">
                <div className="p-2 rounded-lg bg-accent/20 shrink-0">
                    <BookHeart className="size-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm line-clamp-2">
                        {fanfic.title}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <User className="size-3" />
                        <span className="truncate">{fanfic.author}</span>
                    </div>
                </div>
            </div>

            {fanfic.summary && (
                <div
                    className="text-xs text-muted-foreground line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: fanfic.summary }}
                ></div>
            )}

            {fanfic.characters.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                    {fanfic.characters.slice(0, 3).map((char, idx) => (
                        <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary"
                        >
                            {char}
                        </span>
                    ))}
                    {fanfic.characters.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                            +{fanfic.characters.length - 3}
                        </span>
                    )}
                </div>
            )}
        </a>
    );
};

export default FanficArchiveSelector;
