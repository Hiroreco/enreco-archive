import LineSvg from "@/components/view/chart/LineSvg";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { Stack, StackItem } from "@enreco-archive/common-ui/components/Stack";
import EdgeCardDeco from "@/components/view/chart-cards/EdgeCardDeco";
import ReadMarker from "@/components/view/chart-cards/ReadMarker";
import VaulDrawer from "@/components/view/chart-cards/VaulDrawer";
import ViewCardDaySwitcher from "@/components/view/chart-cards/ViewCardDaySwitcher";
import { ViewMarkdown } from "@/components/view/markdown/ViewMarkdown";
import { EdgeLinkClickHandler } from "@/components/view/markdown/EdgeLink";
import { NodeLinkClickHandler } from "@/components/view/markdown/NodeLink";
import {
    ChartData,
    FixedEdgeType,
    ImageNodeType,
    Relationship,
} from "@enreco-archive/common/types";
import { isMobileViewport } from "@/lib/utils";

import { useReactFlow } from "@xyflow/react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@enreco-archive/common-ui/components/tooltip";
import { Check } from "lucide-react";

interface Props {
    isCardOpen: boolean;
    selectedEdge: FixedEdgeType | null;
    edgeRelationship: Relationship | null;
    charts: ChartData[];
    read: boolean;
    onCardClose: () => void;
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
    onDayChange: (newDay: number) => void;
    onReadChange: (newReadStatus: boolean) => void;
    setChartShrink: (width: number) => void;
}

const ViewEdgeCard = ({
    isCardOpen,
    selectedEdge,
    edgeRelationship,
    charts,
    read,
    onCardClose,
    onEdgeLinkClicked,
    onNodeLinkClicked,
    onDayChange,
    onReadChange,
    setChartShrink,
}: Props) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const { getNode } = useReactFlow();

    // Reset scroll position and header visibility when selectedEdge changes
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [selectedEdge]);

    function onDrawerOpenChange(newOpenState: boolean): void {
        if (!newOpenState) {
            onCardClose();
        }
    }

    const handleCardWidthChange = (width: number) => {
        if (isCardOpen && !isMobileViewport()) {
            setChartShrink(width + 56); // Add 56px for the right margin
        }
    };

    // An edge always has a source and target node, which explains the !
    const nodeA = selectedEdge
        ? (getNode(selectedEdge.source)! as ImageNodeType)
        : null;
    const nodeB = selectedEdge
        ? (getNode(selectedEdge.target)! as ImageNodeType)
        : null;

    const renderContent =
        selectedEdge !== null &&
        edgeRelationship !== null &&
        nodeA !== null &&
        nodeB !== null;

    if (!renderContent) {
        return (
            <VaulDrawer
                open={isCardOpen}
                onOpenChange={onDrawerOpenChange}
                disableScrollablity={false}
            ></VaulDrawer>
        );
    }

    const availiableEdges = [];
    for (const chart of charts) {
        for (const edge of chart.edges) {
            if (edge.id === selectedEdge.id) {
                availiableEdges.push(edge);
            }
        }
    }

    const edgeStyle = edgeRelationship.style;
    const backgroundColor = edgeStyle?.stroke || "";

    return (
        <VaulDrawer
            open={isCardOpen}
            onOpenChange={onDrawerOpenChange}
            onWidthChange={handleCardWidthChange}
            disableScrollablity={false}
        >
            <div className="h-full w-full overflow-auto px-2" ref={contentRef}>
                {/* Header */}
                <div className="flex flex-col items-center">
                    <Stack className="w-full">
                        <StackItem className="relative">
                            <EdgeCardDeco color={backgroundColor} />
                            {selectedEdge?.data!.isRead && (
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="absolute top-2 right-2 z-20 bg-black/50 rounded-full p-1">
                                        <Check
                                            size={17}
                                            className="opacity-90"
                                            color="white"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        This card has been read
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </StackItem>
                        <StackItem>
                            <div className="z-10 flex gap-4 items-center justify-between w-fit mx-auto mt-4">
                                <button
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={() => onNodeLinkClicked(nodeA)}
                                    title={nodeA.data.title || "View node"}
                                >
                                    <Image
                                        className="relative aspect-square w-[150px] object-cover dark:brightness-[0.87] transition duration-200 hover:brightness-110 hover:scale-105"
                                        style={{
                                            boxShadow: `0 0 0 0px transparent`,
                                            outline: 'none',
                                            transition: 'box-shadow 0.2s, filter 0.2s, transform 0.2s',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.boxShadow = `0 0 0 4px ${nodeA.data.bgCardColor || '#6f6ac6'}99`;
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.boxShadow = '0 0 0 0px transparent';
                                        }}
                                        src={nodeA.data.imageSrc}
                                        alt="Node A"
                                        width={150}
                                        height={150}
                                    />
                                </button>
                                <LineSvg style={edgeStyle} />
                                <button
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={() => onNodeLinkClicked(nodeB)}
                                    title={nodeB.data.title || "View node"}
                                >
                                    <Image
                                        className="relative aspect-square w-[150px] object-cover dark:brightness-[0.87] transition duration-200 hover:brightness-110 hover:scale-105"
                                        style={{
                                            boxShadow: `0 0 0 0px transparent`,
                                            outline: 'none',
                                            transition: 'box-shadow 0.2s, filter 0.2s, transform 0.2s',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.boxShadow = `0 0 0 4px ${nodeB.data.bgCardColor || '#6f6ac6'}99`;
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.boxShadow = '0 0 0 0px transparent';
                                        }}
                                        src={nodeB.data.imageSrc}
                                        alt="Node B"
                                        width={150}
                                        height={150}
                                    />
                                </button>
                            </div>
                        </StackItem>
                    </Stack>

                    {selectedEdge.data?.title && (
                        <span className="font-semibold text-lg text-center my-1">
                            {selectedEdge.data.title}
                        </span>
                    )}
                    <Separator className="h-px w-full bg-border" />

                    <div className="my-2">
                        <span className="font-semibold">Relationship:</span>{" "}
                        <span className="">{edgeRelationship.name}</span>
                    </div>
                    <Separator className="h-px w-full bg-border" />
                </div>

                {/* Content */}
                <div ref={contentRef} className="mt-2 overflow-x-hidden">
                    {selectedEdge.data?.day !== undefined && (
                        // <div className="text-2xl font-bold my-2 underline underline-offset-4">
                        //     Day {selectedEdge.data.day + 1}
                        // </div>
                        <ViewCardDaySwitcher
                            currentDay={selectedEdge.data.day}
                            onDayChange={onDayChange}
                            availiableElements={availiableEdges}
                            showTitle={true}
                        />
                    )}
                    <ViewMarkdown
                        onEdgeLinkClicked={onEdgeLinkClicked}
                        onNodeLinkClicked={onNodeLinkClicked}
                        className="md:px-4 px-2"
                    >
                        {selectedEdge.data?.content || "No content available"}
                    </ViewMarkdown>
                    <Separator className="mt-4" />
                    <ReadMarker read={read} setRead={onReadChange} />
                </div>
            </div>
        </VaulDrawer>
    );
};

export default ViewEdgeCard;
