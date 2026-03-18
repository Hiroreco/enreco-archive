import { usePersistedViewStore } from "@/store/persistedViewStore";
import { useViewStore } from "@/store/viewStore";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// TODO: Update target date/time later
const now = new Date();
const TARGET_DATE = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
);

// --- IMPORTANT ---
// Change this value for each new countdown to trigger the animation for users again.
const CURRENT_COUNTDOWN_VERSION = "c3d0";

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
    const hasDismissedBingoIndicator = usePersistedViewStore(
        (state) => state.hasDismissedBingoIndicator,
    );
    const appType = useViewStore((state) => state.appType);
    const hasDoneInitialSequence = useRef(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const countdownVersion = usePersistedViewStore(
        (state) => state.countdownUpdateVersion,
    );
    const setCountdownVersion = usePersistedViewStore(
        (state) => state.setCountdownUpdateVersion,
    );

    // Initial open-then-close sequence.
    // Plays once per countdown update (defined by CURRENT_COUNTDOWN_VERSION).
    useEffect(() => {
        if (
            isInLoadingScreen ||
            !hasDismissedBingoIndicator ||
            hasDoneInitialSequence.current ||
            countdownVersion === CURRENT_COUNTDOWN_VERSION
        )
            return;

        hasDoneInitialSequence.current = true;
        setCountdownVersion(CURRENT_COUNTDOWN_VERSION);
        setIsOpen(true);

        const closeTimer = setTimeout(() => setIsOpen(false), 5000);
        return () => clearTimeout(closeTimer);
    }, [isInLoadingScreen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                isOpen &&
                cardRef.current &&
                !cardRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
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

    if (
        !hasVisitedBefore ||
        !hasDismissedBingoIndicator ||
        appType !== "chart"
    ) {
        return null;
    }

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
                    {timeLeft ? "Next update in" : "Next update"}
                </p>
                <p
                    className={cn(
                        "font-mono font-bold tracking-widest text-center md:max-w-[400px] max-w-full",
                        timeLeft ? "text-2xl tabular-nums" : "text-sm",
                    )}
                >
                    {timeLeft ??
                        "Should be out now (Ctrl + R) — if not, please be patient 🙏"}
                </p>
                <a
                    href="https://twitter.com/hiroavrs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1 mx-auto visited:text-muted-foreground!"
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
