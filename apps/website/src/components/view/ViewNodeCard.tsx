import { Separator } from "@enreco-archive/common-ui/components/separator";
import { Stack, StackItem } from "@enreco-archive/common-ui/components/Stack";
import NodeCardDeco from "@/components/view/NodeCardDeco";
import ReadMarker from "@/components/view/ReadMarker";
import VaulDrawer from "@/components/view/VaulDrawer";
import { ViewMarkdown } from "@/components/view/ViewMarkdown";
import { EdgeLinkClickHandler } from "@/components/view/markdown/EdgeLink";
import { NodeLinkClickHandler } from "@/components/view/markdown/NodeLink";
import { ImageNodeType, Team } from "@enreco-archive/common/types";
import { idFromChapterDayId, isMobileViewport } from "@/lib/utils";

import Image from "next/image";
import { useEffect, useRef } from "react";
import ViewCardDaySwitcher from "@/components/view/ViewCardDaySwitcher";
import ViewCardUtilities from "@/components/view/ViewCardUtilities";

interface Props {
    isCardOpen: boolean;
    selectedNode: ImageNodeType | null;
    nodeTeam: Team | null;
    chapter: number;
    onCardClose: () => void;
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
    setChartShrink: (width: number) => void;
    onDayChange: (newDay: number) => void;
    availiableNodes: ImageNodeType[];
}

const ViewNodeCard = ({
    isCardOpen,
    selectedNode,
    nodeTeam,
    chapter,
    availiableNodes,
    onCardClose,
    onNodeLinkClicked,
    onEdgeLinkClicked,
    setChartShrink,
    onDayChange,
}: Props) => {
    const contentRef = useRef<HTMLDivElement>(null);

    // Reset scroll position when selectedNode changes
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [selectedNode]);

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

    const renderContent = selectedNode !== null && nodeTeam !== null;
    if (!renderContent) {
        return (
            <VaulDrawer
                open={isCardOpen}
                onOpenChange={onDrawerOpenChange}
                disableScrollablity={false}
            ></VaulDrawer>
        );
    }

    return (
        <VaulDrawer
            open={isCardOpen}
            onOpenChange={onDrawerOpenChange}
            onWidthChange={handleCardWidthChange}
            disableScrollablity={false}
        >
            <div className="h-full w-full overflow-auto px-2" ref={contentRef}>
                {/* Header */}
                <div className="flex-none flex flex-col items-center">
                    <Stack className="w-full">
                        <StackItem>
                            <NodeCardDeco
                                color={selectedNode.data.bgCardColor}
                            />
                        </StackItem>
                        <StackItem>
                            {selectedNode?.data.imageSrc && (
                                <Image
                                    alt="character image"
                                    className="aspect-square w-[150px] z-10 dark:brightness-[0.87] mx-auto mt-4 relative"
                                    src={selectedNode?.data.imageSrc}
                                    width={150}
                                    height={150}
                                />
                            )}
                        </StackItem>
                    </Stack>

                    <div className="font-semibold text-center text-lg my-1">
                        {selectedNode?.data.title}
                    </div>

                    <Separator className="h-px w-full bg-border" />
                    <div className="flex flex-row justify-around w-full">
                        <div className="flex flex-col items-center">
                            <div className="font-semibold">Team</div>
                            <div>{nodeTeam?.name}</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="font-semibold">Status</div>
                            <div>{selectedNode?.data.status}</div>
                        </div>
                    </div>
                    <Separator className="h-px w-full bg-border" />
                </div>

                {/* Content */}
                <div className="mt-2 overflow-x-hidden">
                    <div className="flex items-center justify-between">
                        <ViewCardDaySwitcher
                            currentDay={selectedNode.data.day}
                            onDayChange={onDayChange}
                            availiableElements={availiableNodes}
                        />
                        <ViewCardUtilities
                            chapter={chapter}
                            node={selectedNode}
                        />
                    </div>

                    <ViewMarkdown
                        onEdgeLinkClicked={onEdgeLinkClicked}
                        onNodeLinkClicked={onNodeLinkClicked}
                        className="md:px-4 px-2"
                    >
                        {selectedNode?.data.content || "No content available"}
                    </ViewMarkdown>
                    <Separator className="mt-4" />
                    <ReadMarker
                        id={idFromChapterDayId(
                            chapter,
                            selectedNode.data.day,
                            selectedNode.id,
                        )}
                        read={selectedNode.data.isRead}
                    />
                </div>
            </div>
        </VaulDrawer>
    );
};

export default ViewNodeCard;
