import VaulDrawer from "@/components/view/VaulDrawer";
import {
    EdgeLinkClickHandler,
    NodeLinkClickHandler,
    ViewMarkdown,
} from "@/components/view/ViewMarkdown";
import NodeCardDeco from "@/components/view/NodeCardDeco";
import ReadMarker from "@/components/view/ReadMarker";

import { idFromDayChapterId, isMobileViewport } from "@/lib/utils";
import { ImageNodeType, Team } from "@/lib/type";
import Image from "next/image";
import { Stack, StackItem } from "../ui/Stack";
import { useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";

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
            <div className="h-full w-full overflow-auto" ref={contentRef}>
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
                    <div className="text-2xl font-bold mb-2 underline underline-offset-4">
                        Day {selectedNode.data.day + 1}
                    </div>
                    <ViewMarkdown
                        onEdgeLinkClicked={onEdgeLinkClicked}
                        onNodeLinkClicked={onNodeLinkClicked}
                    >
                        {selectedNode?.data.content || "No content available"}
                    </ViewMarkdown>
                    <Separator className="mt-4" />
                    <ReadMarker
                        id={idFromDayChapterId(
                            selectedNode.data.day,
                            chapter,
                            selectedNode.id,
                        )}
                    />
                </div>
            </div>
        </VaulDrawer>
    );
};

export default ViewNodeCard;
