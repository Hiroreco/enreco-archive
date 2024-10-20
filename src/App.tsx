import GeneralEditorCard from "@/components/GeneralEditorCard";
import useEditor from "@/hooks/useEditor";
import useKeyboard from "@/hooks/useKeyboard";
import {
    ConnectionLineType,
    ConnectionMode,
    ReactFlow,
    ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ImageNode from "./components/ImageNode";
import DevTools from "./DevTool/DevTools";
import NewCustomEdge from "@/components/AnotherCustomEdge";
import EdgeEditorCard from "@/components/EdgeEditorCard";
import { useEditorStore } from "@/store/editorStore";
import NodeEditorCard from "@/components/NodeEditorCard";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/store/flowStore";
import { useChartStore } from "@/store/chartStore";
import { useState } from "react";

const nodeTypes = {
    image: ImageNode,
};

const edgeTypes = {
    custom: NewCustomEdge,
};

const App = () => {
    const { addNode, connectEdge, nodes, onNodesChange, edges, onEdgesChange } =
        useEditor();
    const { mode, currentCard, setCurrentCard, edgePaths, nodeHandles } =
        useEditorStore();
    const { setSelectedNode, setSelectedEdge } = useFlowStore();
    const { relationships } = useChartStore();
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance>();
    useKeyboard();

    const handleClick = (event: React.MouseEvent) => {
        if (mode === "place") {
            addNode(event.clientX, event.clientY);
            return;
        }
    };
    console.log(edges);

    // Export the chart data (nodes and edges) to a json file
    const handleExport = () => {
        if (!rfInstance) {
            return;
        }
        const flow = rfInstance.toObject();
        // in flow's edges, set each edge's path data to the corresponding edge in edgePaths
        flow.edges.forEach((edge) => {
            edge.data.path = edgePaths[edge.id];
        });
        flow.relationships = relationships;
        // export
        const dataStr = JSON.stringify(flow, null, 2);
        const dataUri =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(dataStr);
        const exportFileDefaultName = "flow.json";
        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();
    };

    if (!nodes || !edges) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-screen h-screen">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodesDraggable={mode === "edit"}
                onClick={(e) => {
                    handleClick(e);
                }}
                onNodeClick={(e, node) => {
                    setCurrentCard("node");
                    setSelectedNode(node);
                    setSelectedEdge(null);
                }}
                onEdgeClick={(e, edge) => {
                    setCurrentCard("edge");
                    setSelectedEdge(edge);
                    setSelectedNode(null);
                }}
                onConnect={(params) => {
                    console.log(params);
                    connectEdge(params);
                }}
                snapToGrid
                snapGrid={[100, 100]}
                connectionMode={ConnectionMode.Loose}
                connectionLineType={ConnectionLineType.SmoothStep}
                zoomOnDoubleClick={false}
                onInit={setRfInstance}
            >
                <DevTools></DevTools>
            </ReactFlow>
            {/* <div className="top-10 right-5 absolute">{mode}</div> */}
            <div className="absolute top-5 right-5 flex flex-row gap-4">
                <Button
                    onClick={() => {
                        setCurrentCard("general");
                        setSelectedNode(null);
                        setSelectedEdge(null);
                    }}
                >
                    General
                </Button>
                <Button onClick={handleExport}>Export</Button>
            </div>
            {currentCard === "node" && <NodeEditorCard />}
            {currentCard === "edge" && <EdgeEditorCard />}
            {currentCard === "general" && <GeneralEditorCard />}
        </div>
    );
};

export default App;
