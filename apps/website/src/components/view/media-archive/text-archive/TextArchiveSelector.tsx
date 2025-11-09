import { TextGroup } from "@enreco-archive/common/types";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";

interface TextArchiveSelectorProps {
    group: TextGroup;
    groupKey: string;
    onGroupClick?: (groupKey: string) => void;
}

const TextArchiveSelector = ({
    group,
    groupKey,
    onGroupClick,
}: TextArchiveSelectorProps) => {
    const t = useTranslations("mediaArchive.textArchive");
    return (
        <div
            className={cn(
                "group cursor-pointer overflow-hidden rounded-lg p-3",
                "bg-white/90 dark:bg-white/10 backdrop-blur-md shadow-lg",
                "hover:shadow-xl hover:ring-2 hover:ring-accent transition-all",
                "flex items-center gap-3 size-full",
            )}
            onClick={onGroupClick ? () => onGroupClick(groupKey) : undefined}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onGroupClick?.(groupKey);
                }
            }}
        >
            <div className="p-2 rounded-lg bg-accent/20 shrink-0">
                <BookOpen className="size-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-1">
                    {group.title || groupKey}
                </p>
                {group.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {group.description}
                    </p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                    {group.entries.length}{" "}
                    {group.entries.length === 1
                        ? t("entryCount.singular")
                        : t("entryCount.plural")}
                </p>
            </div>
        </div>
    );
};

export default TextArchiveSelector;
