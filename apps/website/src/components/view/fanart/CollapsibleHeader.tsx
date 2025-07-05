import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@enreco-archive/common-ui/components/tooltip";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { ChevronUp } from "lucide-react";
import { ReactNode } from "react";

interface CollapsibleHeaderProps {
    isCollapsed: boolean;
    onToggle: () => void;
    children: ReactNode;
}

const CollapseButton = ({
    isCollapsed,
    onClick,
    className,
}: {
    isCollapsed: boolean;
    onClick: () => void;
    className?: string;
}) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger
                    asChild
                    onClick={onClick}
                    className={cn(
                        "bg-background border border-border rounded-full flex items-center justify-center hover:opacity-100 opacity-70 transition-colors z-10 cursor-pointer p-1",
                        className,
                    )}
                >
                    <ChevronUp
                        className={cn(
                            "transition-transform duration-200 size-8",
                            isCollapsed ? "rotate-180" : "rotate-0",
                        )}
                    />
                </TooltipTrigger>
                <TooltipContent side="right">
                    {isCollapsed ? "Expand header" : "Collapse header"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const CollapsibleHeader = ({
    isCollapsed,
    onToggle,
    children,
}: CollapsibleHeaderProps) => {
    return (
        <div className="relative">
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isCollapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100",
                )}
            >
                <div className="pb-4">
                    <DialogHeader className="space-y-0 mb-4">
                        <DialogTitle>
                            <div className="w-full justify-center md:justify-normal mx-auto md:mx-0 flex gap-2 items-center">
                                <CollapseButton
                                    isCollapsed={isCollapsed}
                                    onClick={onToggle}
                                    className="shrink-0"
                                />
                                <span>Fanart Gallery</span>
                            </div>
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Browse community fanart from the ENreco series
                        </DialogDescription>
                    </DialogHeader>
                    {children}
                </div>
            </div>

            {isCollapsed && (
                <CollapseButton
                    isCollapsed={isCollapsed}
                    onClick={onToggle}
                    className="absolute top-0 left-0"
                />
            )}
        </div>
    );
};

export default CollapsibleHeader;
