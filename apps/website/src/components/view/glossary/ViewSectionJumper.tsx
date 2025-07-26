import { extractMarkdownSections } from "@/components/view/glossary/glossary-utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@enreco-archive/common-ui/components/dropdownmenu";

import { cn } from "@enreco-archive/common-ui/lib/utils";
import { List } from "lucide-react";
import { useMemo } from "react";

interface ViewSectionJumperProps {
    content: string;
    className?: string;
}

const ViewSectionJumper = ({ content, className }: ViewSectionJumperProps) => {
    const sections = useMemo(() => extractMarkdownSections(content), [content]);

    const handleSectionClick = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    if (sections.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "absolute top-4 right-4 z-10 p-2 rounded-md transition-all",
                        "bg-background/50 backdrop-blur-md border shadow-sm",
                        "hover:bg-background/90 hover:shadow-md",
                        className,
                    )}
                    title="Jump to section"
                >
                    <List size={16} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 max-h-80 overflow-y-auto bg-background/50 backdrop-blur-md"
            >
                {sections.map((section) => (
                    <DropdownMenuItem
                        key={section.id}
                        onClick={() => handleSectionClick(section.id)}
                        className={cn(
                            "cursor-pointer",
                            // Add indentation based on heading level
                            section.level === 2 && "pl-3 font-semibold",
                            section.level === 3 && "pl-6 font-medium",
                            section.level === 4 &&
                                "pl-9 text-sm text-muted-foreground",
                        )}
                    >
                        {/* Visual hierarchy indicators */}
                        {section.level === 2 && (
                            <span className="mr-2 text-primary">●</span>
                        )}
                        {section.level === 3 && (
                            <span className="mr-2 text-muted-foreground">
                                ○
                            </span>
                        )}
                        {section.level === 4 && (
                            <span className="mr-2 text-muted-foreground">
                                ‣
                            </span>
                        )}
                        <span className="truncate">{section.title}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ViewSectionJumper;
