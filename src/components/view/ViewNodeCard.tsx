import ViewCard from "@/components/view/ViewCard";

import VaulDrawer from "@/components/view/VaulDrawer";
import ViewNodeContent from "@/components/view/ViewNodeContent";
import { BrowserView, MobileView } from "react-device-detect";

import { cn, getViewportSize } from "@/lib/utils";
import { ImageNodeType, Team } from "@/lib/type";
import { EdgeLinkClickHandler, NodeLinkClickHandler } from "./ViewMarkdown";
import { X } from "lucide-react";
import { useEscapeCard } from "@/hooks/useEscapeCard";

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

    const renderContent = selectedNode !== null && nodeTeam !== null;

    return (
        <>
            <BrowserView>
                <ViewCard
                    onWidthChange={handleCardWidthChange}
                    isCardOpen={isCardOpen}
                    className={cn(
                        "transition-all absolute flex flex-col items-center",
                        {
                            "opacity-0 -z-10 invisible": !isCardOpen,
                            "opacity-1 z-10 visible": isCardOpen,
                        },
                    )}
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
                    <X className="x-close" onClick={onCardClose} />
                </ViewCard>
            </BrowserView>
            <MobileView>
                <VaulDrawer
                    open={isCardOpen}
                    onOpenChange={onDrawerOpenChange}
                    disableScrollablity={false}
                >
                    <div className="flex-col flex items-center gap-4 max-h-full">
                        {renderContent && (
                            <ViewNodeContent
                                onNodeLinkClicked={onNodeLinkClicked}
                                onEdgeLinkClicked={onEdgeLinkClicked}
                                selectedNode={selectedNode}
                                team={nodeTeam}
                                chapter={chapter}
                            />
                        )}
                    </div>
                </VaulDrawer>
            </MobileView>
        </>
    );
};

export default ViewNodeCard;
