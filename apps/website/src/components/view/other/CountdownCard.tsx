import { usePersistedViewStore } from "@/store/persistedViewStore";
import { useViewStore } from "@/store/viewStore";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

interface CountdownCardProps {
    isInLoadingScreen: boolean;
}

const CountdownCard = ({ isInLoadingScreen }: CountdownCardProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(TARGET_DATE));
    const currentCard = useViewStore((state) => state.currentCard);
    const hasVisitedBefore = usePersistedViewStore(
        (state) => state.hasVisitedBefore,
    );
    const hasDoneInitialSequence = useRef(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Initial open-then-close sequence
    useEffect(() => {
        if (
            !isInLoadingScreen &&
            hasVisitedBefore &&
            !hasDoneInitialSequence.current
        ) {
            hasDoneInitialSequence.current = true;
            const openTimer = setTimeout(() => {
                setIsOpen(true);
                const closeTimer = setTimeout(() => setIsOpen(false), 3000);
                return () => clearTimeout(closeTimer);
            }, 0);
            return () => clearTimeout(openTimer);
        }
    }, [isInLoadingScreen, hasVisitedBefore]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                cardRef.current &&
                !cardRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!timeLeft) return;
        const interval = setInterval(() => {
            const newTimeLeft = getTimeLeft(TARGET_DATE);
            setTimeLeft(newTimeLeft);
            if (!newTimeLeft) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    if (!timeLeft) return null;

    return (
        <div
            ref={cardRef}
            className={cn(
                "transition-opacity fixed bottom-24 right-0 z-50 flex items-center",
                {
                    "pointer-events-none opacity-0":
                        currentCard !== null || isInLoadingScreen,
                },
                { "opacity-100": currentCard === null && !isInLoadingScreen },
            )}
        >
            <motion.div
                className={cn(
                    "flex flex-col gap-1 pl-8 pr-4 py-3 rounded-l-xl min-w-[220px]",
                    "bg-background/90 backdrop-blur-sm border border-r-0 border-border shadow-lg",
                    "text-foreground text-sm",
                )}
                initial={{ x: "100%" }}
                animate={{ x: isOpen ? 0 : "calc(100% - 24px)" }} // Keep opener visible
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
                {/* Closer Button (part of the card) */}
                <motion.button
                    className="absolute top-0 left-0 h-full w-8 flex items-center justify-center rounded-l-md"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close countdown"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isOpen ? 1 : 0 }}
                    transition={{ delay: isOpen ? 0.1 : 0 }}
                >
                    <ChevronRight className="size-5" />
                </motion.button>

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
                    <span>
                        For announcements, check{" "}
                        <span className="underline underline-offset-2">
                            Hiro on Twitter
                        </span>
                    </span>
                </a>
            </motion.div>

            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        className="absolute top-0 right-0 h-full w-8 flex items-center justify-center z-0"
                        onClick={() => setIsOpen(true)}
                        aria-label="Open countdown"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ChevronLeft className="size-5" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CountdownCard;
