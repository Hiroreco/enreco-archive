import { Separator } from "@enreco-archive/common-ui/components/separator";
import { ViewMarkdown } from "@/components/view/markdown/Markdown";
import ProgressBar from "@/components/view/chart-cards/ProgressBar";
import CardFanartCarousel from "@/components/view/chart-cards/CardFanartCarousel";
import { getCardFanartData } from "@/components/view/chart-cards/card-fanart-utils";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useMemo } from "react";
import PrevNextDayNavigation from "@/components/view/chart-cards/PrevNextDayNavigation";

interface Props {
    dayRecap: string;
    day: number;
    numberOfDays: number;
    onDayChange: (newDay: number) => void;
}

const RecapCard = ({
    dayRecap,
    day,
    numberOfDays,
    onDayChange,
}: Props) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const { contentWithoutFanart, fanartEntries } = useMemo(
        () => getCardFanartData(dayRecap || ""),
        [dayRecap],
    );

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo(0, 0);
        }
    }, [dayRecap]);
    return (
        <div className="flex flex-col gap-4 mt-4 h-full min-h-0 relative">
            <ProgressBar
                day={day}
                numberOfDays={numberOfDays}
                onDayChange={onDayChange}
            />
            <div
                className="overflow-x-hidden px-2 scroll-smooth overflow-y-scroll grow"
                ref={scrollRef}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={day} // Change key to trigger animation
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ViewMarkdown
                            className="md:px-4 px-2"
                        >
                            {contentWithoutFanart || "No content available."}
                        </ViewMarkdown>
                        {fanartEntries.length > 0 && (
                            <>
                                <Separator className="my-4" />
                                <CardFanartCarousel
                                    className="mt-5 md:px-4 px-2"
                                    fanartEntries={fanartEntries}
                                />
                            </>
                        )}

                        <Separator className="my-4" />
                    </motion.div>
                </AnimatePresence>
                <PrevNextDayNavigation
                    onPreviousDayClick={() => onDayChange(day - 1)}
                    onNextDayClick={() => onDayChange(day + 1)}
                    disablePreviousDay={day <= 0}
                    disableNextDay={day >= numberOfDays - 1}
                />
            </div>
        </div>
    );
};

export default RecapCard;
