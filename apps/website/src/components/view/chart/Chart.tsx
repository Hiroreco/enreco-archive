"use client";

import {
    FixedEdgeType,
    ImageNodeType,
} from "@enreco-archive/common/types";
import {
    ConnectionMode,
    EdgeMouseHandler,
    NodeMouseHandler,
    ReactFlow,
    Rect,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import CustomEdge from "@/components/view/chart/CustomEdge";
import ImageNodeView from "@/components/view/chart/ImageNode";
import { isEdge, isNode } from "@/lib/utils";
import { useViewStore } from "@/store/viewStore";
import {
    memo,
    Ref,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
} from "react";

import { cn } from "@enreco-archive/common-ui/lib/utils";

import { useCompleteChartData } from "@/hooks/data/useCompleteChartData";
import useIsMobileViewport from "@/hooks/useIsMobileViewport";
import { useShallow } from "zustand/react/shallow";
import "./Chart.css";

import { getNodeDimensions, getViewportForBounds } from "@xyflow/system"

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

// Find a box that is big enough to contain all specified nodes/edges.
// Returns an object containing x, y, coords and width/height of the box.
// x,y represent the top left corner of the bounding box.
//
// Note this function can only be called on client as it relies on DOM
// to get the bounding box of edges.
function getBoundingBox(nodes: ImageNodeType[], edges: FixedEdgeType[]) {
    // x1,y2 is top left most point and x2,y2 is bottom right most point
    const bboxCoords = {
        x1: Infinity,
        y1: Infinity,
        x2: -Infinity,
        y2: -Infinity,
    };

    const updateBboxCoords = (newX: number, newY: number, width: number, height: number) => {
        if (newX < bboxCoords.x1) {
            bboxCoords.x1 = newX;
        }

        if (newY < bboxCoords.y1) {
            bboxCoords.y1 = newY;
        }

        if (newX + width > bboxCoords.x2) {
            bboxCoords.x2 = newX + width;
        }

        if (newY + height > bboxCoords.y2) {
            bboxCoords.y2 = newY + height;
        }
    };

    for(const node of nodes) {
        const {width, height} = getNodeDimensions(node);
        const {x, y} = node.position;

        updateBboxCoords(x, y, width, height);
    }

    for(const edge of edges) {
        const edgeElement = document.querySelector(`[data-id=${edge.id}]`)
        if(!edgeElement) {
            console.warn(`Can't find edge dom element with edge id ${edge.id}.`);
            continue;
        }

        const edgeBbox: SVGRect = (edgeElement as SVGLineElement).getBBox();
        updateBboxCoords(edgeBbox.x, edgeBbox.y, edgeBbox.width, edgeBbox.height);
    }

    return {
        x: bboxCoords.x1,
        y: bboxCoords.y1,
        height: Math.max(bboxCoords.y2 - bboxCoords.y1, 0),
        width: Math.max(bboxCoords.x2 - bboxCoords.x1, 0),
    };
}

const nodeTypes = {
    image: ImageNodeView,
};

const edgeTypes = {
    fixed: CustomEdge,
};

// On mobile it's harder to zoom out, so we set a lower min zoom
// To limit the area where the user can pan
const areaOffset = 1000;
const initialFitViewOptions = { padding: 0.5, duration: 1000 };
const proOptions = { hideAttribution: true };

interface Props {
    onNodeClick: (node: ImageNodeType) => void;
    onEdgeClick: (edge: FixedEdgeType) => void;
    onPaneClick: () => void;
    ref: Ref<ChartInstance>;
}

export interface ChartInstance {
    chartFitView: (element: ImageNodeType | FixedEdgeType | null, padding: number, offsetRight: number) => void;
}

function Chart({
    onNodeClick,
    onEdgeClick,
    onPaneClick,
    ref
}: Props) {
    const { currentCard } = useViewStore(
        useShallow((state) => ({
            currentCard: state.currentCard,
        })),
    );

    const { nodes, edges } = useCompleteChartData();

    const topLeftNode = useMemo(() => findTopLeftNode(nodes), [nodes]);
    const bottomRightNode = useMemo(() => findBottomRightNode(nodes), [nodes]);

    const { getNode, getNodes, getEdges, setViewport } = useReactFlow<ImageNodeType, FixedEdgeType>();
    const chartDiv = useRef<HTMLDivElement>(null);

    const isMobile = useIsMobileViewport();
    const minZoom = isMobile ? 0.3 : 0.5;

    useImperativeHandle(
        ref,
        () => ({
            // Function to fit the viewport of the chart to a specific element. You can pass null
            // to fit against the entire chart. This will also take into account a right handed offset.
            // (Useful for opening drawer)
            chartFitView: (element, padding: number = 0, offset: number = 0) => {
                let bbox: Rect;
                if (element === null) {
                    bbox = getBoundingBox(getNodes(), getEdges());
                } else if (isNode(element)) {
                    bbox = getBoundingBox([element], []);
                } else if (isEdge(element)) {
                    const srcNode = getNode(element.source);
                    const tgtNode = getNode(element.target);

                    if (srcNode && tgtNode) {
                        bbox = getBoundingBox([srcNode, tgtNode], [element]);
                    } else {
                        console.warn(`Source and target nodes are undefined.`);
                        return;
                    }
                } else {
                    throw new Error("Should not happen.");
                }

                // I'm not entirely sure why this works, but it does sooooooo
                const newViewport = getViewportForBounds(
                    bbox,
                    (chartDiv.current !== null ? chartDiv.current.clientWidth : window.screen.width) - offset,
                    chartDiv.current !== null ? chartDiv.current.clientHeight : window.screen.height,
                    minZoom,
                    1.5,
                    padding
                );

                setViewport(newViewport, { duration: 1000 });
            },
        }),
        [minZoom, getNode, getNodes, getEdges, setViewport],
    );

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

    const onNodeClickHandler: NodeMouseHandler<ImageNodeType> = useCallback(
        (_, node: ImageNodeType) => {
            onNodeClick(node);
        },
        [onNodeClick],
    );

    const onEdgeClickHandler: EdgeMouseHandler<FixedEdgeType> = useCallback(
        (_, edge: FixedEdgeType) => {
            onEdgeClick(edge);
        },
        [onEdgeClick],
    );

    const renderDimly = currentCard !== null && currentCard !== "setting";
    const reactFlowClassnames = useMemo(
        () => cn({ "render-dimly": renderDimly }),
        [renderDimly],
    );

    return (
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
            onPaneClick={onPaneClick}
            minZoom={minZoom}
            zoomOnDoubleClick={false}
            proOptions={proOptions}
            translateExtent={translateExtent}
            className={reactFlowClassnames}
            ref={chartDiv}
        />
    );
}

export default memo(Chart);
