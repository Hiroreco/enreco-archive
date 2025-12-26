import LineSvg from "@/components/view/chart/LineSvg";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { Stack, StackItem } from "@enreco-archive/common-ui/components/Stack";
import EdgeCardDeco from "@/components/view/chart-cards/EdgeCardDeco";
import ReadMarker from "@/components/view/chart-cards/ReadMarker";
import VaulDrawer from "@/components/view/chart-cards/VaulDrawer";
import CardDaySwitcher from "@/components/view/chart-cards/CardDaySwitcher";
import { ViewMarkdown } from "@/components/view/markdown/Markdown";
import { EdgeLinkClickHandler } from "@/components/view/markdown/EdgeLink";
import { NodeLinkClickHandler } from "@/components/view/markdown/NodeLink";
import {
    FixedEdgeType,
    ImageNodeType,
} from "@enreco-archive/common/types";
import { isEdge, isMobileViewport } from "@/lib/utils";

import { useReactFlow } from "@xyflow/react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@enreco-archive/common-ui/components/tooltip";
import { Check } from "lucide-react";
import {
    getReadStatus,
    usePersistedViewStore,
} from "@/store/persistedViewStore";
import { useTranslations } from "next-intl";
import PrevNextDayNavigation from "@/components/view/chart-cards/PrevNextDayNavigation";
import { AnimatePresence, motion } from "framer-motion";
import { useViewStore } from "@/store/viewStore";
import { useShallow } from "zustand/react/shallow";
import { useLocalizedData } from "@/hooks/useLocalizedData";

interface Props {
    isCardOpen: boolean;
    onCardClose: () => void;
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
    onDayChange: (newDay: number) => void;
    setChartShrink: (width: number) => void;
}

const EdgeCard = ({
    isCardOpen,
    onCardClose,
    onEdgeLinkClicked,
    onNodeLinkClicked,
    onDayChange,
    setChartShrink,
}: Props) => {
    const tEdgeCard = useTranslations("cards.edgeCard");
    const tConstants = useTranslations("constants");

    const contentRef = useRef<HTMLDivElement>(null);
    const { getNode } = useReactFlow();

    const [
        selectedEdge,
        chapter,
        day,
    ] = useViewStore(useShallow(state => {
        let selectedEdge = state.selectedElement !== null && isEdge(state.selectedElement) ? state.selectedElement as FixedEdgeType : null;

        return [
            selectedEdge,
            state.chapter,
            state.day,
        ]   
    }));

    const { getChapter } = useLocalizedData();
    const chapterData = getChapter(chapter);
    const charts = chapterData.charts;

    const readStatus = usePersistedViewStore((state) => state.readStatus);
    const setReadStatus = usePersistedViewStore((state) => state.setReadStatus);

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

    function handleCardWidthChange(width: number) {
        if (isCardOpen && !isMobileViewport()) {
            setChartShrink(width + 56); // Add 56px for the right margin
        }
    }

    function onReadChange(isRead: boolean) {
        setReadStatus(chapter, day, selectedEdge!.id, isRead);
    }

    // An edge always has a source and target node, which explains the !
    const nodeA = selectedEdge
        ? (getNode(selectedEdge.source)! as ImageNodeType)
        : null;
    const nodeB = selectedEdge
        ? (getNode(selectedEdge.target)! as ImageNodeType)
        : null;

    // Resolve fresh node by id at click time to avoid stale references after day switches
    const handleNodeIconClick = (nodeId: string) => {
        const node = getNode(nodeId) as ImageNodeType | null;
        if (node) {
            onNodeLinkClicked(node);
        }
    };

    const edgeRelationshipId = selectedEdge?.data?.relationshipId ?? null;
    const edgeRelationship = edgeRelationshipId !== null ? chapterData.relationships[edgeRelationshipId] : null;

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

    const isEdgeRead = getReadStatus(readStatus, chapter, day, selectedEdge.id);

    const availiableEdges: FixedEdgeType[] = [];
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
            <div
                className="h-full w-full overflow-auto scroll-smooth px-2"
                ref={contentRef}
            >
                {/* Header */}
                <div className="flex flex-col items-center">
                    <Stack className="w-full">
                        <StackItem className="relative">
                            <EdgeCardDeco color={backgroundColor} />
                            {isEdgeRead && (
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
                                    onClick={() =>
                                        handleNodeIconClick(selectedEdge.source)
                                    }
                                    title={nodeA.data.title || "View node"}
                                >
                                    <Image
                                        className="relative aspect-square w-[150px] object-cover transition-all duration-200 hover:scale-105"
                                        style={{
                                            boxShadow: `0 0 0 0px transparent`,
                                            outline: "none",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = `0 0 0 4px ${nodeA.data.bgCardColor || "#6f6ac6"}`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow =
                                                "0 0 0 0px transparent";
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
                                    onClick={() =>
                                        handleNodeIconClick(selectedEdge.target)
                                    }
                                    title={nodeB.data.title || "View node"}
                                >
                                    <Image
                                        className="relative aspect-square w-[150px] object-cover transition-all duration-200 hover:scale-105"
                                        style={{
                                            boxShadow: `0 0 0 0px transparent`,
                                            outline: "none",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = `0 0 0 4px ${nodeB.data.bgCardColor || "#6f6ac6"}`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow =
                                                "0 0 0 0px transparent";
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
                        <span className="font-semibold">
                            {tEdgeCard("relationship")}:{" "}
                        </span>
                        <span className="">
                            {tConstants(edgeRelationship.name)}
                        </span>
                    </div>
                    <Separator className="h-px w-full bg-border" />
                </div>

                {/* Content */}
                <div ref={contentRef} className="mt-2 overflow-x-hidden">
                    {selectedEdge.data?.day !== undefined && (
                        // <div className="text-2xl font-bold my-2 underline underline-offset-4">
                        //     Day {selectedEdge.data.day + 1}
                        // </div>
                        <CardDaySwitcher
                            currentDay={selectedEdge.data.day}
                            onDayChange={onDayChange}
                            availiableElements={availiableEdges}
                            showTitle={true}
                        />
                    )}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={day} // Change key to trigger animation
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ViewMarkdown
                                onEdgeLinkClicked={onEdgeLinkClicked}
                                onNodeLinkClicked={onNodeLinkClicked}
                                className="md:px-4 px-2"
                            >
                                {selectedEdge.data?.content ||
                                    "No content available"}
                            </ViewMarkdown>
                        </motion.div>
                    </AnimatePresence>

                    <Separator className="my-4" />
                    <PrevNextDayNavigation
                        onPreviousDayClick={() => {
                            const currentIndex = availiableEdges.findIndex(
                                (n) => n.data?.day === selectedEdge.data?.day,
                            );
                            if (currentIndex > 0) {
                                const previousEdge =
                                    availiableEdges[currentIndex - 1];
                                if (previousEdge.data?.day !== undefined) {
                                    onDayChange(previousEdge.data.day);
                                }
                            }
                        }}
                        onNextDayClick={() => {
                            const currentIndex = availiableEdges.findIndex(
                                (n) => n.data?.day === selectedEdge.data?.day,
                            );
                            if (currentIndex < availiableEdges.length - 1) {
                                const nextEdge =
                                    availiableEdges[currentIndex + 1];
                                if (nextEdge.data?.day !== undefined) {
                                    onDayChange(nextEdge.data.day);
                                }
                            }
                        }}
                        disablePreviousDay={
                            selectedEdge.data?.day ===
                            Math.min(
                                ...availiableEdges.map(
                                    (n) =>
                                        n.data?.day ?? Number.POSITIVE_INFINITY,
                                ),
                            )
                        }
                        disableNextDay={
                            selectedEdge.data?.day ===
                            Math.max(
                                ...availiableEdges.map(
                                    (n) =>
                                        n.data?.day ?? Number.NEGATIVE_INFINITY,
                                ),
                            )
                        }
                    />

                    <ReadMarker read={isEdgeRead} setRead={onReadChange} />
                </div>
            </div>
        </VaulDrawer>
    );
};

export default EdgeCard;
