import { cn } from "@enreco-archive/common-ui/lib/utils";
import { ChevronLeft, Twitter } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const TARGET_DATE = new Date("2026-03-24T20:00:00+09:00");

function getTimeLeft(target: Date) {
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return null;

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const AUTO_CLOSE_DELAY_MS = 3000;
const HOVER_LEAVE_CLOSE_DELAY_MS = 1500;

const CountdownCard = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(TARGET_DATE));
    const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const hoverLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const isHoveringRef = useRef(false);

    // Mount then slide in
    useEffect(() => {
        setIsVisible(true);
        const openTimer = setTimeout(() => setIsOpen(true), 300);
        return () => clearTimeout(openTimer);
    }, []);

    // Auto-close after delay if not hovering
    useEffect(() => {
        if (!isOpen) return;
        autoCloseTimerRef.current = setTimeout(() => {
            if (!isHoveringRef.current) {
                setIsOpen(false);
            }
        }, AUTO_CLOSE_DELAY_MS);
        return () => {
            if (autoCloseTimerRef.current)
                clearTimeout(autoCloseTimerRef.current);
        };
    }, [isOpen]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft(TARGET_DATE));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleMouseEnter = useCallback(() => {
        isHoveringRef.current = true;
        if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
        if (hoverLeaveTimerRef.current)
            clearTimeout(hoverLeaveTimerRef.current);
    }, []);

    const handleMouseLeave = useCallback(() => {
        isHoveringRef.current = false;
        hoverLeaveTimerRef.current = setTimeout(() => {
            setIsOpen(false);
        }, HOVER_LEAVE_CLOSE_DELAY_MS);
    }, []);

    const handleOpen = useCallback(() => {
        setIsOpen(true);
    }, []);

    if (!isVisible || !timeLeft) return null;

    return (
        <div className="fixed bottom-8 right-0 z-50 flex items-center">
            {/* Opener tab (shown when card is closed) */}
            <button
                className={cn(
                    "flex items-center justify-center h-10 w-6 rounded-l-md fixed bottom-10 right-0",
                    "bg-background/90 border border-r-0 border-border text-foreground shadow-md",
                    "hover:bg-accent hover:text-accent-foreground transition-all duration-300",
                    {
                        "opacity-100 pointer-events-auto": !isOpen,
                        "opacity-0 pointer-events-none": isOpen,
                    },
                )}
                onClick={handleOpen}
                aria-label="Open countdown"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Card */}
            <div
                className={cn(
                    "flex flex-col gap-1 px-4 py-3 rounded-l-xl min-w-[220px]",
                    "bg-background/90 backdrop-blur-sm border border-border shadow-lg",
                    "text-foreground text-sm",
                    "transition-transform duration-500 ease-in-out",
                    {
                        "translate-x-0": isOpen,
                        "translate-x-full": !isOpen,
                    },
                )}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Next update in
                </p>
                <p className="text-2xl font-mono font-bold tracking-widest text-center tabular-nums">
                    {timeLeft}
                </p>
                <a
                    href="https://twitter.com/hiroavrs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
                >
                    <Twitter className="w-3 h-3 shrink-0" />
                    <span>
                        For announcements, check{" "}
                        <span className="underline underline-offset-2">
                            Hiro on Twitter
                        </span>
                    </span>
                </a>
            </div>
        </div>
    );
};

export default CountdownCard;
