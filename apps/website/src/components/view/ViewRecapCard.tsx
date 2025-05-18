import { Separator } from "@enreco-archive/common-ui/components/separator";
import {
    ViewMarkdown,
} from "@/components/view/ViewMarkdown";
import ViewProgressBar from "@/components/view/ViewProgressBar";
import { EdgeLinkClickHandler } from "@/components/view/markdown/EdgeLink";
import { NodeLinkClickHandler } from "@/components/view/markdown/NodeLink";
import { ChartData } from "@enreco-archive/common-types/types";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface Props {
    dayData: ChartData;
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
    day: number;
    numberOfDays: number;
    onDayChange: (newDay: number) => void;
}

const ViewRecapCard = ({
    dayData,
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
    }, [dayData]);
    return (
        <div className="flex flex-col gap-4 mt-4 h-full min-h-0 relative">
            <ViewProgressBar
                day={day}
                numberOfDays={numberOfDays}
                onDayChange={onDayChange}
            />
            <div
                className="overflow-x-hidden px-4 scroll-smooth overflow-y-scroll"
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
                        >
                            {dayData.dayRecap || "No content available."}
                        </ViewMarkdown>
                        <Separator className="my-4" />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ViewRecapCard;
