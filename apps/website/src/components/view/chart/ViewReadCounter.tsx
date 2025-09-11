import {
    getReadStatus,
    usePersistedViewStore,
} from "@/store/persistedViewStore";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Checkbox } from "@enreco-archive/common-ui/components/checkbox";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { FixedEdgeType, ImageNodeType } from "@enreco-archive/common/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

interface ViewReadCounterProps {
    open: boolean;
    onClose: () => void;
    day: number;
    chapter: number;
    nodes: ImageNodeType[];
    edges: FixedEdgeType[];
    onNodeClick?: (node: ImageNodeType) => void;
    onEdgeClick?: (edge: FixedEdgeType) => void;
}

const ViewReadCounter = ({
    open,
    onClose,
    day,
    chapter,
    nodes,
    edges,
    onNodeClick,
    onEdgeClick,
}: ViewReadCounterProps) => {
    const tCommon = useTranslations("common");
    const tReadStatus = useTranslations("modals.readStatus");

    const [optimisticReadStates, setOptimisticReadStates] = useState<
        Record<string, boolean>
    >({});

    const readStatus = usePersistedViewStore((state) => state.readStatus);
    const setReadStatus = usePersistedViewStore((state) => state.setReadStatus);

    useEffect(() => {
        if (open) {
            const initialStates: Record<string, boolean> = {};

            // Initialize states for all filtered nodes and edges
            const filteredNodes = nodes.filter((node) => node.data.day === day);
            const filteredEdges = edges.filter(
                (edge) => edge.data?.day === day,
            );

            filteredNodes.forEach((node) => {
                initialStates[node.id] = getReadStatus(
                    readStatus,
                    chapter,
                    day,
                    node.id,
                );
            });

            filteredEdges.forEach((edge) => {
                initialStates[edge.id] = getReadStatus(
                    readStatus,
                    chapter,
                    day,
                    edge.id,
                );
            });

            setOptimisticReadStates(initialStates);
        }
    }, [open, day, chapter, nodes, edges, readStatus]);

    const handleNodeClick = (node: ImageNodeType) => {
        if (onNodeClick) {
            onNodeClick(node);
            onClose();
        }
    };

    const handleEdgeClick = (edge: FixedEdgeType) => {
        if (onEdgeClick) {
            onEdgeClick(edge);
            onClose();
        }
    };

    const handleNodeReadToggle = (nodeId: string, checked: boolean) => {
        // Optimistically update the local state immediately
        setOptimisticReadStates((prev) => ({
            ...prev,
            [nodeId]: checked,
        }));

        // Then update the actual state (which will save to localStorage)
        setReadStatus(chapter, day, nodeId, checked);
    };

    const handleEdgeReadToggle = (edgeId: string, checked: boolean) => {
        // Optimistically update the local state immediately
        setOptimisticReadStates((prev) => ({
            ...prev,
            [edgeId]: checked,
        }));

        // Then update the actual state (which will save to localStorage)
        setReadStatus(chapter, day, edgeId, checked);
    };

    // Get the read status with optimistic state fallback
    const getOptimisticReadStatus = (id: string) => {
        return (
            optimisticReadStates[id] ??
            getReadStatus(readStatus, chapter, day, id)
        );
    };

    // Mark all as read/unread
    const handleMarkAllAsRead = () => {
        const newStates: Record<string, boolean> = {};

        // Update all filtered elements to read
        filteredElements.nodes.forEach((node) => {
            newStates[node.id] = true;
            setReadStatus(chapter, day, node.id, true);
        });

        filteredElements.edges.forEach((edge) => {
            newStates[edge.id] = true;
            setReadStatus(chapter, day, edge.id, true);
        });

        setOptimisticReadStates((prev) => ({ ...prev, ...newStates }));
    };

    const handleMarkAllAsUnread = () => {
        const newStates: Record<string, boolean> = {};

        // Update all filtered elements to unread
        filteredElements.nodes.forEach((node) => {
            newStates[node.id] = false;
            setReadStatus(chapter, day, node.id, false);
        });

        filteredElements.edges.forEach((edge) => {
            newStates[edge.id] = false;
            setReadStatus(chapter, day, edge.id, false);
        });

        setOptimisticReadStates((prev) => ({ ...prev, ...newStates }));
    };

    // Get filtered elements that match the current day
    const filteredElements = useMemo(() => {
        const filterNodes = nodes.filter((node) => node.data.day === day);
        const filterEdges = edges.filter((edge) => edge.data?.day === day);

        return { nodes: filterNodes, edges: filterEdges };
    }, [nodes, edges, day]);

    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                if (!val) {
                    onClose();
                }
            }}
        >
            <DialogContent className="max-h-[75vh] h-[75vh] lg:max-w-[70vw] lg:w-[70vw] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        <div className="flex md:flex-row flex-col gap-2 md:justify-between items-center">
                            <span>{tReadStatus("title")}</span>
                            {(filteredElements.nodes.length > 0 ||
                                filteredElements.edges.length > 0) && (
                                <div className="flex gap-2 px-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleMarkAllAsRead}
                                    >
                                        {tReadStatus("markAllRead")}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleMarkAllAsUnread}
                                    >
                                        {tReadStatus("markAllUnread")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <VisuallyHidden>
                    <DialogDescription>
                        Track the read status of the elements
                    </DialogDescription>
                </VisuallyHidden>

                <div className="flex-1 overflow-y-auto w-full px-2">
                    {/* Nodes */}
                    {filteredElements.nodes.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">
                                {tReadStatus("characters")}
                            </h3>
                            <div className="grid lg:grid-cols-2 gap-4">
                                {filteredElements.nodes.map((node) => {
                                    const isRead = getOptimisticReadStatus(
                                        node.id,
                                    );
                                    return (
                                        <div
                                            key={node.id}
                                            className={cn(
                                                "transition-all flex items-center gap-4 p-2 rounded-md border cursor-pointer hover:brightness-90",
                                                {
                                                    "dark:bg-accent/50 bg-accent/20":
                                                        isRead,
                                                    "bg-muted": !isRead,
                                                },
                                            )}
                                        >
                                            <Checkbox
                                                checked={isRead}
                                                onCheckedChange={(checked) =>
                                                    handleNodeReadToggle(
                                                        node.id,
                                                        checked as boolean,
                                                    )
                                                }
                                                className="shrink-0"
                                            />
                                            <div
                                                className="flex items-center gap-3 flex-1"
                                                onClick={() =>
                                                    handleNodeClick(
                                                        node as ImageNodeType,
                                                    )
                                                }
                                            >
                                                <div className="relative md:size-10 size-8 shrink-0">
                                                    <Image
                                                        src={node.data.imageSrc}
                                                        alt={node.data.title}
                                                        fill
                                                        className="object-cover rounded-md"
                                                    />
                                                </div>
                                                <span className="font-medium md:text-base text-sm">
                                                    {node.data.title}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Edges */}
                    {filteredElements.edges.length > 0 && (
                        <div className="space-y-2 mt-4">
                            <h3 className="font-semibold">
                                {tReadStatus("relationships")}
                            </h3>
                            <div className="grid lg:grid-cols-2 gap-4">
                                {filteredElements.edges.map((edge) => {
                                    const isRead = getOptimisticReadStatus(
                                        edge.id,
                                    );
                                    return (
                                        <div
                                            key={edge.id}
                                            className={cn(
                                                "transition-all flex items-center gap-4 p-2 rounded-md border cursor-pointer hover:brightness-90",
                                                {
                                                    "dark:bg-accent/50 bg-accent/20":
                                                        isRead,
                                                    "bg-muted": !isRead,
                                                },
                                            )}
                                        >
                                            <Checkbox
                                                checked={isRead}
                                                onCheckedChange={(checked) =>
                                                    handleEdgeReadToggle(
                                                        edge.id,
                                                        checked as boolean,
                                                    )
                                                }
                                                className="shrink-0"
                                            />
                                            <div
                                                className="flex items-center gap-3 flex-1"
                                                onClick={() =>
                                                    handleEdgeClick(
                                                        edge as FixedEdgeType,
                                                    )
                                                }
                                            >
                                                <div className="flex gap-1">
                                                    <div className="relative md:size-10 size-8 shrink-0">
                                                        <Image
                                                            src={
                                                                nodes.find(
                                                                    (node) =>
                                                                        node.id ===
                                                                        edge.source,
                                                                )?.data
                                                                    .imageSrc ||
                                                                ""
                                                            }
                                                            alt={
                                                                nodes.find(
                                                                    (node) =>
                                                                        node.id ===
                                                                        edge.source,
                                                                )?.data.title ||
                                                                ""
                                                            }
                                                            fill
                                                            className="object-cover rounded-md"
                                                        />
                                                    </div>
                                                    <div className="relative md:size-10 size-8 shrink-0">
                                                        <Image
                                                            src={
                                                                nodes.find(
                                                                    (node) =>
                                                                        node.id ===
                                                                        edge.target,
                                                                )?.data
                                                                    .imageSrc ||
                                                                ""
                                                            }
                                                            alt={
                                                                nodes.find(
                                                                    (node) =>
                                                                        node.id ===
                                                                        edge.target,
                                                                )?.data.title ||
                                                                ""
                                                            }
                                                            fill
                                                            className="object-cover rounded-md"
                                                        />
                                                    </div>
                                                </div>
                                                <span className="font-medium md:text-base text-sm">
                                                    {edge.data?.title}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {filteredElements.nodes.length === 0 &&
                        filteredElements.edges.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                No cards to show for this day
                            </div>
                        )}
                </div>

                <Separator />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button className="self-end">{tCommon("close")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewReadCounter;
