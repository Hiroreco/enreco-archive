import { Separator } from "@/components/ui/separator";
import {
    EdgeLinkClickHandler,
    NodeLinkClickHandler,
    ViewMarkdown,
} from "@/components/view/ViewMarkdown";
import ViewProgressBar from "@/components/view/ViewProgressBar";
import { ChartData } from "@/lib/type";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface Props {
    dayData: ChartData;
    drawerOpenFully?: boolean;
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
    day: number;
    numberOfDays: number;
    onDayChange: (newDay: number) => void;
}

const ViewRecapCard = ({
    dayData,
    drawerOpenFully,
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
        <div className="flex flex-col gap-4 m-4 h-full relative">
            <ViewProgressBar
                day={day}
                numberOfDays={numberOfDays}
                onDayChange={onDayChange}
            />
            <div
                className={cn("overflow-x-hidden scroll-smooth", {
                    "overflow-y-scroll":
                        drawerOpenFully === true ||
                        drawerOpenFully === undefined,
                    "overflow-y-hidden": drawerOpenFully === false,
                })}
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
