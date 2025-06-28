import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@enreco-archive/common-ui/components/tooltip";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { ReactNode } from "react";

interface IconButtonProps {
    id?: string;
    tooltipText: string;
    enabled: boolean;
    className?: string;
    tooltipSide?: "top" | "right" | "bottom" | "left";
    onClick: () => void;
    children?: ReactNode;
}

export function IconButton({
    id,
    tooltipText,
    enabled,
    className,
    tooltipSide = "top",
    onClick,
    children,
}: IconButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    id={id}
                    className={cn(
                        "h-8 w-8 aspect-square rounded-full p-2",
                        className,
                    )}
                    variant="outline"
                    disabled={!enabled}
                    onClick={() => onClick()}
                >
                    <div className="h-fit w-fit m-auto">{children}</div>
                </Button>
            </TooltipTrigger>
            <TooltipContent side={tooltipSide} sideOffset={5}>
                {tooltipText}
            </TooltipContent>
        </Tooltip>
    );
}
