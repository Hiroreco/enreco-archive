import { CustomEdgeOffsets } from "@/lib/type";
import { getSmoothStepPath, getStraightPath, Position } from "@xyflow/react";

// Function that generates the SVG path given start/end coords of the edges and all the offsets.
export function generateOrthogonalEdgePath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    padding: number,
    offsets: CustomEdgeOffsets,
) {
    // Calculate horizontal and vertical distances
    const dy = endY - startY;

    // Calculate the position for the horizontal line
    const horizontalY = startY + dy / 2 - offsets.HC;

    // Calculate the position for the vertical line
    const verticalX = endX - padding + offsets.VR;
    const verticalXT = startX - padding + offsets.VL;

    // Create a path string, draw the line all at once from left to right.
    // Do it like this to get a nice smooth line.
    let path = `M${startX},${startY} `;

    // Part of the line that gets drawn if HL and its line segment exists.
    if (offsets.VL !== 0) {
        path += `V${startY + offsets.HL} `;
        path += `H${verticalXT} `;
    }

    // Main part of the line
    path += `V${horizontalY} `;
    path += `H${verticalX} `;
    path += `V${endY + offsets.HR} `;

    // Part of the line that gets drawn if HR and its line segment exists.
    if (offsets.VR !== 0) {
        path += `H${endX} `;
        path += `V${endY} `;
    }

    return path.trim();
}

export function generatePath(
    pathType: string | undefined,
    offsets: CustomEdgeOffsets | undefined,
    sourceX: number,
    sourceY: number,
    sourcePosition: Position | undefined,
    targetX: number,
    targetY: number,
    targetPosition: Position | undefined,
) {
    if (pathType === "custom") {
        if (offsets === undefined) {
            throw new Error("offsets is undefined!");
        }

        const path = generateOrthogonalEdgePath(
            sourceX,
            sourceY,
            targetX,
            targetY,
            0,
            offsets,
        );

        return path;
    } else if (pathType === "smoothstep") {
        const [path] = getSmoothStepPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
            borderRadius: 0,
        });

        return path;
    } else if (pathType === "straight") {
        const [path] = getStraightPath({
            sourceX,
            sourceY,
            targetX,
            targetY,
        });

        return path;
    } else {
        throw new Error(`Unkwown pathType ${pathType}`);
    }
}
