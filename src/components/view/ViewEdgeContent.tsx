import { Separator } from "@/components/ui/separator";
import EdgeCardDeco from "@/components/view/EdgeCardDeco";
import { FixedEdgeType, ImageNodeType, Relationship } from "@/lib/type";
import {
    getLighterOrDarkerColor,
    getLineSvg,
    idFromDayChapterId,
} from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
    EdgeLinkClickHandler,
    NodeLinkClickHandler,
    ViewMarkdown,
} from "./ViewMarkdown";
import { isMobile } from "react-device-detect";
import ReadMarker from "@/components/view/ReadMarker";
import clsx from "clsx";

interface ViewEdgeContentProps {
    selectedEdge: FixedEdgeType;
    edgeRelationship: Relationship;
    nodeA: ImageNodeType;
    nodeB: ImageNodeType;
    chapter: number;
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
}

const ViewEdgeContent = ({
    selectedEdge,
    edgeRelationship,
    nodeA,
    nodeB,
    chapter,
    onNodeLinkClicked,
    onEdgeLinkClicked,
}: ViewEdgeContentProps) => {
    const edgeStyle = edgeRelationship.style;
    const backgroundColor = getLighterOrDarkerColor(
        edgeStyle?.stroke || "",
        30,
    );

    const contentRef = useRef<HTMLDivElement>(null); // Ref for scrollable content
    const [isHeaderVisible, setIsHeaderVisible] = useState(true); // Track header visibility
    const headerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // Handle scroll event to toggle header visibility
    const handleScroll = () => {
        if (contentRef.current && cardRef.current) {
            if (
                cardRef.current.clientHeight >
                    contentRef.current.scrollHeight ||
                isMobile
            ) {
                return;
            }
            setIsHeaderVisible(contentRef.current.scrollTop === 0);
        }
    };

    // Reset scroll position and header visibility when selectedEdge changes
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
        setIsHeaderVisible(true);
    }, [selectedEdge]);

    return (
        <div className="h-full flex flex-col w-full" ref={cardRef}>
            {/* Header */}
            <div
                ref={headerRef}
                className="flex flex-col items-center transition-all duration-300"
                style={{
                    opacity: isHeaderVisible ? 1 : 0,
                    height: isHeaderVisible ? "236px" : 0,
                    visibility: isHeaderVisible ? "visible" : "hidden",
                    transform: isHeaderVisible ? "scale(1)" : "scale(0)",
                }}
            >
                <div className="z-10 flex gap-4 items-center justify-between">
                    <img
                        className="aspect-square w-[150px] object-cover"
                        src={nodeA.data.imageSrc}
                        alt="Node A"
                    />
                    {getLineSvg(edgeStyle!)}
                    <img
                        className="aspect-square w-[150px] object-cover"
                        src={nodeB.data.imageSrc}
                        alt="Node B"
                    />
                </div>
                <EdgeCardDeco color={backgroundColor} />

                {selectedEdge.data?.title && (
                    <span className="font-semibold text-lg text-center my-1">
                        {selectedEdge.data.title}
                    </span>
                )}
                <Separator />

                <div className="my-2">
                    <span className="font-semibold">Relationship:</span>{" "}
                    <span className="">{edgeRelationship.name}</span>
                </div>
                <Separator />
            </div>

            {/* Content */}
            <div
                ref={contentRef}
                className={clsx("mt-2", {
                    "overflow-y-auto": !isMobile,
                })}
                onScroll={handleScroll}
            >
                {selectedEdge.data?.day !== undefined && (
                    <div className="text-2xl font-bold my-2 underline underline-offset-4">
                        Day {selectedEdge.data.day + 1}
                    </div>
                )}
                <ViewMarkdown
                    onEdgeLinkClicked={onEdgeLinkClicked}
                    onNodeLinkClicked={onNodeLinkClicked}
                >
                    {selectedEdge.data?.content || "No content available"}
                </ViewMarkdown>
                <Separator className="-mt-10" />
                <ReadMarker
                    id={idFromDayChapterId(
                        selectedEdge.data!.day,
                        chapter,
                        selectedEdge.id,
                    )}
                />
            </div>
        </div>
    );
};

export default ViewEdgeContent;
