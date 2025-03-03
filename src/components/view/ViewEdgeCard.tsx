import VaulDrawer from "@/components/view/VaulDrawer";
import ViewCard from "@/components/view/ViewCard";
import ViewEdgeContent from "@/components/view/ViewEdgeContent";
import { FixedEdgeType, ImageNodeType, Relationship } from "@/lib/type";
import { useReactFlow } from "@xyflow/react";
import { BrowserView, MobileView } from "react-device-detect";

import { cn, getViewportSize } from "@/lib/utils";
import { EdgeLinkClickHandler, NodeLinkClickHandler } from "./ViewMarkdown";
import { X } from "lucide-react";
import { useEscapeCard } from "@/hooks/useEscapeCard";

interface Props {
    isCardOpen: boolean;
    selectedEdge: FixedEdgeType | null;
    edgeRelationship: Relationship | null;
    chapter: number;
    onCardClose: () => void;
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
    setChartShrink: (width: number) => void;
}

const ViewEdgeCard = ({
    isCardOpen,
    selectedEdge,
    edgeRelationship,
    chapter,
    onCardClose,
    onEdgeLinkClicked,
    onNodeLinkClicked,
    setChartShrink,
}: Props) => {
    const { getNode } = useReactFlow();
    useEscapeCard({ isCardOpen, onCardClose });
    function onDrawerOpenChange(newOpenState: boolean): void {
        if (!newOpenState) {
            onCardClose();
        }
    }

    const handleCardWidthChange = (width: number) => {
        if (isCardOpen && getViewportSize().label === "lg") {
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

    return (
        <>
            <BrowserView>
                <ViewCard
                    isCardOpen={isCardOpen}
                    onWidthChange={handleCardWidthChange}
                    className={cn("transition-all absolute", {
                        "opacity-0 -z-10 invisible": !isCardOpen,
                        "opacity-1 z-10 visible": isCardOpen,
                    })}
                >
                    {renderContent && (
                        <ViewEdgeContent
                            selectedEdge={selectedEdge}
                            edgeRelationship={edgeRelationship}
                            nodeA={nodeA}
                            nodeB={nodeB}
                            chapter={chapter}
                            onEdgeLinkClicked={onEdgeLinkClicked}
                            onNodeLinkClicked={onNodeLinkClicked}
                        />
                    )}
                    <X className="x-close" onClick={onCardClose} />
                </ViewCard>
            </BrowserView>
            <MobileView>
                <VaulDrawer
                    open={isCardOpen}
                    onOpenChange={onDrawerOpenChange}
                    disableScrollablity={false}
                >
                    <div className="flex flex-col gap-4 max-h-full items-center">
                        {renderContent && (
                            <ViewEdgeContent
                                selectedEdge={selectedEdge}
                                edgeRelationship={edgeRelationship}
                                nodeA={nodeA}
                                nodeB={nodeB}
                                chapter={chapter}
                                onEdgeLinkClicked={onEdgeLinkClicked}
                                onNodeLinkClicked={onNodeLinkClicked}
                            />
                        )}
                    </div>
                </VaulDrawer>
            </MobileView>
        </>
    );
};

export default ViewEdgeCard;
