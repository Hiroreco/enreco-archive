import { cn } from "@enreco-archive/common-ui/lib/utils";
import { BookHeart, User } from "lucide-react";

interface FanficEntry {
    author: string;
    title: string;
    characters: string[];
    tags: string[];
    summary: string;
    src: string;
    storyKey: string;
}

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
                "hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
                "flex flex-col gap-2",
            )}
            onClick={onClick}
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
                    <h3 className="font-semibold text-sm line-clamp-2">
                        {fanfic.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <User className="size-3" />
                        <span className="truncate">{fanfic.author}</span>
                    </div>
                </div>
            </div>

            {fanfic.summary && (
                <p className="text-xs text-muted-foreground line-clamp-3">
                    {fanfic.summary}
                </p>
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
