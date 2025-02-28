"use client";

import {
    Chapter,
    CustomEdgeType,
    FitViewOperation,
    FixedEdgeType,
    ImageNodeType,
    StringToBooleanObjectMap,
} from "@/lib/type";
import {
    ConnectionMode,
    FitViewOptions,
    ReactFlow,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { isMobile } from "react-device-detect";

import ViewCustomEdge from "@/components/view/ViewCustomEdge";
import ImageNodeView from "@/components/view/ViewImageNode";
import { usePreviousValue } from "@/hooks/usePreviousValue";
import { OLD_EDGE_OPACITY } from "@/lib/constants";
import { useSettingStore } from "@/store/settingStore";
import { CardType } from "@/store/viewStore";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";

function findTopLeftNode(nodes: ImageNodeType[]) {
    let topLeftNode = nodes[0];
    for (const node of nodes) {
        if (
            node.position.x < topLeftNode.position.x ||
            (node.position.x === topLeftNode.position.x &&
                node.position.y < topLeftNode.position.y)
        ) {
            topLeftNode = node;
        }
    }
    return topLeftNode;
}

function findBottomRightNode(nodes: ImageNodeType[]) {
    let bottomRightNode = nodes[0];
    for (const node of nodes) {
        if (
            node.position.x > bottomRightNode.position.x ||
            (node.position.x === bottomRightNode.position.x &&
                node.position.y > bottomRightNode.position.y)
        ) {
            bottomRightNode = node;
        }
    }
    return bottomRightNode;
}

function getFlowRendererWidth(widthToShrink: number) {
    return isMobile ? "100%" : `calc(100% - ${widthToShrink}px)`;
}

const nodeTypes = {
    image: ImageNodeView,
};

const edgeTypes = {
    fixed: ViewCustomEdge,
};

// On mobile it's harder to zoom out, so we set a lower min zoom
const minZoom = isMobile ? 0.3 : 0.5;
// To limit the area where the user can pan
const areaOffset = 1000;

interface Props {
    nodes: ImageNodeType[];
    edges: FixedEdgeType[];
    edgeVisibility: StringToBooleanObjectMap;
    teamVisibility: StringToBooleanObjectMap;
    characterVisibility: StringToBooleanObjectMap;
    chapterData: Chapter;
    focusOnClickedEdge?: boolean;
    focusOnClickedNode?: boolean;
    selectedNode: ImageNodeType | null;
    selectedEdge: FixedEdgeType | null;
    focusOnSelectedEdge?: boolean;
    focusOnSelectedNode?: boolean;
    widthToShrink: number;
    isCardOpen: boolean;
    /**
     * A change in this prop will cause the chart to try and fit the viewport to show
     * certain elements on the screen, depending on fitViewOperation.
     */
    doFitView: boolean;
    fitViewOperation: FitViewOperation;
    onNodeClick: (node: ImageNodeType) => void;
    onEdgeClick: (edge: FixedEdgeType) => void;
    onPaneClick: () => void;
    day: number;
    chapter: number;
    previousSelectedDay: number;
    currentCard: CardType;
    previousCard: CardType;
}

function ViewChart({
    nodes,
    edges,
    edgeVisibility,
    teamVisibility,
    characterVisibility,
    chapterData,
    selectedNode,
    selectedEdge,
    widthToShrink,
    isCardOpen,
    doFitView,
    fitViewOperation,
    onNodeClick,
    onEdgeClick,
    onPaneClick,
    day,
    chapter,
    previousSelectedDay,
    currentCard,
    previousCard,
}: Props) {
    const topLeftNode = useMemo(() => findTopLeftNode(nodes), [nodes]);
    const bottomRightNode = useMemo(() => findBottomRightNode(nodes), [nodes]);

    const { fitView } = useReactFlow<ImageNodeType, CustomEdgeType>();
    const prevDoFitView = usePreviousValue(doFitView);
    const prevWidthToShrink = usePreviousValue(widthToShrink);
    const flowRendererSizer = useRef<HTMLDivElement>(null);

    const settingStore = useSettingStore();

    const flowRendererWidth = useMemo(
        () => getFlowRendererWidth(widthToShrink),
        [widthToShrink],
    );

    const fitViewAsync = useCallback(
        async (fitViewOptions?: FitViewOptions) => {
            await fitView(fitViewOptions);
        },
        [fitView],
    );

    const fitViewFunc = useCallback(() => {
        if (selectedNode && fitViewOperation === "fit-to-node") {
            fitViewAsync({
                nodes: [selectedNode],
                duration: 1000,
                maxZoom: 1.5,
            });
        } else if (selectedEdge && fitViewOperation === "fit-to-edge") {
            const nodeA = nodes.find((node) => node.id === selectedEdge.source);
            const nodeB = nodes.find((node) => node.id === selectedEdge.target);
            fitViewAsync({
                nodes: [nodeA!, nodeB!],
                duration: 1000,
            });
        } else if (fitViewOperation === "fit-to-all") {
            if (
                previousCard === "setting" ||
                currentCard === "setting" ||
                settingStore.autoPanBack
            ) {
                fitViewAsync({ padding: 0.5, duration: 1000 });
            }
        }
    }, [
        fitViewAsync,
        fitViewOperation,
        selectedEdge,
        selectedNode,
        previousCard,
        currentCard,
        settingStore.autoPanBack,
        nodes,
    ]);

    useEffect(() => {
        if (widthToShrink !== prevWidthToShrink) {
            if (flowRendererSizer.current) {
                flowRendererSizer.current.style.width =
                    getFlowRendererWidth(widthToShrink);
            }

            // Need a slight delay to make sure the width is updated before fitting the view
            setTimeout(fitViewFunc, 20);
        }
    }, [widthToShrink, prevWidthToShrink, fitViewFunc]);

    useEffect(() => {
        if (prevDoFitView !== doFitView) {
            // Like above, need a slight delay to make sure that nodes/edges
            // get updated in React Flow internally when new nodes/edges are
            // passed in.
            setTimeout(fitViewFunc, 20);
        }
    }, [doFitView, fitViewFunc, prevDoFitView]);

    useEffect(() => {
        if (flowRendererSizer.current) {
            flowRendererSizer.current.style.width = flowRendererWidth;
        }

        // Need a slight delay to make sure the width is updated before fitting the view
        setTimeout(fitViewFunc, 20);
    }, [flowRendererWidth, fitViewFunc]);

    // Filter and fill in render properties for nodes/edges before passing them to ReactFlow.
    const renderableNodes = useMemo(() => {
        return nodes
            .filter(
                (node) =>
                    teamVisibility[node.data.teamId || "null"] &&
                    characterVisibility[node.id],
            )
            .map((node) => {
                // Create a new node object to avoid mutating the original
                const newNode = { ...node, data: { ...node.data } };

                // Set team icon image, if available
                if (newNode.data.teamId) {
                    newNode.data.renderTeamImageSrc =
                        chapterData.teams[newNode.data.teamId].teamIconSrc ||
                        "";
                } else {
                    newNode.data.renderTeamImageSrc = "";
                }

                // Set selection state
                newNode.data.isSelected =
                    selectedNode?.id === newNode.id ||
                    selectedEdge?.source === newNode.id ||
                    selectedEdge?.target === newNode.id;

                // Set current day flag and chapter
                newNode.data.isCurrentDay = newNode.data.day === day;
                newNode.data.chapter = chapter;

                return newNode;
            });
    }, [
        nodes,
        teamVisibility,
        characterVisibility,
        chapterData.teams,
        selectedNode,
        selectedEdge,
        day,
        chapter,
    ]);

    // Memoize renderableEdges
    const renderableEdges = useMemo(() => {
        return edges
            .filter((edge) => {
                const nodeSrc = nodes.find((node) => node.id === edge.source);
                const nodeTarget = nodes.find(
                    (node) => node.id === edge.target,
                );
                if (!nodeSrc || !nodeTarget) {
                    return false;
                }

                const edgeData = edge.data;
                if (!edgeData) {
                    return false;
                }

                return (
                    edgeVisibility[edgeData.relationshipId] &&
                    teamVisibility[nodeSrc.data.teamId || "null"] &&
                    teamVisibility[nodeTarget.data.teamId || "null"] &&
                    characterVisibility[nodeSrc.id] &&
                    characterVisibility[nodeTarget.id]
                );
            })
            .map((edge) => {
                // Create a new edge object to avoid mutating the original
                const newEdge = {
                    ...edge,
                    data: edge.data ? { ...edge.data } : undefined,
                };
                const edgeData = newEdge.data;
                if (!edgeData) {
                    return newEdge;
                }

                const edgeStyle =
                    chapterData.relationships[edgeData.relationshipId].style ||
                    {};
                const isCurrentDay = edgeData.day === day;

                if (edgeVisibility["new"]) {
                    newEdge.style = {
                        ...edgeStyle,
                        opacity: isCurrentDay ? 1 : OLD_EDGE_OPACITY,
                        pointerEvents: isCurrentDay ? "auto" : "none",
                    };
                } else {
                    newEdge.style = {
                        ...edgeStyle,
                        opacity: 1,
                        pointerEvents: "auto",
                    };
                }

                // Check if edge is newly added
                const previousEdges =
                    chapterData.charts[previousSelectedDay].edges;
                if (newEdge.data) {
                    newEdge.data.isNewlyAdded = !previousEdges.find(
                        (e) => e.id === newEdge.id,
                    );
                }

                if (newEdge.data) {
                    if (selectedEdge) {
                        newEdge.data.isSelected =
                            selectedEdge.id === newEdge.id;
                    }
                    newEdge.data.isCurrentDay = isCurrentDay;
                    newEdge.data.chapter = chapter;
                }

                return newEdge;
            });
    }, [
        edges,
        nodes,
        edgeVisibility,
        teamVisibility,
        characterVisibility,
        chapterData.relationships,
        chapterData.charts,
        previousSelectedDay,
        selectedEdge,
        day,
        chapter,
    ]);

    const translateExtent = useMemo(() => {
        if (topLeftNode && bottomRightNode) {
            return [
                [
                    topLeftNode.position.x - areaOffset,
                    topLeftNode.position.y - areaOffset,
                ] as [number, number],
                [
                    bottomRightNode.position.x + areaOffset,
                    bottomRightNode.position.y + areaOffset,
                ] as [number, number],
            ] as [[number, number], [number, number]];
        }
        return undefined;
    }, [topLeftNode, bottomRightNode]);
    return (
        <div ref={flowRendererSizer} className="w-full h-full">
            <ReactFlow
                // Make nodes not draggable and not connectable
                // Accidentally found out you can move the nodes with arrow keys
                nodesDraggable={false}
                nodesConnectable={false}
                connectOnClick={false}
                deleteKeyCode={null}
                connectionMode={ConnectionMode.Loose}
                nodes={renderableNodes}
                edges={renderableEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.5, duration: 1000 }}
                onNodeClick={(_, node) => {
                    onNodeClick(node);
                }}
                onEdgeClick={(_, edge) => {
                    // Disable edge selection on if is old edge and only show new is true
                    if (edge.data?.day !== day && edgeVisibility["new"]) {
                        return;
                    }

                    onEdgeClick(edge);
                }}
                minZoom={minZoom}
                zoomOnDoubleClick={false}
                onPaneClick={() => {
                    if (isCardOpen) {
                        if (
                            previousCard === "setting" ||
                            settingStore.autoPanBack
                        ) {
                            fitViewAsync({ padding: 0.5, duration: 1000 });
                        }
                    }
                    onPaneClick();
                }}
                proOptions={{
                    hideAttribution: true,
                }}
                translateExtent={translateExtent}
            />
        </div>
    );
}

export default memo(ViewChart);
