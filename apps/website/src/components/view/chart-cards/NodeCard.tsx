import { Separator } from "@enreco-archive/common-ui/components/separator";
import { Stack, StackItem } from "@enreco-archive/common-ui/components/Stack";
import NodeCardDeco from "@/components/view/chart-cards/NodeCardDeco";
import ReadMarker from "@/components/view/chart-cards/ReadMarker";
import VaulDrawer from "@/components/view/chart-cards/VaulDrawer";
import CardFanartCarousel from "@/components/view/chart-cards/CardFanartCarousel";
import { getCardFanartData } from "@/components/view/chart-cards/card-fanart-utils";
import { ViewMarkdown } from "@/components/view/markdown/Markdown";
import { EdgeLinkClickHandler } from "@/components/view/markdown/EdgeLink";
import { NodeLinkClickHandler } from "@/components/view/markdown/NodeLink";
import { ImageNodeType } from "@enreco-archive/common/types";
import { isMobileViewport, isNode } from "@/lib/utils";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import CardDaySwitcher from "@/components/view/chart-cards/CardDaySwitcher";
import CardUtilities from "@/components/view/chart-cards/CardUtilities";
import { Check } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@enreco-archive/common-ui/components/tooltip";
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
    selectedNode: ImageNodeType;
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
    onDayChange: (newDay: number) => void;
}

const NodeCard = ({
    selectedNode,
    onNodeLinkClicked,
    onEdgeLinkClicked,
    onDayChange,
}: Props) => {
    const tNodeCard = useTranslations("cards.nodeCard");
    const tConstants = useTranslations("constants");

    const contentRef = useRef<HTMLDivElement>(null);

    const readStatus = usePersistedViewStore((state) => state.readStatus);
    const setReadStatus = usePersistedViewStore((state) => state.setReadStatus);

    const { chapter, day } = useViewStore(
        useShallow((state) => {
            return {
                chapter: state.chapter,
                day: state.day,
            };
        }),
    );

    const { getChapter } = useLocalizedData();
    const chapterData = getChapter(chapter);
    const charts = chapterData.charts;

    // Reset scroll position when selectedNode changes
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [selectedNode]);

    function onReadChange(isRead: boolean) {
        if (selectedNode) {
            setReadStatus(chapter, day, selectedNode.id, isRead);
        } else {
            console.error("onReadChange called with null selectedNode");
        }
    }

    const nodeTeamId = selectedNode?.data.teamId ?? null;
    const nodeTeam = nodeTeamId !== null ? chapterData.teams[nodeTeamId] : null;
    const { contentWithoutFanart, fanartEntries } = useMemo(
        () => getCardFanartData((selectedNode?.data.content as string) || ""),
        [selectedNode?.data.content],
    );

    const availiableNodes: ImageNodeType[] = [];
    for (const chart of charts) {
        for (const node of chart.nodes) {
            if (node.id === selectedNode.id) {
                availiableNodes.push(node);
            }
        }
    }

    const isNodeRead = getReadStatus(readStatus, chapter, day, selectedNode.id);

    return (
        <div
            className="h-full w-full overflow-auto scroll-smooth px-2"
            ref={contentRef}
        >
            {/* Header */}
            <div className="flex-none flex flex-col items-center">
                <Stack className="w-full">
                    <StackItem className="relative">
                        <NodeCardDeco color={selectedNode.data.bgCardColor} />
                        {isNodeRead && (
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger className="absolute top-2 right-2 z-20 bg-black/50 rounded-full p-1">
                                    <Check
                                        size={17}
                                        className="opacity-90"
                                        color="white"
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    {tNodeCard("readTooltip")}
                                </TooltipContent>
                            </Tooltip>
                        )}
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
                        <div className="font-semibold">
                            {chapter === 0
                                ? tNodeCard("guild")
                                : chapter === 1
                                  ? tNodeCard("job")
                                  : tNodeCard("team")}
                        </div>
                        <div>
                            {nodeTeam?.name ? tConstants(nodeTeam.name) : ""}
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="font-semibold">
                            {tNodeCard("status")}
                        </div>
                        <div>{selectedNode?.data.status}</div>
                    </div>
                </div>
                <Separator className="h-px w-full bg-border" />
            </div>

            {/* Content */}
            <div className="mt-2 overflow-x-hidden">
                <div className="flex items-center justify-between">
                    <CardDaySwitcher
                        currentDay={selectedNode.data.day}
                        onDayChange={onDayChange}
                        availiableElements={availiableNodes}
                    />
                    <CardUtilities chapter={chapter} node={selectedNode} />
                </div>
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
                            {contentWithoutFanart || tNodeCard("noContent")}
                        </ViewMarkdown>
                    </motion.div>
                </AnimatePresence>

                {fanartEntries.length > 0 && (
                    <>
                        <Separator className="my-4" />
                        <CardFanartCarousel
                            className="mt-5 md:px-4 px-2"
                            fanartEntries={fanartEntries}
                        />
                    </>
                )}
                <Separator className="my-4" />

                <PrevNextDayNavigation
                    onPreviousDayClick={() => {
                        const currentIndex = availiableNodes.findIndex(
                            (n) => n.data.day === selectedNode.data.day,
                        );
                        if (currentIndex > 0) {
                            const previousNode =
                                availiableNodes[currentIndex - 1];
                            onDayChange(previousNode.data.day);
                        }
                    }}
                    onNextDayClick={() => {
                        const currentIndex = availiableNodes.findIndex(
                            (n) => n.data.day === selectedNode.data.day,
                        );
                        if (currentIndex < availiableNodes.length - 1) {
                            const nextNode = availiableNodes[currentIndex + 1];
                            onDayChange(nextNode.data.day);
                        }
                    }}
                    disablePreviousDay={
                        selectedNode.data.day ===
                        Math.min(...availiableNodes.map((n) => n.data.day))
                    }
                    disableNextDay={
                        selectedNode.data.day ===
                        Math.max(...availiableNodes.map((n) => n.data.day))
                    }
                />
                <ReadMarker read={isNodeRead} setRead={onReadChange} />
            </div>
        </div>
    );
};

export default NodeCard;
