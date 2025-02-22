import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    BackgroundVariant,
    Connection,
    ConnectionLineType,
    ConnectionMode,
    OnEdgesChange,
    OnNodesChange,
    ReactFlow,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import EditorImageNode from "@/components/editor/EditorImageNode";
import EditorCustomEdge from "@/components/editor/EditorCustomEdge";
import EditorSmoothEdge from "@/components/editor/EditorSmoothEdge";
import EditorStraightEdge from "@/components/editor/EditorStraightEdge";
import {
    CustomEdgeType,
    CustomEdgeTypeNames,
    EditorImageNodeType,
} from "@/lib/type";
import { MouseEventHandler, useCallback } from "react";
import { DEFAULT_NODE_IMAGE } from "@/lib/constants";
import { generateEdgeId } from "@/lib/editor-utils";

const nodeTypes = {
    editorImage: EditorImageNode,
};

const edgeTypes = {
    custom: EditorCustomEdge,
    customSmooth: EditorSmoothEdge,
    customStraight: EditorStraightEdge,
};

interface EditorChartProps {
    nodes: EditorImageNodeType[];
    edges: CustomEdgeType[];
    areNodesDraggable: boolean;
    canPlaceNewNode: boolean;
    edgeType: CustomEdgeTypeNames;
    isDarkMode: boolean;
    onNodeClick: (node: EditorImageNodeType) => void;
    onEdgeClick: (edge: CustomEdgeType) => void;
    setNodes: (nodes: EditorImageNodeType[]) => void;
    setEdges: (edges: CustomEdgeType[]) => void;
}

export default function EditorChart({
    nodes,
    edges,
    areNodesDraggable,
    canPlaceNewNode,
    edgeType,
    isDarkMode,
    setNodes,
    setEdges,
    onNodeClick,
    onEdgeClick,
}: EditorChartProps) {
    const { screenToFlowPosition } = useReactFlow();

    const addNode = useCallback(
        (x: number, y: number) => {
            const newNode: EditorImageNodeType = {
                id: `node-${nodes.length + 1}`,
                type: "editorImage",
                position: screenToFlowPosition({ x, y }),
                data: {
                    title: "",
                    content: "",
                    imageSrc: DEFAULT_NODE_IMAGE,
                    teamId: "",
                    status: "",
                    day: 0,
                    bgCardColor: "",
                    renderShowHandles: true,
                },
            };
            setNodes([...nodes, newNode]);
        },
        [nodes, screenToFlowPosition, setNodes],
    );

    const connectEdge = useCallback(
        (params: Connection) => {
            const pathType = (() => {
                switch (edgeType) {
                    case "custom":
                        return "custom";
                    case "customSmooth":
                        return "smoothstep";
                    case "customStraight":
                        return "straight";
                    default:
                        throw new Error(
                            `Cannot find pathType for edgeType ${edgeType}`,
                        );
                }
            })();

            const newEdge: CustomEdgeType = {
                id: generateEdgeId(
                    params.source,
                    params.target,
                    params.sourceHandle,
                    params.targetHandle,
                ),
                source: params.source,
                target: params.target,
                sourceHandle: params.sourceHandle,
                targetHandle: params.targetHandle,
                type: edgeType,
                style: {},
                data: {
                    relationshipId: "",
                    title: "",
                    content: "",
                    day: 0,
                    pathType: pathType,
                    offsets:
                        pathType === "custom"
                            ? {
                                  HL: 0,
                                  VL: 0,
                                  HC: 0,
                                  VR: 0,
                                  HR: 0,
                              }
                            : undefined,
                },
            };

            setEdges(addEdge(newEdge, edges));
        },
        [edgeType, edges, setEdges],
    );

    const onNodesChange: OnNodesChange<EditorImageNodeType> = useCallback(
        (changes) => {
            const newNodes = applyNodeChanges(changes, nodes);
            setNodes(newNodes);
        },
        [nodes, setNodes],
    );

    const onEdgesChange: OnEdgesChange<CustomEdgeType> = useCallback(
        (changes) => {
            const newEdges = applyEdgeChanges(changes, edges);
            setEdges(newEdges);
        },
        [edges, setEdges],
    );

    const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(
        (event) => {
            if (canPlaceNewNode) {
                addNode(event.clientX, event.clientY);
            }
        },
        [addNode, canPlaceNewNode],
    );

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodesDraggable={areNodesDraggable}
            onClick={handleClick}
            onNodeClick={(_, node) => {
                onNodeClick(node);
            }}
            onEdgeClick={(_, edge) => {
                onEdgeClick(edge);
            }}
            onConnect={connectEdge}
            snapToGrid
            snapGrid={[25, 25]}
            connectionMode={ConnectionMode.Loose}
            connectionLineType={ConnectionLineType.SmoothStep}
            zoomOnDoubleClick={false}
        >
            <Background
                id="bg-axis"
                color={isDarkMode ? "#3f3f3f" : "#dcdcdc"}
                variant={BackgroundVariant.Cross}
                gap={25}
            />
        </ReactFlow>
    );
}
