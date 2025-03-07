import VaulDrawer from "@/components/view/VaulDrawer";
import ViewNodeContent from "@/components/view/ViewNodeContent";

import { getViewportSize } from "@/lib/utils";
import { ImageNodeType, Team } from "@/lib/type";
import { EdgeLinkClickHandler, NodeLinkClickHandler } from "./ViewMarkdown";

interface Props {
    isCardOpen: boolean;
    selectedNode: ImageNodeType | null;
    nodeTeam: Team | null;
    chapter: number;
    onCardClose: () => void;
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
    setChartShrink: (width: number) => void;
}

const ViewNodeCard = ({
    isCardOpen,
    selectedNode,
    nodeTeam,
    chapter,
    onCardClose,
    onNodeLinkClicked,
    onEdgeLinkClicked,
    setChartShrink,
}: Props) => {
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

    const renderContent = selectedNode !== null && nodeTeam !== null;

    return (
        <VaulDrawer
            open={isCardOpen}
            onOpenChange={onDrawerOpenChange}
            onWidthChange={handleCardWidthChange}
            disableScrollablity={false}
        >
            {renderContent && (
                <ViewNodeContent
                    onNodeLinkClicked={onNodeLinkClicked}
                    onEdgeLinkClicked={onEdgeLinkClicked}
                    selectedNode={selectedNode}
                    team={nodeTeam}
                    chapter={chapter}
                />
            )}
        </VaulDrawer>
    );
};

export default ViewNodeCard;
