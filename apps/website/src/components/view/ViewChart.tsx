"use client";

import {
    CustomEdgeType,
    FitViewOperation,
    FixedEdgeType,
    ImageNodeType,
    StringToBooleanObjectMap,
} from "@enreco-archive/common/types";
import {
    ConnectionMode,
    EdgeMouseHandler,
    FitViewOptions,
    NodeMouseHandler,
    ReactFlow,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import ViewCustomEdge from "@/components/view/ViewCustomEdge";
import ImageNodeView from "@/components/view/ViewImageNode";
import { usePreviousValue } from "@/hooks/usePreviousValue";
import { useSettingStore } from "@/store/settingStore";
import { CardType } from "@/store/viewStore";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { isMobileViewport } from "@/lib/utils";

import { cn } from "@enreco-archive/common-ui/lib/utils";

import "@/components/view/ViewChart.css";

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
    return isMobileViewport() ? "100%" : `calc(100% - ${widthToShrink}px)`;
}

const nodeTypes = {
    image: ImageNodeView,
};

const edgeTypes = {
    fixed: ViewCustomEdge,
};

// On mobile it's harder to zoom out, so we set a lower min zoom
const minZoom = isMobileViewport() ? 0.3 : 0.5;
// To limit the area where the user can pan
const areaOffset = 1000;
const initialFitViewOptions = { padding: 0.5, duration: 1000 };
const proOptions = { hideAttribution: true };

interface Props {
    nodes: ImageNodeType[];
    edges: FixedEdgeType[];
    edgeVisibility: StringToBooleanObjectMap;
    selectedNode: ImageNodeType | null;
    selectedEdge: FixedEdgeType | null;
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
    currentCard: CardType;
    previousCard: CardType;
}

function ViewChart({
    nodes,
    edges,
    edgeVisibility,
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

    const fitViewAsync = useCallback(
        async (fitViewOptions?: FitViewOptions<ImageNodeType>) => {
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
        let actuallyDoFitView = prevDoFitView !== doFitView;

        if (widthToShrink !== prevWidthToShrink) {
            if (flowRendererSizer.current) {
                flowRendererSizer.current.style.width =
                    getFlowRendererWidth(widthToShrink);
            }

            actuallyDoFitView = true;
        }

        if (actuallyDoFitView) {
            // Need a slight delay to make sure the width is updated before fitting the view
            setTimeout(fitViewFunc, 20);
        }
    }, [
        doFitView,
        fitViewFunc,
        prevDoFitView,
        prevWidthToShrink,
        widthToShrink,
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

    const renderDimly = currentCard !== null && currentCard !== "setting";

    const onNodeClickHandler: NodeMouseHandler<ImageNodeType> = 
        useCallback((_ , node: ImageNodeType) => {
            onNodeClick(node);
    }, [onNodeClick]);

    const onEdgeClickHandler: EdgeMouseHandler<FixedEdgeType> =
        useCallback((_, edge: FixedEdgeType) => {
            // Disable edge selection on if is old edge and only show new is true
            if (edge.data?.day !== day && edgeVisibility["new"]) {
                return;
            }

            onEdgeClick(edge);
        }, [day, edgeVisibility, onEdgeClick]);

    const onPaneClickHandler = useCallback(() => {
        if (isCardOpen && (previousCard === "setting" || settingStore.autoPanBack)) {
            fitViewAsync({ padding: 0.5, duration: 1000 });
        }

        onPaneClick();
    }, [fitViewAsync, isCardOpen, onPaneClick, previousCard, settingStore.autoPanBack]);

    const reactFlowClassnames = useMemo(() => cn({"render-dimly": renderDimly}), [renderDimly]);

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
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={initialFitViewOptions}
                onNodeClick={onNodeClickHandler}
                onEdgeClick={onEdgeClickHandler}
                minZoom={minZoom}
                zoomOnDoubleClick={false}
                onPaneClick={onPaneClickHandler}
                proOptions={proOptions}
                translateExtent={translateExtent}
                className={reactFlowClassnames}
            />
        </div>
    );
}

export default memo(ViewChart);
