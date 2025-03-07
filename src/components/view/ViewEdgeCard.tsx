import VaulDrawer from "@/components/view/VaulDrawer";
import ViewEdgeContent from "@/components/view/ViewEdgeContent";
import { FixedEdgeType, ImageNodeType, Relationship } from "@/lib/type";
import { useReactFlow } from "@xyflow/react";
import { getViewportSize } from "@/lib/utils";
import { EdgeLinkClickHandler, NodeLinkClickHandler } from "./ViewMarkdown";

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
        <VaulDrawer
            open={isCardOpen}
            onOpenChange={onDrawerOpenChange}
            onWidthChange={handleCardWidthChange}
            disableScrollablity={false}
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
        </VaulDrawer>
    );
};

export default ViewEdgeCard;
