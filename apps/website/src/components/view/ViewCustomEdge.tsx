import { generatePath } from "@enreco-archive/common/utils/get-edge-svg-path";
import { FixedEdgeProps } from "@enreco-archive/common/types";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import "@/components/view/ViewCustomEdge.css";

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
    const pathRef = useRef<SVGPathElement>(null);
    const [maskBounds, setMaskBounds] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    
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

    useEffect(() => {
        if(pathRef.current) {
            const bbox = pathRef.current.getBBox();
            const padding = 20;
            setMaskBounds({
                x: bbox.x - padding,
                y: bbox.y - padding,
                width: bbox.width + padding * 2,
                height: bbox.height + padding * 2,
            });
        }
    }, [path, setMaskBounds]);

    console.log(id, isNewlyAdded);

    return (
        <>
            <defs>
                { isNewlyAdded && 
                    /* Mask for line drawing animation */
                    <mask 
                        id={maskId} 
                        maskUnits="userSpaceOnUse"
                        x={maskBounds.x}
                        y={maskBounds.y}
                        width={maskBounds.width}
                        height={maskBounds.height}
                    >
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
                mask={isNewlyAdded ? `url(#${maskId})` : undefined}
            >
                {/* Transparent click area */}
                <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={25}
                    strokeLinecap="round"
                />

                {/* Actual edge */}
                <path
                    ref={pathRef}
                    d={path}
                    style={{
                        transition: "opacity 1s, stroke-width .3s, stroke 1s",
                        ...style,
                    }}
                    className={cn({
                        "custom-edge": !selected,
                        "custom-edge-selected": selected,
                    })}
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
        </>
    );
};

export default memo(ViewCustomEdge);
