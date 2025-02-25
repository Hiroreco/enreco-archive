import VaulDrawer from "@/components/view/VaulDrawer";
import ViewCard from "@/components/view/ViewCard";
import ViewEdgeContent from "@/components/view/ViewEdgeContent";
import { FixedEdgeType, ImageNodeType, Relationship } from "@/lib/type";
import { useReactFlow } from "@xyflow/react";
import { BrowserView, MobileView } from "react-device-detect";

import { cn } from "@/lib/utils";
import { EdgeLinkClickHandler, NodeLinkClickHandler } from "./ViewMarkdown";
import { X } from "lucide-react";

interface Props {
    isCardOpen: boolean;
    selectedEdge: FixedEdgeType | null;
    edgeRelationship: Relationship | null;
    chapter: number;
    onCardClose: () => void;
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
}

const ViewEdgeCard = ({
    isCardOpen,
    selectedEdge,
    edgeRelationship,
    chapter,
    onCardClose,
    onEdgeLinkClicked,
    onNodeLinkClicked,
}: Props) => {
    const { getNode } = useReactFlow();

    function onDrawerOpenChange(newOpenState: boolean): void {
        if (!newOpenState) {
            onCardClose();
        }
    }

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
