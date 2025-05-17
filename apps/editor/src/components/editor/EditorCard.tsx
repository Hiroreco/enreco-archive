import { cn } from "@enreco-archive/common-ui/lib/utils";
import React from "react";

const EditorCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-lg border bg-card text-card-foreground flex flex-col shadow-xl bg-background items-center gap-4 absolute right-10 px-4 py-4 top-1/2 -translate-y-1/2 max-w-[500px] overflow-y-scroll max-h-[90vh]",
            className,
        )}
        {...props}
    />
));
EditorCard.displayName = "EditorCard";
export default EditorCard;
