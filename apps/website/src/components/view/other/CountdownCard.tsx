import { usePersistedViewStore } from "@/store/persistedViewStore";
import { useViewStore } from "@/store/viewStore";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

// --- IMPORTANT ---
// Change this value for each new countdown to trigger the animation for users again.
const CURRENT_DAY = 0;
const CURRENT_COUNTDOWN_VERSION = `c3d${CURRENT_DAY}`;

// REMEMBER TO SET THIS TO FALSE AFTER THE UPDATE IS UP AND VICE VERSA
const IS_VISIBLE = false;

// Returns the next occurrence of 2 AM JST (= 17:00 UTC).
// Only called ONCE to set the target — not re-called on every tick.
function getTargetDate(): Date {
    const now = new Date();
    const target = new Date(now);
    target.setUTCHours(17, 0, 0, 0);
    if (target <= now) {
        target.setUTCDate(target.getUTCDate() + 1);
    }
    return target;
}

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
    const t = useTranslations("countdownCard");
    const [isOpen, setIsOpen] = useState(false);

    // Target is fixed on mount — never recomputed, so countdown stops at zero
    const targetRef = useRef<Date>(getTargetDate());
    const [timeLeft, setTimeLeft] = useState(() =>
        getTimeLeft(targetRef.current),
    );

    const currentCard = useViewStore((state) => state.currentCard);
    const hasVisitedBefore = usePersistedViewStore(
        (state) => state.hasVisitedBefore,
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

    // Tick against the fixed target — stops naturally when timeLeft becomes null
    useEffect(() => {
        if (!timeLeft) return;
        const interval = setInterval(() => {
            const newTimeLeft = getTimeLeft(targetRef.current);
            setTimeLeft(newTimeLeft);
            if (!newTimeLeft) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    if (!hasVisitedBefore || appType !== "chart" || !IS_VISIBLE) {
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
                animate={{ x: isOpen ? 0 : "calc(100% - 24px)" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
                {/* Closer Button */}
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
                    {t("dayNUpdate", { day: CURRENT_DAY })}
                </p>
                <p
                    className={cn(
                        "font-mono font-bold tracking-widest text-center md:max-w-[400px] max-w-full",
                        timeLeft ? "text-2xl tabular-nums" : "text-sm",
                    )}
                >
                    {timeLeft ?? t("updateShouldBeOut")}
                </p>
                <a
                    href="https://twitter.com/hiroavrs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1 mx-auto visited:text-muted-foreground!"
                >
                    {t.rich("announcement", {
                        span: (chunks) => (
                            <span className="underline underline-offset-2">
                                {chunks}
                            </span>
                        ),
                    })}
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
