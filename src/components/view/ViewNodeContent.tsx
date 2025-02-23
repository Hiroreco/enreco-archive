import { Separator } from "@/components/ui/separator";
import NodeCardDeco from "@/components/view/NodeCardDeco";
import { ImageNodeType, Team } from "@/lib/type";
import { cn, idFromDayChapterId } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
    EdgeLinkClickHandler,
    NodeLinkClickHandler,
    ViewMarkdown,
} from "./ViewMarkdown";
import { isMobile } from "react-device-detect";
import ReadMarker from "@/components/view/ReadMarker";
import clsx from "clsx";

interface ViewNodeContentProps {
    selectedNode: ImageNodeType;
    team: Team;
    chapter: number;
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
}

const ViewNodeContent = ({
    selectedNode,
    team,
    chapter,
    onNodeLinkClicked,
    onEdgeLinkClicked,
}: ViewNodeContentProps) => {
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);

    const contentRef = useRef<HTMLDivElement>(null);
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

    // Reset scroll position when selectedNode changes
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
        setIsHeaderVisible(true);
    }, [selectedNode]);

    return (
        <div className="h-full flex flex-col w-full" ref={cardRef}>
            {/* Header */}
            <div
                className={cn(
                    "flex flex-col items-center transition-all duration-300 ",
                )}
                style={{
                    opacity: isHeaderVisible ? 1 : 0,
                    height: isHeaderVisible ? "244px" : 0,
                    visibility: isHeaderVisible ? "visible" : "hidden",
                    transform: isHeaderVisible ? "scale(1)" : "scale(0)",
                }}
            >
                {selectedNode?.data.imageSrc && (
                    <Image
                        alt="character image"
                        className="aspect-square w-[150px] z-10 dark:brightness-[0.87]"
                        src={selectedNode?.data.imageSrc}
                        width={150}
                        height={150}
                    />
                )}

                <NodeCardDeco color={selectedNode.data.bgCardColor} />

                <div className="font-semibold text-center text-lg my-1">
                    {selectedNode?.data.title}
                </div>
                <Separator />
                <div className="flex flex-row justify-around w-full">
                    <div className="flex flex-col items-center">
                        <div className="font-semibold">Team</div>
                        <div>{team?.name}</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="font-semibold">Status</div>
                        <div>{selectedNode?.data.status}</div>
                    </div>
                </div>
                <Separator />
            </div>

            {/* Content */}
            <div
                ref={contentRef}
                className={clsx("mt-2", {
                    "overflow-y-auto overflow-x-hidden": !isMobile,
                })}
                onScroll={handleScroll}
            >
                <div className="text-2xl font-bold mb-2 underline underline-offset-4">
                    Day {selectedNode.data.day + 1}
                </div>
                <ViewMarkdown
                    onEdgeLinkClicked={onEdgeLinkClicked}
                    onNodeLinkClicked={onNodeLinkClicked}
                >
                    {selectedNode?.data.content || "No content available"}
                </ViewMarkdown>
                <Separator className="-mt-10" />
                <ReadMarker
                    id={idFromDayChapterId(
                        selectedNode.data.day,
                        chapter,
                        selectedNode.id,
                    )}
                />
            </div>
        </div>
    );
};

export default ViewNodeContent;
