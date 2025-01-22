import { cn } from "@/lib/utils";
import React from "react";

interface Props {
    isCardOpen: boolean;
}

const ViewCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & Props
>(({ className, isCardOpen, ...props }, ref) => {
    return (
        <>
            {isCardOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-0 w-screen h-screen md:hidden" />
            )}
            <div
                ref={ref}
                className={cn(
                    "right-14 rounded-xl border-2 top-5 bg-card text-card-foreground flex flex-col shadow-2xl h-[95%] w-[90%] bg-white items-center gap-4 p-4 md:w-[500px] z-50",
                    className
                )}
                {...props}
            />
        </>
    );
});
ViewCard.displayName = "ViewCard";
export default ViewCard;
