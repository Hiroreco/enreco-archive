import { useTranslations } from "next-intl";
import { RecollectionArchiveEntry } from "../types";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import ViewVideoArchiveSelector from "./ViewVideoArchiveSelector";

interface ChapterSectionProps {
    chapter: number;
    categories: Record<string, RecollectionArchiveEntry[]>;
    onEntryClick: (entry: RecollectionArchiveEntry) => void;
}

const VideoArchiveSection = ({
    chapter,
    categories,
    onEntryClick,
}: ChapterSectionProps) => {
    const t = useTranslations("mediaArchive");
    const tCommon = useTranslations("common");

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-4">
                <Separator className="bg-foreground/60 flex-1" />
                <span className="text-lg font-bold whitespace-nowrap">
                    {tCommon("chapter", { val: chapter })}
                </span>
                <Separator className="bg-foreground/60 flex-1" />
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3">
                {Object.entries(categories).map(([categoryName, entries]) =>
                    entries.map((entry, index) => (
                        <div
                            key={entry.id}
                            className="flex flex-col gap-1.5 mb-2"
                        >
                            {/* Category label only on first entry */}
                            {index === 0 && (
                                <span className="text-xs font-medium text-muted-foreground">
                                    {t(`videoArchive.category.${categoryName}`)}
                                </span>
                            )}
                            <ViewVideoArchiveSelector
                                entry={entry}
                                onEntryClick={onEntryClick}
                            />
                        </div>
                    )),
                )}
            </div>
        </div>
    );
};

export default VideoArchiveSection;
