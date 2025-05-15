import { EDGE_WIDTH } from "@/lib/constants";
import { CustomEdgeProps } from "@/lib/type";
import { useEditorStore } from "@/store/editorStore";

import { BaseEdge, getStraightPath } from "@xyflow/react";

const EditorStraightEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
    style,
}: CustomEdgeProps) => {
    const strokeColor = style?.stroke || "#000";
    const { day: currentDay } = useEditorStore();
    const isCurrentDay = data?.day === currentDay || false;

    const [path] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
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
                        className="stroke-[1]"
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
                    opacity: isCurrentDay ? 1 : 0.3,
                }}
                className="z-10"
                // markerEnd={data?.marker ? `url(#arrow-${id})` : ""}
            />
        </>
    );
};

export default EditorStraightEdge;
