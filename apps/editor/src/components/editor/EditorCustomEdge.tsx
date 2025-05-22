import { BaseEdge, EdgeLabelRenderer, useReactFlow } from "@xyflow/react";
import { useEffect, useRef } from "react";

import {
    CustomEdgeOffsets,
    CustomEdgeProps,
    CustomEdgeType,
    EditorImageNodeType,
} from "@enreco-archive/common/types";
import { EDGE_WIDTH, OLD_EDGE_OPACITY } from "@enreco-archive/common/constants";
import { generateOrthogonalEdgePath } from "@enreco-archive/common/utils/get-edge-svg-path";
import { produce } from "immer";
import { useEditorStore } from "@/store/editorStore";

//copied from reactflow lib - probably you can import this util directly from
function getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
}: {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
}) {
    const xOffset = Math.abs(targetX - sourceX) / 2;
    const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;

    const yOffset = Math.abs(targetY - sourceY) / 2;
    const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;

    return { centerX, centerY, xOffset, yOffset };
}

function drag(
    element: HTMLElement,
    allowHorizontalDragging: boolean,
    allowVerticalDragging: boolean,
    onDrag: (dx: number, dy: number) => void,
) {
    const prevClient = { x: 0, y: 0 };

    function dragMouseDown(event: MouseEvent) {
        event.preventDefault();
        prevClient.x = event.clientX;
        prevClient.y = event.clientY;
        document.addEventListener("mousemove", dragMouseMove);
        document.addEventListener("mouseup", dragMouseUp);
    }

    function dragMouseMove(event: MouseEvent) {
        event.preventDefault();

        const newX = event.clientX;
        const newY = event.clientY;
        let dx = 0,
            dy = 0;

        if (allowHorizontalDragging) {
            dx = prevClient.x - newX;
        }

        if (allowVerticalDragging) {
            dy = prevClient.y - newY;
        }

        prevClient.x = newX;
        prevClient.y = newY;

        onDrag(dx, dy);
    }

    function dragMouseUp(event: MouseEvent) {
        event.preventDefault();
        document.removeEventListener("mousemove", dragMouseMove);
        document.removeEventListener("mouseup", dragMouseUp);
    }

    element.addEventListener("mousedown", dragMouseDown);

    return () => element.removeEventListener("mousedown", dragMouseDown);
}

interface DragPointProps {
    isSelected: boolean | undefined;
    direction: "horizontal" | "vertical";
    x: number;
    y: number;
    onDrag: (newXPos: number, newYPos: number) => void;
}

const DRAG_POINT_WIDTH = 10;
const DRAG_POINT_HEIGHT = 10;
function DragPoint({
    isSelected = false,
    direction,
    x,
    y,
    onDrag,
}: DragPointProps) {
    const pointRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (pointRef.current) {
            return drag(
                pointRef.current,
                direction === "vertical",
                direction === "horizontal",
                onDrag,
            );
        }
    }, [direction, onDrag]);

    return (
        <div
            ref={pointRef}
            className="custom_point nodrag nopan bg-foreground"
            style={{
                position: "absolute",
                left: `${x - DRAG_POINT_WIDTH / 2}px`,
                top: `${y - DRAG_POINT_HEIGHT / 2}px`,
                opacity: isSelected ? 1 : 0.3,
                width: `${DRAG_POINT_WIDTH}px`,
                height: `${DRAG_POINT_HEIGHT}px`,
                pointerEvents: "all",
                borderRadius: "50%",
                cursor:
                    direction === "horizontal" ? "row-resize" : "col-resize",
            }}
        />
    );
}

const EMPTY_OFFSETS: CustomEdgeOffsets = {
    HL: 0,
    VL: 0,
    HC: 0,
    VR: 0,
    HR: 0,
};

/*
Anatomy of a custom edge
    
    |                              | 
    |--[HL]--|            |--[HR]--|
            [VL]        [VR]
              |---[HC]---|

[HL]/[HC]/[HR] are points that can adjust the Y position of the horizontal line segments.
[VL]/[VR] are points that can adjust the X position of the vertical line segments. Moving these points will cause
[HL]/[HR] and their line segments to spawn as well.

[HL]/[HR] only appear if [VL]/[VR] have been moved to spawn the other horizontal edges.
*/
const EditorCustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
    selected,
    style,
}: CustomEdgeProps) => {
    const { centerX, centerY, yOffset } = getEdgeCenter({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });
    const { day: currentDay } = useEditorStore();

    const { getZoom, setEdges, updateEdgeData } = useReactFlow<
        EditorImageNodeType,
        CustomEdgeType
    >();

    function onDraggedCommon() {
        setEdges((prev) => {
            return prev.map((edge) =>
                edge.id === id
                    ? { ...edge, selected: true }
                    : { ...edge, selected: false },
            );
        });
    }

    function onHLDragged(offset: number) {
        onDraggedCommon();

        offset /= getZoom();

        updateEdgeData(id, (prevEdge) => {
            if (prevEdge.data === undefined) {
                throw new Error(`${prevEdge} does not have a data object???`);
            }

            return produce(prevEdge.data, (draft) => {
                draft.offsets = {
                    ...EMPTY_OFFSETS,
                    ...prevEdge.data?.offsets,
                };
                draft.offsets.HL += offset;
            });
        });
    }

    function onVLDragged(offset: number) {
        onDraggedCommon();

        offset /= getZoom();

        updateEdgeData(id, (prevEdge) => {
            if (prevEdge.data === undefined) {
                throw new Error(`${prevEdge} does not have a data object???`);
            }

            return produce(prevEdge.data, (draft) => {
                draft.offsets = {
                    ...EMPTY_OFFSETS,
                    ...prevEdge.data?.offsets,
                };
                draft.offsets.VL += offset;
            });
        });
    }

    function onHCDragged(offset: number) {
        onDraggedCommon();

        offset /= getZoom();

        updateEdgeData(id, (prevEdge) => {
            if (prevEdge.data === undefined) {
                throw new Error(`${prevEdge} does not have a data object???`);
            }

            return produce(prevEdge.data, (draft) => {
                if (draft.offsets === undefined) {
                    draft.offsets = EMPTY_OFFSETS;
                }

                draft.offsets.HC += offset;
            });
        });
    }

    function onVRDragged(offset: number) {
        onDraggedCommon();

        offset /= getZoom();

        updateEdgeData(id, (prevEdge) => {
            if (prevEdge.data === undefined) {
                throw new Error(`${prevEdge} does not have a data object???`);
            }

            return produce(prevEdge.data, (draft) => {
                draft.offsets = {
                    ...EMPTY_OFFSETS,
                    ...prevEdge.data?.offsets,
                };
                draft.offsets.VR += offset;
            });
        });
    }

    function onHRDragged(offset: number) {
        onDraggedCommon();

        offset /= getZoom();

        updateEdgeData(id, (prevEdge) => {
            if (prevEdge.data === undefined) {
                throw new Error(`${prevEdge} does not have a data object???`);
            }

            return produce(prevEdge.data, (draft) => {
                draft.offsets = {
                    ...EMPTY_OFFSETS,
                    ...prevEdge.data?.offsets,
                };
                draft.offsets.HR += offset;
            });
        });
    }

    const offsets =
        data !== undefined && data.offsets != undefined
            ? data.offsets
            : EMPTY_OFFSETS;
    const {
        HL: hlOffset = 0,
        VL: vlOffset = 0,
        HC: hcOffset = 0,
        VR: vrOffset = 0,
        HR: hrOffset = 0,
    } = offsets;

    // generating the path
    const path = generateOrthogonalEdgePath(
        sourceX,
        sourceY,
        targetX,
        targetY,
        0,
        offsets,
    );

    const getTopBottomPointsY = (top: boolean) => {
        if (targetY < sourceY) {
            if (top) {
                return centerY - hcOffset + (yOffset + hcOffset + hlOffset) / 2;
            } else {
                return centerY - hcOffset - (yOffset - hcOffset - hrOffset) / 2;
            }
        } else {
            if (top) {
                return centerY - hcOffset - (yOffset - hcOffset - hlOffset) / 2;
            } else {
                return centerY - hcOffset + (yOffset + hcOffset + hrOffset) / 2;
            }
        }
    };

    const isCurrentDay = data?.day === currentDay || false;

    return (
        <>
            <BaseEdge
                key={id}
                path={path}
                style={{
                    strokeWidth: EDGE_WIDTH,
                    ...style,
                    opacity: isCurrentDay ? 1 : OLD_EDGE_OPACITY,
                }}
                className="z-10"
            />
            <EdgeLabelRenderer>
                {vlOffset !== 0 && (
                    <DragPoint
                        isSelected={selected}
                        direction={"horizontal"}
                        x={sourceX + vlOffset / 2}
                        y={sourceY + hlOffset}
                        onDrag={(_, newDY) => onHLDragged(-newDY)}
                    />
                )}
                <DragPoint
                    isSelected={selected}
                    direction={"vertical"}
                    x={sourceX + vlOffset}
                    y={getTopBottomPointsY(true)}
                    onDrag={(newDX) => onVLDragged(-newDX)}
                />
                <DragPoint
                    isSelected={selected}
                    direction={"horizontal"}
                    x={centerX + (vlOffset + vrOffset) / 2}
                    y={centerY - hcOffset}
                    onDrag={(_, newDY) => onHCDragged(newDY)}
                />
                <DragPoint
                    isSelected={selected}
                    direction={"vertical"}
                    x={targetX + vrOffset}
                    y={getTopBottomPointsY(false)}
                    onDrag={(newDX) => onVRDragged(-newDX)}
                />
                {vrOffset !== 0 && (
                    <DragPoint
                        isSelected={selected}
                        direction={"horizontal"}
                        x={targetX + vrOffset / 2}
                        y={targetY + hrOffset}
                        onDrag={(_, newDY) => onHRDragged(-newDY)}
                    />
                )}
            </EdgeLabelRenderer>
        </>
    );
};

export default EditorCustomEdge;
