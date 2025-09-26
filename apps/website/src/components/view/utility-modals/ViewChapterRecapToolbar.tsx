import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { useTranslations } from "next-intl";

export interface Section {
    id: string;
    title: string;
}

interface Props {
    currentChapter: number;
    currentSection: string;
    chapters: { title: string; content: string }[];
    sections: Section[];
    onChapterChange: (chapter: number) => void;
    onSectionChange: (sectionId: string) => void;
}

const ViewChapterRecapToolbar = ({
    currentChapter,
    currentSection,
    chapters,
    sections,
    onChapterChange,
    onSectionChange,
}: Props) => {
    const t = useTranslations("common");

    const handleSectionChange = (sectionId: string) => {
        onSectionChange(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            // Get the scroll container (the modal's content area)
            const container = element.closest('.overflow-auto') as HTMLElement;
            if (container) {
                const elementTop = element.offsetTop;
                const offsetWithPadding = elementTop - 0; // Add padding from top
                container.scrollTo({
                    top: Math.max(0, offsetWithPadding),
                    behavior: "smooth",
                });
            } else {
                // Fallback to original method if container not found
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <div className="flex items-center gap-4 p-2 border-b">
            <Select
                value={currentChapter.toString()}
                onValueChange={(value) => onChapterChange(parseInt(value))}
            >
                <SelectTrigger className="grow font-bold">
                    <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                    {chapters.map((chapter, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>
                            {t("chapter", { val: idx + 1 })}: {chapter.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={currentSection}
                onValueChange={handleSectionChange}
                disabled={sections.length === 0}
            >
                <SelectTrigger className="grow font-bold">
                    <SelectValue placeholder="Jump to section" />
                </SelectTrigger>
                <SelectContent>
                    {sections.map((section, idx) => (
                        <SelectItem key={section.id} value={section.id}>
                            {t("section", { val: idx + 1 })}: {section.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default ViewChapterRecapToolbar;
