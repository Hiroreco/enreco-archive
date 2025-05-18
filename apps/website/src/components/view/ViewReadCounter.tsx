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
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import { Label } from "@enreco-archive/common-ui/components/label";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import {
    ChartData,
    FixedEdgeType,
    ImageNodeType,
} from "@enreco-archive/common/types";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface ViewReadCounterProps {
    day: number;
    chapter: number;
    chartData: ChartData;
    hidden: boolean;
    onNodeClick?: (node: ImageNodeType) => void;
    onEdgeClick?: (edge: FixedEdgeType) => void;
}

const ViewReadCounter = ({
    day,
    chapter,
    chartData,
    hidden,
    onNodeClick,
    onEdgeClick,
}: ViewReadCounterProps) => {
    const [readCount, setReadCount] = useState(0);
    const [showRead, setShowRead] = useState(false);
    const [showUnread, setShowUnread] = useState(true);
    const [open, setOpen] = useState(false);

    const handleNodeClick = (node: ImageNodeType) => {
        if (onNodeClick) {
            onNodeClick(node);
            setOpen(false);
        }
    };

    const handleEdgeClick = (edge: FixedEdgeType) => {
        if (onEdgeClick) {
            onEdgeClick(edge);
            setOpen(false);
        }
    };

    // Get elements that belong to current day
    const currentDayElements = useMemo(
        () => [
            ...chartData.nodes.filter((node) => node.data.day === day),
            ...chartData.edges.filter((edge) => edge.data?.day === day),
        ],
        [chartData.nodes, chartData.edges, day],
    );

    const totalCount = currentDayElements.length;

    useEffect(() => {
        // Count read elements from current day
        const count = currentDayElements.reduce((acc, element) => {
            return element.data?.isRead ? acc + 1 : acc;
        }, 0);

        setReadCount(count);
    }, [currentDayElements, day, chapter, hidden]);

    // Get filtered elements
    const filteredElements = useMemo(() => {
        const filterNodes = chartData.nodes.filter((node) => {
            if (node.data.day !== day) return false;
            return (
                (showRead && node.data.isRead) ||
                (showUnread && !node.data.isRead)
            );
        });

        const filterEdges = chartData.edges.filter((edge) => {
            if (edge.data?.day !== day) return false;
            return (
                (showRead && edge.data.isRead) ||
                (showUnread && !edge.data.isRead)
            );
        });

        return { nodes: filterNodes, edges: filterEdges };
    }, [chartData.nodes, chartData.edges, day, showRead, showUnread]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                className={cn(
                    "fixed top-2 left-1/2 -translate-x-1/2 py-2 opacity-60 bg-transparent border-2 hover:border-accent-foreground rounded-md text-foreground hover:bg-accent hover:text-accent-foreground hover:opacity-100 transition-all w-[120px]",
                    {
                        invisible: hidden,
                        visible: !hidden,
                    },
                )}
            >
                {readCount}/{totalCount} Read
            </DialogTrigger>

            <DialogContent className="max-h-[75vh] h-[75vh] lg:max-w-[70vw] lg:w-[70vw] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        <div className="flex justify-between">
                            <span>Read Status</span>
                            <div className="flex gap-4 mr-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="show-read"
                                        checked={showRead}
                                        onCheckedChange={(checked) =>
                                            setShowRead(checked as boolean)
                                        }
                                    />
                                    <Label htmlFor="show-read">Read</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="show-unread"
                                        checked={showUnread}
                                        onCheckedChange={(checked) =>
                                            setShowUnread(checked as boolean)
                                        }
                                    />
                                    <Label htmlFor="show-unread">Unread</Label>
                                </div>
                            </div>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <VisuallyHidden>
                    <DialogDescription>
                        Track the read status of the elements
                    </DialogDescription>
                </VisuallyHidden>

                <div className="flex-1 overflow-y-auto w-full">
                    {/* Nodes */}
                    {filteredElements.nodes.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Characters</h3>
                            <div className="grid lg:grid-cols-2 gap-4">
                                {filteredElements.nodes.map((node) => (
                                    <div
                                        key={node.id}
                                        className={cn(
                                            "transition-all flex items-center gap-4 p-1 rounded-md border cursor-pointer",
                                            {
                                                "bg-accent/20":
                                                    node.data.isRead,
                                                "bg-muted hover:bg-accent hover:text-accent-foreground":
                                                    !node.data.isRead,
                                            },
                                        )}
                                        onClick={() =>
                                            handleNodeClick(
                                                node as ImageNodeType,
                                            )
                                        }
                                    >
                                        <div className="relative h-10 w-10 shrink-0">
                                            <Image
                                                src={node.data.imageSrc}
                                                alt={node.data.title}
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                        </div>
                                        <span className="font-medium">
                                            {node.data.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Edges */}
                    {filteredElements.edges.length > 0 && (
                        <div className="space-y-2 mt-4">
                            <h3 className="font-semibold">Relationships</h3>
                            <div className="grid lg:grid-cols-2 gap-4">
                                {filteredElements.edges.map((edge) => (
                                    <div
                                        key={edge.id}
                                        className={cn(
                                            "transition-all flex items-center gap-4 p-1 rounded-md border cursor-pointer",
                                            {
                                                "bg-accent/20":
                                                    edge.data?.isRead,
                                                "bg-muted hover:bg-accent hover:text-accent-foreground":
                                                    !edge.data?.isRead,
                                            },
                                        )}
                                        onClick={() =>
                                            handleEdgeClick(
                                                edge as FixedEdgeType,
                                            )
                                        }
                                    >
                                        <div className="flex gap-1">
                                            <div className="relative h-10 w-10 shrink-0">
                                                <Image
                                                    src={
                                                        chartData.nodes.find(
                                                            (node) =>
                                                                node.id ===
                                                                edge.source,
                                                        )?.data.imageSrc || ""
                                                    }
                                                    alt={
                                                        chartData.nodes.find(
                                                            (node) =>
                                                                node.id ===
                                                                edge.source,
                                                        )?.data.title || ""
                                                    }
                                                    fill
                                                    className="object-cover rounded-md"
                                                />
                                            </div>
                                            <div className="relative h-10 w-10 shrink-0">
                                                <Image
                                                    src={
                                                        chartData.nodes.find(
                                                            (node) =>
                                                                node.id ===
                                                                edge.target,
                                                        )?.data.imageSrc || ""
                                                    }
                                                    alt={
                                                        chartData.nodes.find(
                                                            (node) =>
                                                                node.id ===
                                                                edge.target,
                                                        )?.data.title || ""
                                                    }
                                                    fill
                                                    className="object-cover rounded-md"
                                                />
                                            </div>
                                        </div>
                                        <span className="font-medium">
                                            {edge.data?.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredElements.nodes.length === 0 &&
                        filteredElements.edges.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                No cards to show with current filters
                            </div>
                        )}
                </div>

                <Separator />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button className="self-end">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewReadCounter;
