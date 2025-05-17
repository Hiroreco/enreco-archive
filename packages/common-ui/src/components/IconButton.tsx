import * as Tooltip from "@radix-ui/react-tooltip";

import { Button } from "@enreco-archive/common-ui/components/button";
import { ReactNode } from "react";
import { cn } from "@enreco-archive/common-ui/lib/utils";

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
        <Tooltip.Provider delayDuration={500}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
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
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        className="bg-black rounded-md z-20"
                        side={tooltipSide}
                        sideOffset={5}
                    >
                        <span className="mx-2 text-white">{tooltipText}</span>
                        <Tooltip.Arrow className="fill-black" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}
