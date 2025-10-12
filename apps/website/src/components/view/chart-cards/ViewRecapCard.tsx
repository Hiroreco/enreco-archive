import { Separator } from "@enreco-archive/common-ui/components/separator";
import { ViewMarkdown } from "@/components/view/markdown/ViewMarkdown";
import ViewProgressBar from "@/components/view/chart-cards/ViewProgressBar";
import { EdgeLinkClickHandler } from "@/components/view/markdown/EdgeLink";
import { NodeLinkClickHandler } from "@/components/view/markdown/NodeLink";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import PrevNextDayNavigation from "@/components/view/chart-cards/PrevNextDayNavigation";

interface Props {
    dayRecap: string;
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
    day: number;
    numberOfDays: number;
    onDayChange: (newDay: number) => void;
}

const ViewRecapCard = ({
    dayRecap,
    onNodeLinkClicked,
    onEdgeLinkClicked,
    day,
    numberOfDays,
    onDayChange,
}: Props) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo(0, 0);
        }
    }, [dayRecap]);
    return (
        <div className="flex flex-col gap-4 mt-4 h-full min-h-0 relative">
            <ViewProgressBar
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
                            onNodeLinkClicked={onNodeLinkClicked}
                            onEdgeLinkClicked={onEdgeLinkClicked}
                            className="md:px-4 px-2"
                        >
                            {dayRecap || "No content available."}
                        </ViewMarkdown>
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

export default ViewRecapCard;
