import { cn } from "@/lib/utils";
import React, { useEffect } from "react";

interface Props {
    isCardOpen: boolean;
    onWidthChange?: (width: number) => void;
}

const ViewCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & Props
>(({ className, isCardOpen, onWidthChange, ...props }, ref) => {
    const cardRef = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isCardOpen && cardRef.current) {
            const observer = new ResizeObserver((entries) => {
                const width = entries[0].contentRect.width;
                onWidthChange?.(width);
            });

            observer.observe(cardRef.current);
            return () => observer.disconnect();
        }
    }, [isCardOpen, onWidthChange]);

    return (
        <>
            {isCardOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-0 w-screen h-screen lg:hidden pointer-events-none" />
            )}
            <div
                ref={(node) => {
                    // Handle both forwarded ref and local ref
                    if (typeof ref === "function") ref(node);
                    else if (ref) ref.current = node;
                    cardRef.current = node;
                }}
                className={cn(
                    "card-deco max-h-[1500px] right-14 rounded-xl border-2 bg-card text-card-foreground flex flex-col shadow-2xl h-[94%] w-[90%] -translate-x-1/2 left-1/2 md:translate-x-0 top-1/2 -translate-y-1/2 md:left-auto items-center gap-4 p-4 lg:w-[40%] z-50",
                    className,
                )}
                {...props}
            />
        </>
    );
});

export default ViewCard;
