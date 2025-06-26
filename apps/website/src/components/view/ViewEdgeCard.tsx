import LineSvg from "@/components/LineSvg";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { Stack, StackItem } from "@enreco-archive/common-ui/components/Stack";
import EdgeCardDeco from "@/components/view/EdgeCardDeco";
import ReadMarker from "@/components/view/ReadMarker";
import VaulDrawer from "@/components/view/VaulDrawer";
import ViewCardDaySwitcher from "@/components/view/ViewCardDaySwitcher";
import { ViewMarkdown } from "@/components/view/ViewMarkdown";
import { EdgeLinkClickHandler } from "@/components/view/markdown/EdgeLink";
import { NodeLinkClickHandler } from "@/components/view/markdown/NodeLink";
import {
    FixedEdgeType,
    ImageNodeType,
    Relationship,
} from "@enreco-archive/common/types";
import {
    getLighterOrDarkerColor,
    idFromChapterDayId,
    isMobileViewport,
} from "@/lib/utils";

import { useReactFlow } from "@xyflow/react";
import { useEffect, useRef } from "react";
import Image from "next/image";

interface Props {
    isCardOpen: boolean;
    selectedEdge: FixedEdgeType | null;
    edgeRelationship: Relationship | null;
    chapter: number;
    onCardClose: () => void;
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
    setChartShrink: (width: number) => void;
    onDayChange: (newDay: number) => void;
    availiableEdges: FixedEdgeType[];
}

const ViewEdgeCard = ({
    isCardOpen,
    selectedEdge,
    edgeRelationship,
    chapter,
    availiableEdges,
    onCardClose,
    onEdgeLinkClicked,
    onNodeLinkClicked,
    setChartShrink,
    onDayChange,
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

    const edgeStyle = edgeRelationship.style;
    const backgroundColor = getLighterOrDarkerColor(
        edgeStyle?.stroke || "",
        10,
    );

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
                        <StackItem>
                            <EdgeCardDeco color={backgroundColor} />
                        </StackItem>
                        <StackItem>
                            <div className="z-10 flex gap-4 items-center justify-between w-fit mx-auto mt-4">
                                <Image
                                    className="relative aspect-square w-[150px] object-cover dark:brightness-[0.87]"
                                    src={nodeA.data.imageSrc}
                                    alt="Node A"
                                    width={150}
                                    height={150}
                                />
                                <LineSvg style={edgeStyle} />
                                <Image
                                    className="relative aspect-square w-[150px] object-cover dark:brightness-[0.87]"
                                    src={nodeB.data.imageSrc}
                                    alt="Node B"
                                    width={150}
                                    height={150}
                                />
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
                        className="px-4"
                    >
                        {selectedEdge.data?.content || "No content available"}
                    </ViewMarkdown>
                    <Separator className="mt-4" />
                    <ReadMarker
                        id={idFromChapterDayId(
                            chapter,
                            selectedEdge.data!.day,
                            selectedEdge.id,
                        )}
                        read={selectedEdge.data?.isRead}
                    />
                </div>
            </div>
        </VaulDrawer>
    );
};

export default ViewEdgeCard;
