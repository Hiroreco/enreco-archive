import { EDGE_WIDTH, OLD_EDGE_OPACITY } from "@enreco-archive/common-types/constants";
import { CustomEdgeProps } from "@enreco-archive/common-types/types";
import { useEditorStore } from "@/store/editorStore";
import { BaseEdge, getSmoothStepPath } from "@xyflow/react";

const EditorSmoothEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    style,
}: CustomEdgeProps) => {
    const strokeColor = style?.stroke || "#000";
    const { day: currentDay } = useEditorStore();

    const isCurrentDay = data?.day === currentDay || false;

    const [path] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 0,
    });

    return (
        <>
            <svg width="0" height="0">
                <defs>
                    <marker
                        id={`arrow-${id}`}
                        viewBox="0 0 10 10"
                        refX="10" // Adjust reference point for correct positioning
                        refY="5" // Adjust to center the arrow on the line
                        markerWidth="4"
                        markerHeight="4"
                        className="stroke-1"
                        orient="auto-start-reverse" // Automatically orient the marker based on line direction
                    >
                        <path d="M0,0 L10,5 L0,10 z" fill={strokeColor} />
                    </marker>
                </defs>
            </svg>
            <BaseEdge
                path={path}
                style={{
                    strokeWidth: EDGE_WIDTH,
                    ...style,
                    opacity: isCurrentDay ? 1 : OLD_EDGE_OPACITY,
                }}
                className="z-10"
                // markerEnd={data?.marker ? `url(#arrow-${id})` : ""}
            />
        </>
    );
};

export default EditorSmoothEdge;
