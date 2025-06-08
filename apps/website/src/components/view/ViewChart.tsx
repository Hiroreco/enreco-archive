"use client";

import {
    CustomEdgeType,
    FixedEdgeType,
    ImageNodeType,
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
import { useSettingStore } from "@/store/settingStore";
import { CardType } from "@/store/viewStore";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { isEdge, isMobileViewport, isNode } from "@/lib/utils";

import { cn } from "@enreco-archive/common-ui/lib/utils";

import "@/components/view/ViewChart.css";
import { usePreviousValue } from "@/hooks/usePreviousValue";

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
    if(widthToShrink === 0) {
        return "100%";
    }

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
    selectedElement: ImageNodeType | FixedEdgeType | null;
    widthToShrink: number;
    currentCard: CardType;
    onNodeClick: (node: ImageNodeType) => void;
    onEdgeClick: (edge: FixedEdgeType) => void;
    onPaneClick: () => void;
}

function ViewChart({
    nodes,
    edges,
    selectedElement,
    widthToShrink,
    currentCard,
    onNodeClick,
    onEdgeClick,
    onPaneClick
}: Props) {
    const topLeftNode = useMemo(() => findTopLeftNode(nodes), [nodes]);
    const bottomRightNode = useMemo(() => findBottomRightNode(nodes), [nodes]);

    const { fitView, getNode } = useReactFlow<ImageNodeType, CustomEdgeType>();
    const flowRendererSizer = useRef<HTMLDivElement>(null);
    const previousCard = usePreviousValue(currentCard);

    const autoPanBack = useSettingStore(state => state.autoPanBack);

    const fitViewAsync = useCallback(
        async (fitViewOptions?: FitViewOptions<ImageNodeType>) => {
            setTimeout(async () => await fitView(fitViewOptions), 20);
        },
        [fitView],
    );

    useEffect(() => {
        function fitView() {
            if(selectedElement !== null) {
                if(isNode(selectedElement)) {
                    fitViewAsync({
                        nodes: [selectedElement],
                        duration: 1000,
                        maxZoom: 1.5,
                    });
                }
                else if(isEdge(selectedElement)) {
                    const srcNode = getNode(selectedElement.source);
                    const tgtNode = getNode(selectedElement.target);

                    if(srcNode && tgtNode) {
                        fitViewAsync({
                            nodes: [srcNode, tgtNode],
                            duration: 1000,
                        });
                    }
                }
            }
            else if (selectedElement === null && autoPanBack) {
                fitViewAsync({ padding: 0.5, duration: 1000 });
            }
        }

        // If opening a new card, defer until resize, unless we're on mobile in which case resize immediately.
        if(isMobileViewport() || !(previousCard === null && currentCard !== null)) {
            fitView();
        }

    }, [autoPanBack, currentCard, fitViewAsync, getNode, previousCard, selectedElement, widthToShrink]);

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

    const onNodeClickHandler: NodeMouseHandler<ImageNodeType> = 
        useCallback((_ , node: ImageNodeType) => {
            onNodeClick(node);
    }, [onNodeClick]);

    const onEdgeClickHandler: EdgeMouseHandler<FixedEdgeType> =
        useCallback((_, edge: FixedEdgeType) => {
            onEdgeClick(edge);
        }, [onEdgeClick]);

    const isCardOpen = currentCard !== null;
    const onPaneClickHandler = useCallback(() => {
        if (isCardOpen && (previousCard === "setting" || autoPanBack)) {
            fitViewAsync({ padding: 0.5, duration: 1000 });
        }

        onPaneClick();
    }, [fitViewAsync, isCardOpen, onPaneClick, previousCard, autoPanBack]);

    const renderDimly = currentCard !== null && currentCard !== "setting";
    const reactFlowClassnames = useMemo(() => cn({"render-dimly": renderDimly}), [renderDimly]);
    const newWidth = useMemo(() => ({ width: getFlowRendererWidth(widthToShrink) }), [widthToShrink]);

    return (
        <div ref={flowRendererSizer} style={newWidth} className="w-full h-full">
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
