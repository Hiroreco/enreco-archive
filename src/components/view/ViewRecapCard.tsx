import { Separator } from "@/components/ui/separator";
import {
    EdgeLinkClickHandler,
    NodeLinkClickHandler,
    ViewMarkdown,
} from "@/components/view/ViewMarkdown";
import { ChartData } from "@/lib/type";
import clsx from "clsx";
import { useEffect, useRef } from "react";

interface Props {
    dayData: ChartData;
    drawerOpenFully?: boolean;
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
}

const ViewRecapCard = ({
    dayData,
    drawerOpenFully,
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
            <div
                className={clsx("overflow-x-hidden scroll-smooth", {
                    "overflow-y-scroll":
                        drawerOpenFully === true ||
                        drawerOpenFully === undefined,
                    "overflow-y-hidden": drawerOpenFully === false,
                })}
                ref={scrollRef}
            >
                <ViewMarkdown
                    onNodeLinkClicked={onNodeLinkClicked}
                    onEdgeLinkClicked={onEdgeLinkClicked}
                >
                    {dayData.dayRecap || "No content available."}
                </ViewMarkdown>
                <Separator className="my-4" />
            </div>
        </div>
    );
};

export default ViewRecapCard;
