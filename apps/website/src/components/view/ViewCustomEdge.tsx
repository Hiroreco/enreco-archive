import { generatePath } from "@enreco-archive/common/utils/get-edge-svg-path";
import { FixedEdgeProps } from "@enreco-archive/common/types";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { memo, useMemo } from "react";

import "@/components/view/ViewCustomEdge.css";
import { BaseEdge } from "@xyflow/react";

const ViewCustomEdge = ({
    id,
    data,
    selectable,
    style,
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    selected,
}: FixedEdgeProps) => {
    const isNewlyAdded = data?.isNewlyAdded || false;
    const maskId = `${id}-newly-added-mask`;
    
    const path = useMemo(
        () =>
            generatePath(
                data?.pathType,
                data?.offsets,
                sourceX,
                sourceY,
                sourcePosition,
                targetX,
                targetY,
                targetPosition,
            ),
        [
            data?.offsets,
            data?.pathType,
            sourcePosition,
            sourceX,
            sourceY,
            targetPosition,
            targetX,
            targetY,
        ],
    );

    return (
        <g
            className={cn(
                "transition-all fill-none duration-1000 dark:brightness-[0.87]",
                {
                    "brightness-90 dark:brightness-50": data?.renderDimly,
                    "brightness-100": !data?.renderDimly,
                    "custom-edge-group cursor-pointer": selectable,
                    "cursor-default": !selectable,
                },
            )}
        >
            <defs>
                { isNewlyAdded && 
                    /* Mask for line drawing animation */
                    <mask id={maskId} maskUnits="userSpaceOnUse">
                        <path
                            d={path}
                            stroke="white"
                            strokeWidth={selected ? 7 : 5}
                            pathLength="1"
                            fill="none"
                            strokeLinecap="round"
                            className="new-custom-edge-mask-path"
                        />
                    </mask>
                }
            </defs>

            <BaseEdge
                path={path}
                interactionWidth={25}
                style={{
                    transition: "opacity 1s, stroke-width .3s, stroke 1s",
                    ...style,
                }}
                className={cn("custom-edge", { "custom-edge-selected": selected })}
                mask={isNewlyAdded ? `url(#${maskId})` : undefined}
            />

            {/* Animated light effect when selected */}
            {selected && (
                <path
                    d={path}
                    stroke="white"
                    strokeWidth={9}
                    strokeLinecap="round"
                    fill="none"
                    className="running-light"
                    style={{
                        filter: "drop-shadow(0 0 3px rgba(255,255,255,0.7))",
                    }}
                />
            )}
        </g>
    );
};

export default memo(ViewCustomEdge);
