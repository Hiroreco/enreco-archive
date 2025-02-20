import { Separator } from "@/components/ui/separator";
import {
    EdgeLinkClickHandler,
    NodeLinkClickHandler,
    ViewMarkdown,
} from "@/components/view/ViewMarkdown";
import { ChartData } from "@/lib/type";
import { useEffect, useRef } from "react";

interface Props {
    dayData: ChartData;

    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
}

const ViewRecapCard = ({
    dayData,
    onNodeLinkClicked,
    onEdgeLinkClicked,
}: Props) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo(0, 0);
        }
    }, [dayData]);
    return (
        <div className="flex flex-col gap-4 m-4 h-full relative">
            {/* Scrollable Content */}
            <div
                className="overflow-auto overflow-x-hidden scroll-smooth"
                ref={scrollRef}
            >
                <ViewMarkdown
                    onNodeLinkClicked={onNodeLinkClicked}
                    onEdgeLinkClicked={onEdgeLinkClicked}
                >
                    {dayData.dayRecap || "No content available."}
                </ViewMarkdown>
                <Separator className="-mt-10" />
            </div>
        </div>
    );
};

export default ViewRecapCard;
