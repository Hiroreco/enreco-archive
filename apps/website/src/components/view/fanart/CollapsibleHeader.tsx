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
import { ChevronDown, Pin, PinOff } from "lucide-react";
import { ReactNode } from "react";

interface CollapsibleHeaderProps {
    isCollapsed: boolean;
    isPinned: boolean;
    onTogglePin: () => void;
    onToggleCollapse: () => void;
    children: ReactNode;
}

const PinButton = ({
    isPinned,
    onClick,
    className,
}: {
    isPinned: boolean;
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
                        "bg-background border border-border rounded-full flex items-center justify-center hover:opacity-100 transition-colors z-10 cursor-pointer p-1.5",
                        isPinned
                            ? "opacity-100 bg-primary/10 border-primary/50"
                            : "opacity-70",
                        className,
                    )}
                >
                    {isPinned ? (
                        <Pin className="size-8" />
                    ) : (
                        <PinOff className="size-8" />
                    )}
                </TooltipTrigger>
                <TooltipContent side="right">
                    {isPinned
                        ? "Unpin header (auto-collapse on scroll)"
                        : "Pin header (always visible)"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const ExpandButton = ({
    onClick,
    className,
}: {
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
                        "bg-background border border-border rounded-full flex items-center justify-center hover:opacity-100 transition-colors z-10 cursor-pointer p-1 opacity-70",
                        className,
                    )}
                >
                    <ChevronDown className="size-8" />
                </TooltipTrigger>
                <TooltipContent side="left">Show filters</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const CollapsibleHeader = ({
    isCollapsed,
    isPinned,
    onTogglePin,
    onToggleCollapse,
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
                                <PinButton
                                    isPinned={isPinned}
                                    onClick={onTogglePin}
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
                <ExpandButton
                    onClick={onToggleCollapse}
                    className="absolute top-0 left-0"
                />
            )}
        </div>
    );
};

export default CollapsibleHeader;
