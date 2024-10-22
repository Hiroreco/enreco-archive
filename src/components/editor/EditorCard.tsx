import { cn } from "@/lib/utils";
import React from "react";

const EditorCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-lg border bg-card text-card-foreground flex flex-col shadow-xl bg-white items-center gap-4 absolute right-10 px-4 py-4 top-1/2 -translate-y-1/2",
            className
        )}
        {...props}
    />
));
EditorCard.displayName = "EditorCard";
export default EditorCard;
